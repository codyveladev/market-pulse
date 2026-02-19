import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

vi.mock('../../services/yahoo.js', () => ({
  fetchYahooQuotes: vi.fn(),
}))

vi.mock('../../services/cache.js', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    getOrFetch: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

import { fetchYahooQuotes } from '../../services/yahoo.js'

const mockFetchYahoo = vi.mocked(fetchYahooQuotes)

describe('GET /api/quotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchYahoo.mockResolvedValue([])
  })

  it('returns a QuotesResponse with quotes array and fetchedAt', async () => {
    const res = await request(app).get('/api/quotes')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('quotes')
    expect(res.body).toHaveProperty('fetchedAt')
    expect(Array.isArray(res.body.quotes)).toBe(true)
  })

  it('passes symbols query param to Yahoo fetcher', async () => {
    await request(app).get('/api/quotes?symbols=XLK,XLE,XLF')
    expect(mockFetchYahoo).toHaveBeenCalledWith(['XLK', 'XLE', 'XLF'])
  })

  it('uses default sector ETF symbols when no symbols param provided', async () => {
    await request(app).get('/api/quotes')
    expect(mockFetchYahoo).toHaveBeenCalledOnce()
    const symbols = mockFetchYahoo.mock.calls[0][0]
    expect(symbols.length).toBeGreaterThan(0)
    expect(symbols).toContain('XLK')
  })

  it('returns quote data from Yahoo service', async () => {
    mockFetchYahoo.mockResolvedValue([
      { symbol: 'XLK', price: 200.5, change: 3.25, changePercent: 1.65 },
    ])

    const res = await request(app).get('/api/quotes?symbols=XLK')
    expect(res.body.quotes).toHaveLength(1)
    expect(res.body.quotes[0]).toMatchObject({
      symbol: 'XLK',
      price: 200.5,
      changePercent: 1.65,
    })
  })

  it('handles Yahoo service failure gracefully', async () => {
    mockFetchYahoo.mockRejectedValue(new Error('Yahoo down'))

    const res = await request(app).get('/api/quotes?symbols=XLK')
    expect(res.status).toBe(200)
    expect(res.body.quotes).toEqual([])
  })

  it('rejects symbols with path traversal', async () => {
    const res = await request(app).get('/api/quotes?symbols=../etc/passwd')
    expect(res.body.quotes).toEqual([])
    expect(mockFetchYahoo).not.toHaveBeenCalled()
  })

  it('rejects symbols with URLs', async () => {
    const res = await request(app).get('/api/quotes?symbols=http://evil.com')
    expect(res.body.quotes).toEqual([])
    expect(mockFetchYahoo).not.toHaveBeenCalled()
  })

  it('allows valid symbols including indices and hyphenated tickers', async () => {
    await request(app).get('/api/quotes?symbols=AAPL,^GSPC,BRK-B,BF.B')
    expect(mockFetchYahoo).toHaveBeenCalledWith(['AAPL', '^GSPC', 'BRK-B', 'BF.B'])
  })

  it('strips invalid symbols but keeps valid ones from mixed input', async () => {
    await request(app).get('/api/quotes?symbols=AAPL,../hack,MSFT')
    expect(mockFetchYahoo).toHaveBeenCalledWith(['AAPL', 'MSFT'])
  })
})
