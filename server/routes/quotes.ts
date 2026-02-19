import { Router } from 'express'
import type { QuotesResponse } from '../../shared/types.js'
import { fetchYahooQuotes } from '../services/yahoo.js'
import { cacheService } from '../services/cache.js'

const DEFAULT_SYMBOLS = ['XLK', 'XLE', 'XLY', 'XLF', 'XLV', 'XLRE', 'GLD', 'XAR']
const QUOTE_CACHE_TTL = 60
const VALID_SYMBOL_RE = /^[\^]?[A-Z0-9][A-Z0-9.\-]{0,9}$/i

function isValidSymbol(s: string): boolean {
  return VALID_SYMBOL_RE.test(s)
}

const router = Router()

router.get('/', async (req, res) => {
  const symbolsParam = (req.query.symbols as string) ?? ''
  const symbols = symbolsParam ? symbolsParam.split(',').map((s) => s.trim()).filter((s) => s && isValidSymbol(s)) : DEFAULT_SYMBOLS

  if (symbols.length === 0) {
    res.json({ quotes: [], fetchedAt: new Date().toISOString() })
    return
  }

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
