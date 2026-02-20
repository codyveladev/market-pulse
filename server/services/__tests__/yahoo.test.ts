import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchYahooQuotes, fetchYahooStockOverview } from '../yahoo.js'

function chartResponse(meta: Record<string, unknown>, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({
      chart: {
        result: [{ meta }],
        error: null,
      },
    }),
  })
}

describe('fetchYahooQuotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized QuoteData from v8 chart endpoint', async () => {
    mockFetch.mockReturnValue(chartResponse({
      symbol: 'XLK',
      shortName: 'Technology Select Sector',
      regularMarketPrice: 200.5,
      chartPreviousClose: 198.0,
      regularMarketDayHigh: 202.0,
      regularMarketDayLow: 197.5,
    }))

    const quotes = await fetchYahooQuotes(['XLK'])
    expect(quotes).toHaveLength(1)
    expect(quotes[0].symbol).toBe('XLK')
    expect(quotes[0].price).toBe(200.5)
    expect(quotes[0].change).toBe(2.5)
    expect(quotes[0].changePercent).toBeCloseTo(1.26, 1)
    expect(quotes[0].name).toBe('Technology Select Sector')
    expect(quotes[0].dayHigh).toBe(202.0)
    expect(quotes[0].dayLow).toBe(197.5)
  })

  it('returns undefined for optional fields when not present in response', async () => {
    mockFetch.mockReturnValue(chartResponse({
      symbol: 'XLK',
      regularMarketPrice: 200.5,
      chartPreviousClose: 198.0,
    }))

    const quotes = await fetchYahooQuotes(['XLK'])
    expect(quotes).toHaveLength(1)
    expect(quotes[0].name).toBeUndefined()
    expect(quotes[0].dayHigh).toBeUndefined()
    expect(quotes[0].dayLow).toBeUndefined()
  })

  it('fetches each symbol individually via v8 chart URL', async () => {
    mockFetch.mockReturnValue(chartResponse({
      symbol: 'XLK', regularMarketPrice: 200, chartPreviousClose: 198,
    }))

    await fetchYahooQuotes(['XLK', 'XLE'])
    expect(mockFetch).toHaveBeenCalledTimes(2)

    const url1 = mockFetch.mock.calls[0][0] as string
    const url2 = mockFetch.mock.calls[1][0] as string
    expect(url1).toContain('/chart/XLK')
    expect(url2).toContain('/chart/XLE')
  })

  it('sends User-Agent header', async () => {
    mockFetch.mockReturnValue(chartResponse({
      symbol: 'XLK', regularMarketPrice: 200, chartPreviousClose: 198,
    }))

    await fetchYahooQuotes(['XLK'])
    const options = mockFetch.mock.calls[0][1] as { headers: Record<string, string> }
    expect(options.headers['User-Agent']).toBe('Mozilla/5.0')
  })

  it('returns empty array for empty symbols list', async () => {
    const quotes = await fetchYahooQuotes([])
    expect(quotes).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns empty array on API error', async () => {
    mockFetch.mockReturnValue(chartResponse({}, 500))

    const quotes = await fetchYahooQuotes(['XLK'])
    expect(quotes).toEqual([])
  })

  it('returns empty array on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const quotes = await fetchYahooQuotes(['XLK'])
    expect(quotes).toEqual([])
  })

  it('handles multiple symbols with mixed results', async () => {
    mockFetch
      .mockReturnValueOnce(chartResponse({
        symbol: 'XLK', regularMarketPrice: 200, chartPreviousClose: 198,
      }))
      .mockReturnValueOnce(chartResponse({
        symbol: 'XLE', regularMarketPrice: 85, chartPreviousClose: 86.5,
      }))

    const quotes = await fetchYahooQuotes(['XLK', 'XLE'])
    expect(quotes).toHaveLength(2)
    expect(quotes[0].symbol).toBe('XLK')
    expect(quotes[0].change).toBeGreaterThan(0)
    expect(quotes[1].symbol).toBe('XLE')
    expect(quotes[1].change).toBeLessThan(0)
  })

  it('URL-encodes symbols in the fetch URL', async () => {
    mockFetch.mockReturnValue(chartResponse({
      symbol: '^GSPC', regularMarketPrice: 5200, chartPreviousClose: 5180,
    }))

    await fetchYahooQuotes(['^GSPC'])
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/chart/%5EGSPC')
    expect(url).not.toContain('/chart/^GSPC')
  })

  it('skips symbols with missing price data', async () => {
    mockFetch
      .mockReturnValueOnce(chartResponse({
        symbol: 'XLK', regularMarketPrice: 200, chartPreviousClose: 198,
      }))
      .mockReturnValueOnce(chartResponse({
        symbol: 'BAD', regularMarketPrice: null,
      }))

    const quotes = await fetchYahooQuotes(['XLK', 'BAD'])
    expect(quotes).toHaveLength(1)
    expect(quotes[0].symbol).toBe('XLK')
  })
})

