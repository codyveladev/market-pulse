import { Router } from 'express'
import type { QuotesResponse } from '../../shared/types.js'
import { fetchYahooQuotes } from '../services/yahoo.js'
import { cacheService } from '../services/cache.js'

const DEFAULT_SYMBOLS = ['XLK', 'XLE', 'XLY', 'XLF', 'XLV', 'XLRE', 'GLD', 'XAR']
const QUOTE_CACHE_TTL = 60

const router = Router()

router.get('/', async (req, res) => {
  const symbolsParam = (req.query.symbols as string) ?? ''
  const symbols = symbolsParam ? symbolsParam.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_SYMBOLS

  let quotes
  try {
    quotes = await cacheService.getOrFetch(
      `quotes:${[...symbols].sort().join(',')}`,
      () => fetchYahooQuotes(symbols),
      QUOTE_CACHE_TTL
    )
  } catch {
    quotes = []
  }

  const response: QuotesResponse = {
    quotes,
    fetchedAt: new Date().toISOString(),
  }

  res.json(response)
})

export default router
