import { Router } from 'express'
import type { ResearchResponse } from '../../shared/types.js'
import { fetchYahooStockOverview } from '../services/yahoo.js'
import { fetchFinnhubProfile, fetchFinnhubFinancials, fetchFinnhubCompanyNews } from '../services/finnhub.js'
import { cacheService } from '../services/cache.js'

const VALID_SYMBOL_RE = /^[\^]?[A-Z0-9][A-Z0-9.\-]{0,9}$/i
const RESEARCH_CACHE_TTL = 120

const router = Router()

router.get('/', async (req, res) => {
  const symbol = ((req.query.symbol as string) ?? '').trim().toUpperCase()

  if (!symbol || !VALID_SYMBOL_RE.test(symbol)) {
    res.status(400).json({ error: 'Invalid or missing symbol' })
    return
  }

  try {
    const data = await cacheService.getOrFetch(`research:${symbol}`, async () => {
      const [overview, profile, financials, news] = await Promise.allSettled([
        fetchYahooStockOverview(symbol),
        fetchFinnhubProfile(symbol),
        fetchFinnhubFinancials(symbol),
        fetchFinnhubCompanyNews(symbol),
      ])

      return {
        overview: overview.status === 'fulfilled' ? overview.value : null,
        profile: profile.status === 'fulfilled' ? profile.value : null,
        financials: financials.status === 'fulfilled' ? financials.value : null,
        news: news.status === 'fulfilled' ? news.value : [],
      }
    }, RESEARCH_CACHE_TTL)

    const response: ResearchResponse = {
      ...data,
      fetchedAt: new Date().toISOString(),
    }

    res.json(response)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
