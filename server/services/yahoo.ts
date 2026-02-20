import type { QuoteData, StockOverview } from '../../shared/types.js'

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

async function fetchSingleQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const response = await fetch(
      `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
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
      name: meta.shortName ?? undefined,
      dayHigh: meta.regularMarketDayHigh ?? undefined,
      dayLow: meta.regularMarketDayLow ?? undefined,
    }
  } catch {
    return null
  }
}

export async function fetchYahooStockOverview(symbol: string): Promise<StockOverview | null> {
  try {
    const response = await fetch(
      `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=3mo`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!response.ok) return null

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    const meta = result?.meta
    if (!meta || meta.regularMarketPrice == null) return null

    const price = meta.regularMarketPrice
    const prevClose = meta.chartPreviousClose ?? price
    const change = price - prevClose
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0

    const closePrices: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? []
    const chartData = closePrices.filter((v): v is number => v != null)

    return {
      symbol: meta.symbol ?? symbol,
      name: meta.shortName ?? meta.longName ?? symbol,
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
      marketCap: meta.marketCap ?? null,
      volume: meta.regularMarketVolume ?? null,
      chartData,
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
