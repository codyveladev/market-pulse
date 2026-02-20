import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchFinnhubProfile, fetchFinnhubFinancials, fetchFinnhubCompanyNews } from '../finnhub.js'

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('fetchFinnhubProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.FINNHUB_KEY = 'test-key'
  })

  it('returns CompanyProfile with all fields', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      name: 'Apple Inc',
      logo: 'https://logo.clearbit.com/apple.com',
      finnhubIndustry: 'Technology',
      country: 'US',
      weburl: 'https://apple.com',
      marketCapitalization: 2870000,
    }))

    const result = await fetchFinnhubProfile('AAPL')
    expect(result).toEqual({
      name: 'Apple Inc',
      logo: 'https://logo.clearbit.com/apple.com',
      industry: 'Technology',
      country: 'US',
      weburl: 'https://apple.com',
      marketCapitalization: 2870000,
    })
  })

  it('passes token query param from FINNHUB_KEY', async () => {
    mockFetch.mockReturnValue(jsonResponse({ name: 'Apple Inc' }))

    await fetchFinnhubProfile('AAPL')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('token=test-key')
    expect(url).toContain('symbol=AAPL')
  })

  it('returns null when FINNHUB_KEY is not set', async () => {
    delete process.env.FINNHUB_KEY

    const result = await fetchFinnhubProfile('AAPL')
    expect(result).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null on API error', async () => {
    mockFetch.mockReturnValue(jsonResponse({}, 500))

    const result = await fetchFinnhubProfile('AAPL')
    expect(result).toBeNull()
  })

  it('returns null on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const result = await fetchFinnhubProfile('AAPL')
    expect(result).toBeNull()
  })
})

describe('fetchFinnhubFinancials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.FINNHUB_KEY = 'test-key'
  })

  it('returns CompanyFinancials with metrics', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      metric: {
        peBasicExclExtraTTM: 31.2,
        epsBasicExclExtraItemsTTM: 6.13,
        beta: 1.29,
        dividendYieldIndicatedAnnual: 0.55,
      },
    }))

    const result = await fetchFinnhubFinancials('AAPL')
    expect(result).toEqual({
      peRatio: 31.2,
      eps: 6.13,
      beta: 1.29,
      dividendYield: 0.55,
    })
  })

  it('returns null when FINNHUB_KEY is not set', async () => {
    delete process.env.FINNHUB_KEY

    const result = await fetchFinnhubFinancials('AAPL')
    expect(result).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null on API error', async () => {
    mockFetch.mockReturnValue(jsonResponse({}, 500))

    const result = await fetchFinnhubFinancials('AAPL')
    expect(result).toBeNull()
  })

  it('returns all-null fields when metric data is missing', async () => {
    mockFetch.mockReturnValue(jsonResponse({ metric: {} }))

    const result = await fetchFinnhubFinancials('AAPL')
    expect(result).toEqual({
      peRatio: null,
      eps: null,
      beta: null,
      dividendYield: null,
    })
  })
})

describe('fetchFinnhubCompanyNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.FINNHUB_KEY = 'test-key'
  })

  it('returns array of CompanyNewsArticle', async () => {
    mockFetch.mockReturnValue(jsonResponse([
      {
        headline: 'Apple beats earnings',
        summary: 'Strong quarter for AAPL',
        url: 'https://example.com/1',
        source: 'Reuters',
        datetime: 1708300800,
        image: 'https://example.com/img.jpg',
      },
    ]))

    const result = await fetchFinnhubCompanyNews('AAPL')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      headline: 'Apple beats earnings',
      summary: 'Strong quarter for AAPL',
      url: 'https://example.com/1',
      source: 'Reuters',
      datetime: 1708300800,
      image: 'https://example.com/img.jpg',
    })
  })

  it('returns empty array when FINNHUB_KEY is not set', async () => {
    delete process.env.FINNHUB_KEY

    const result = await fetchFinnhubCompanyNews('AAPL')
    expect(result).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns empty array on API error', async () => {
    mockFetch.mockReturnValue(jsonResponse({}, 500))

    const result = await fetchFinnhubCompanyNews('AAPL')
    expect(result).toEqual([])
  })
})
