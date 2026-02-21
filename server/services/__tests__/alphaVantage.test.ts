import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('../cache.js', () => ({
  cacheService: {
    getOrFetch: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

import { fetchAlphaVantageOverview } from '../alphaVantage.js'
import { cacheService } from '../cache.js'

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

const fullResponse = {
  Symbol: 'IBM',
  Name: 'International Business Machines',
  PEGRatio: '2.237',
  ForwardPE: '21.01',
  PriceToBookRatio: '7.51',
  PriceToSalesRatioTTM: '3.547',
  EVToRevenue: '4.375',
  EVToEBITDA: '17.09',
  ProfitMargin: '0.157',
  OperatingMarginTTM: '0.231',
  ReturnOnEquityTTM: '0.352',
  ReturnOnAssetsTTM: '0.0508',
  QuarterlyRevenueGrowthYOY: '0.122',
  QuarterlyEarningsGrowthYOY: '0.9',
  AnalystTargetPrice: '324.95',
  AnalystRatingStrongBuy: '1',
  AnalystRatingBuy: '9',
  AnalystRatingHold: '8',
  AnalystRatingSell: '2',
  AnalystRatingStrongSell: '1',
}

describe('fetchAlphaVantageOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ALPHA_VANTAGE_KEY = 'test-key'
  })

  it('returns FundamentalData with all fields parsed from strings', async () => {
    mockFetch.mockReturnValue(jsonResponse(fullResponse))

    const result = await fetchAlphaVantageOverview('IBM')
    expect(result).toEqual({
      pegRatio: 2.237,
      forwardPE: 21.01,
      priceToBook: 7.51,
      priceToSales: 3.547,
      evToRevenue: 4.375,
      evToEbitda: 17.09,
      profitMargin: 0.157,
      operatingMargin: 0.231,
      returnOnEquity: 0.352,
      returnOnAssets: 0.0508,
      quarterlyRevenueGrowth: 0.122,
      quarterlyEarningsGrowth: 0.9,
      analystTargetPrice: 324.95,
      analystStrongBuy: 1,
      analystBuy: 9,
      analystHold: 8,
      analystSell: 2,
      analystStrongSell: 1,
    })
  })

  it('passes symbol and apikey in query params', async () => {
    mockFetch.mockReturnValue(jsonResponse(fullResponse))

    await fetchAlphaVantageOverview('AAPL')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('symbol=AAPL')
    expect(url).toContain('apikey=test-key')
    expect(url).toContain('function=OVERVIEW')
  })

  it('returns null when ALPHA_VANTAGE_KEY is not set', async () => {
    delete process.env.ALPHA_VANTAGE_KEY

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when API returns rate-limit Note', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      Note: 'Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day.',
    }))

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
  })

  it('returns null when API returns Error Message', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      'Error Message': 'Invalid API call.',
    }))

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
  })

  it('returns null on HTTP error', async () => {
    mockFetch.mockReturnValue(jsonResponse({}, 500))

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
  })

  it('returns null on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
  })

  it('maps "None" string values to null', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      ...fullResponse,
      PEGRatio: 'None',
      ForwardPE: '-',
      ReturnOnEquityTTM: 'None',
    }))

    const result = await fetchAlphaVantageOverview('IBM')
    expect(result!.pegRatio).toBeNull()
    expect(result!.forwardPE).toBeNull()
    expect(result!.returnOnEquity).toBeNull()
  })

  it('uses 24h cache TTL via cacheService', async () => {
    mockFetch.mockReturnValue(jsonResponse(fullResponse))

    await fetchAlphaVantageOverview('IBM')
    expect(cacheService.getOrFetch).toHaveBeenCalledWith(
      'av-overview:IBM',
      expect.any(Function),
      86400,
    )
  })

  it('returns null when response has no Symbol field', async () => {
    mockFetch.mockReturnValue(jsonResponse({ Information: 'Some message' }))

    const result = await fetchAlphaVantageOverview('AAPL')
    expect(result).toBeNull()
  })
})
