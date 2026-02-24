import { Router } from 'express'
import type { ResearchResponse } from '../../shared/types.js'
import { fetchYahooStockOverview } from '../services/yahoo.js'
import { fetchFinnhubProfile, fetchFinnhubFinancials, fetchFinnhubCompanyNews } from '../services/finnhub.js'
import { fetchAlphaVantageOverview } from '../services/alphaVantage.js'
import { streamAnalysis, isConfigured as isGeminiConfigured } from '../services/gemini.js'
import { cacheService } from '../services/cache.js'

const VALID_SYMBOL_RE = /^[\^]?[A-Z0-9][A-Z0-9.\-]{0,9}$/i
const RESEARCH_CACHE_TTL = 120
const AI_CACHE_TTL = 900 // 15 minutes

const router = Router()

async function fetchResearchData(symbol: string): Promise<Omit<ResearchResponse, 'fetchedAt'>> {
  const [overview, profile, financials, news, av] = await Promise.allSettled([
    fetchYahooStockOverview(symbol),
    fetchFinnhubProfile(symbol),
    fetchFinnhubFinancials(symbol),
    fetchFinnhubCompanyNews(symbol),
    fetchAlphaVantageOverview(symbol),
  ])

  const rawOverview = overview.status === 'fulfilled' ? overview.value : null
  const rawProfile = profile.status === 'fulfilled' ? profile.value : null

  // Yahoo chart API doesn't return marketCap — fall back to Finnhub profile (millions USD → full value)
  const mergedOverview =
    rawOverview != null && rawOverview.marketCap == null && rawProfile?.marketCapitalization != null
      ? { ...rawOverview, marketCap: rawProfile.marketCapitalization * 1_000_000 }
      : rawOverview

  return {
    overview: mergedOverview,
    profile: rawProfile,
    financials: financials.status === 'fulfilled' ? financials.value : null,
    fundamentals: av.status === 'fulfilled' ? av.value : null,
    news: news.status === 'fulfilled' ? news.value : [],
  }
}

router.get('/', async (req, res) => {
  const symbol = ((req.query.symbol as string) ?? '').trim().toUpperCase()

  if (!symbol || !VALID_SYMBOL_RE.test(symbol)) {
    res.status(400).json({ error: 'Invalid or missing symbol' })
    return
  }

  try {
    const data = await cacheService.getOrFetch(
      `research:${symbol}`,
      () => fetchResearchData(symbol),
      RESEARCH_CACHE_TTL,
    )

    const response: ResearchResponse = {
      ...data,
      fetchedAt: new Date().toISOString(),
    }

    res.json(response)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/ai', async (req, res) => {
  const symbol = ((req.query.symbol as string) ?? '').trim().toUpperCase()

  // SSE headers — must be set before any writes so EventSource connects
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()

  if (!symbol || !VALID_SYMBOL_RE.test(symbol)) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Invalid or missing stock symbol' })}\n\n`)
    res.end()
    return
  }

  if (!isGeminiConfigured()) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'AI analysis unavailable — GEMINI_KEY not configured' })}\n\n`)
    res.end()
    return
  }

  // Check cache (skip if regenerate requested)
  const cacheKey = `ai-analysis:${symbol}`
  const forceRegenerate = req.query.regenerate === '1'

  if (!forceRegenerate) {
    const cached = cacheService.get<string>(cacheKey)
    if (cached) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: cached })}\n\n`)
      res.write(`data: ${JSON.stringify({ type: 'done', cached: true })}\n\n`)
      res.end()
      return
    }
  }

  try {
    const data = await cacheService.getOrFetch(
      `research:${symbol}`,
      () => fetchResearchData(symbol),
      RESEARCH_CACHE_TTL,
    )

    if (!data.overview && !data.financials && !data.fundamentals) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'No stock data available for analysis' })}\n\n`)
      res.end()
      return
    }

    let fullText = ''
    let closed = false

    req.on('close', () => { closed = true })

    for await (const chunk of streamAnalysis({ ...data, fetchedAt: new Date().toISOString() })) {
      if (closed) break
      fullText += chunk
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
    }

    if (!closed) {
      cacheService.set(cacheKey, fullText, AI_CACHE_TTL)
      res.write(`data: ${JSON.stringify({ type: 'done', cached: false })}\n\n`)
      res.end()
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI analysis failed'
    res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`)
    res.end()
  }
})

export default router
