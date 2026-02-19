import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchYahooQuotes } from '../yahoo.js'

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
