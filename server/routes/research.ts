import { Router } from 'express'
import type { ResearchResponse } from '../../shared/types.js'
import { fetchYahooStockOverview } from '../services/yahoo.js'
import { fetchFinnhubProfile, fetchFinnhubFinancials, fetchFinnhubCompanyNews } from '../services/finnhub.js'
import { fetchAlphaVantageOverview } from '../services/alphaVantage.js'
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