function chartResponseWithIndicators(
  meta: Record<string, unknown>,
  closePrices: (number | null)[] = [],
  status = 200,
) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({
      chart: {
        result: [{
          meta,
          indicators: { quote: [{ close: closePrices }] },
        }],
        error: null,
      },
    }),
  })
}

describe('fetchYahooStockOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns StockOverview with all fields from v8 chart meta', async () => {
    mockFetch.mockReturnValue(chartResponseWithIndicators({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      regularMarketPrice: 189.84,
      chartPreviousClose: 187.5,
      regularMarketDayHigh: 191.0,
      regularMarketDayLow: 188.0,
      fiftyTwoWeekHigh: 199.62,
      fiftyTwoWeekLow: 124.17,
      marketCap: 2870000000000,
      regularMarketVolume: 48200000,
    }, [185, 186, 187, 188, 189]))

    const result = await fetchYahooStockOverview('AAPL')
    expect(result).not.toBeNull()
    expect(result!.symbol).toBe('AAPL')
    expect(result!.name).toBe('Apple Inc.')
    expect(result!.price).toBe(189.84)
    expect(result!.change).toBeCloseTo(2.34, 1)
    expect(result!.changePercent).toBeCloseTo(1.25, 1)
    expect(result!.dayHigh).toBe(191.0)
    expect(result!.dayLow).toBe(188.0)
    expect(result!.fiftyTwoWeekHigh).toBe(199.62)
    expect(result!.fiftyTwoWeekLow).toBe(124.17)
    expect(result!.marketCap).toBe(2870000000000)
    expect(result!.volume).toBe(48200000)
  })

  it('returns chartData from indicators.quote[0].close, filtering nulls', async () => {
    mockFetch.mockReturnValue(chartResponseWithIndicators({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      regularMarketPrice: 189.84,
      chartPreviousClose: 187.5,
    }, [185, null, 187, null, 189]))

    const result = await fetchYahooStockOverview('AAPL')
    expect(result!.chartData).toEqual([185, 187, 189])
  })

  it('uses range=3mo&interval=1d for chart data', async () => {
    mockFetch.mockReturnValue(chartResponseWithIndicators({
      symbol: 'AAPL', regularMarketPrice: 189, chartPreviousClose: 187,
    }))

    await fetchYahooStockOverview('AAPL')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('interval=1d')
    expect(url).toContain('range=3mo')
  })

  it('returns null on API error', async () => {
    mockFetch.mockReturnValue(chartResponseWithIndicators({}, [], 500))

    const result = await fetchYahooStockOverview('AAPL')
    expect(result).toBeNull()
  })

  it('returns null on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const result = await fetchYahooStockOverview('AAPL')
    expect(result).toBeNull()
  })

  it('returns null when meta has no regularMarketPrice', async () => {
    mockFetch.mockReturnValue(chartResponseWithIndicators({
      symbol: 'BAD', regularMarketPrice: null,
    }))

    const result = await fetchYahooStockOverview('BAD')
    expect(result).toBeNull()
  })
})
