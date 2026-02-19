import type { QuoteData } from '../../shared/types.js'

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

async function fetchSingleQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const response = await fetch(
      `${YAHOO_CHART_URL}/${symbol}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!response.ok) return null

    const data = await response.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta || meta.regularMarketPrice == null) return null

    const price = meta.regularMarketPrice
    const prevClose = meta.chartPreviousClose ?? price
    const change = price - prevClose
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0

    return {
      symbol: meta.symbol ?? symbol,
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    }
  } catch {
    return null
  }
}

export async function fetchYahooQuotes(symbols: string[]): Promise<QuoteData[]> {
  if (symbols.length === 0) return []

  const results = await Promise.allSettled(symbols.map(fetchSingleQuote))
  const quotes: QuoteData[] = []

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      quotes.push(result.value)
    }
  }

  return quotes
}
