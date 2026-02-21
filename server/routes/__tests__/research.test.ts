import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

vi.mock('../../services/yahoo.js', () => ({
  fetchYahooQuotes: vi.fn(),
  fetchYahooStockOverview: vi.fn(),
}))

vi.mock('../../services/finnhub.js', () => ({
  fetchFinnhubProfile: vi.fn(),
  fetchFinnhubFinancials: vi.fn(),
  fetchFinnhubCompanyNews: vi.fn(),
}))

vi.mock('../../services/alphaVantage.js', () => ({
  fetchAlphaVantageOverview: vi.fn(),
}))

vi.mock('../../services/cache.js', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    getOrFetch: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

import { fetchYahooStockOverview } from '../../services/yahoo.js'
import { fetchFinnhubProfile, fetchFinnhubFinancials, fetchFinnhubCompanyNews } from '../../services/finnhub.js'
import { fetchAlphaVantageOverview } from '../../services/alphaVantage.js'

const mockYahoo = vi.mocked(fetchYahooStockOverview)
const mockProfile = vi.mocked(fetchFinnhubProfile)
const mockFinancials = vi.mocked(fetchFinnhubFinancials)
const mockNews = vi.mocked(fetchFinnhubCompanyNews)
const mockAlphaVantage = vi.mocked(fetchAlphaVantageOverview)

const mockFundamentals = {
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
}

const mockOverview = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 189.84,
  change: 2.34,
  changePercent: 1.25,
  dayHigh: 191.0,
  dayLow: 188.0,
  fiftyTwoWeekHigh: 199.62,
  fiftyTwoWeekLow: 124.17,
  marketCap: 2870000000000,
  volume: 48200000,
  chartData: [185, 186, 187, 188, 189],
  chartDates: ['2024-11-01', '2024-11-04', '2024-11-05', '2024-11-06', '2024-11-07'],
}

describe('GET /api/research', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockYahoo.mockResolvedValue(mockOverview)
    mockProfile.mockResolvedValue({ name: 'Apple Inc', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: 2870000 })
    mockFinancials.mockResolvedValue({ peRatio: 31.2, eps: 6.13, beta: 1.29, dividendYield: 0.55 })
    mockNews.mockResolvedValue([{ headline: 'News', summary: 'Summary', url: 'https://example.com', source: 'Reuters', datetime: 1708300800, image: null }])
    mockAlphaVantage.mockResolvedValue(mockFundamentals)
  })

  it('returns ResearchResponse shape with all fields', async () => {
    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('overview')
    expect(res.body).toHaveProperty('profile')
    expect(res.body).toHaveProperty('financials')
    expect(res.body).toHaveProperty('fundamentals')
    expect(res.body).toHaveProperty('news')
    expect(res.body).toHaveProperty('fetchedAt')
    expect(res.body.overview.symbol).toBe('AAPL')
  })

  it('returns 400 when symbol query param is missing', async () => {
    const res = await request(app).get('/api/research')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/invalid|missing/i)
  })

  it('returns 400 when symbol fails SSRF regex validation', async () => {
    const res = await request(app).get('/api/research?symbol=../etc/passwd')
    expect(res.status).toBe(400)
    expect(mockYahoo).not.toHaveBeenCalled()
  })

  it('rejects URLs as symbols', async () => {
    const res = await request(app).get('/api/research?symbol=http://evil.com')
    expect(res.status).toBe(400)
    expect(mockYahoo).not.toHaveBeenCalled()
  })

  it('returns data with profile: null when Finnhub fails', async () => {
    mockProfile.mockResolvedValue(null)

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.overview).not.toBeNull()
    expect(res.body.profile).toBeNull()
  })

  it('returns data with financials: null when Finnhub fails', async () => {
    mockFinancials.mockResolvedValue(null)

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.financials).toBeNull()
  })

  it('returns overview: null when Yahoo fails', async () => {
    mockYahoo.mockResolvedValue(null)

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.overview).toBeNull()
  })

  it('falls back to Finnhub marketCapitalization when Yahoo marketCap is null', async () => {
    mockYahoo.mockResolvedValue({ ...mockOverview, marketCap: null })
    mockProfile.mockResolvedValue({ name: 'Apple Inc', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: 2870000 })

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.overview.marketCap).toBe(2870000 * 1_000_000)
  })

  it('keeps overview.marketCap null when both Yahoo and Finnhub have no value', async () => {
    mockYahoo.mockResolvedValue({ ...mockOverview, marketCap: null })
    mockProfile.mockResolvedValue({ name: 'Apple Inc', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: null })

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.overview.marketCap).toBeNull()
  })

  it('returns fundamentals from Alpha Vantage', async () => {
    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.fundamentals).toEqual(mockFundamentals)
  })

  it('returns fundamentals: null when Alpha Vantage fails', async () => {
    mockAlphaVantage.mockRejectedValue(new Error('AV down'))

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.fundamentals).toBeNull()
    expect(res.body.overview).not.toBeNull()
  })

  it('returns empty news array when Finnhub news fails', async () => {
    mockNews.mockRejectedValue(new Error('Finnhub down'))

    const res = await request(app).get('/api/research?symbol=AAPL')
    expect(res.status).toBe(200)
    expect(res.body.news).toEqual([])
  })

  it('handles case-insensitive symbols', async () => {
    await request(app).get('/api/research?symbol=aapl')
    expect(mockYahoo).toHaveBeenCalledWith('AAPL')
  })

  it('passes uppercased symbol to all services', async () => {
    await request(app).get('/api/research?symbol=aapl')
    expect(mockProfile).toHaveBeenCalledWith('AAPL')
    expect(mockFinancials).toHaveBeenCalledWith('AAPL')
    expect(mockNews).toHaveBeenCalledWith('AAPL')
  })
})
