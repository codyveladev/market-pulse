import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

vi.mock('../../services/yahoo.js', () => ({
  fetchYahooQuotes: vi.fn(),
}))

vi.mock('../../services/rss.js', () => ({
  fetchRssArticles: vi.fn(),
  RSS_FEEDS: ['https://feeds.finance.yahoo.com/rss/2.0/headline'],
}))

vi.mock('../../services/newsapi.js', () => ({
  fetchNewsApiArticles: vi.fn(),
}))

import { fetchYahooQuotes } from '../../services/yahoo.js'
import { fetchRssArticles } from '../../services/rss.js'
import { fetchNewsApiArticles } from '../../services/newsapi.js'

const mockYahoo = vi.mocked(fetchYahooQuotes)
const mockRss = vi.mocked(fetchRssArticles)
const mockNewsApi = vi.mocked(fetchNewsApiArticles)

describe('GET /api/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockYahoo.mockResolvedValue([{ symbol: '^GSPC', price: 5200, change: 10, changePercent: 0.19 }])
    mockRss.mockResolvedValue([{ title: 'Test', description: '', url: 'https://example.com', source: 'RSS', publishedAt: new Date().toISOString(), sectorIds: [] }])
    mockNewsApi.mockResolvedValue([{ title: 'Test', description: '', url: 'https://example.com', source: 'NewsAPI', publishedAt: new Date().toISOString(), sectorIds: [] }])
    process.env.NEWSAPI_KEY = 'test-key'
  })

  it('returns a StatusResponse with services array and checkedAt', async () => {
    const res = await request(app).get('/api/status')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('services')
    expect(res.body).toHaveProperty('checkedAt')
    expect(Array.isArray(res.body.services)).toBe(true)
  })

  it('returns ok status for Yahoo Finance when fetch succeeds', async () => {
    const res = await request(app).get('/api/status')
    const yahoo = res.body.services.find((s: { name: string }) => s.name === 'Yahoo Finance')
    expect(yahoo).toBeDefined()
    expect(yahoo.status).toBe('ok')
    expect(yahoo.message).toBe('Connected')
  })

  it('returns down status for Yahoo Finance when fetch fails', async () => {
    mockYahoo.mockResolvedValue([])
    const res = await request(app).get('/api/status')
    const yahoo = res.body.services.find((s: { name: string }) => s.name === 'Yahoo Finance')
    expect(yahoo.status).toBe('down')
    expect(yahoo.message).toBe('Down')
  })

  it('returns ok status for RSS Feeds when fetch succeeds', async () => {
    const res = await request(app).get('/api/status')
    const rss = res.body.services.find((s: { name: string }) => s.name === 'RSS Feeds')
    expect(rss).toBeDefined()
    expect(rss.status).toBe('ok')
    expect(rss.message).toBe('Connected')
  })

  it('returns down status for RSS Feeds when fetch returns empty', async () => {
    mockRss.mockResolvedValue([])
    const res = await request(app).get('/api/status')
    const rss = res.body.services.find((s: { name: string }) => s.name === 'RSS Feeds')
    expect(rss.status).toBe('down')
    expect(rss.message).toBe('Down')
  })

  it('returns ok status for NewsAPI when key is set and fetch succeeds', async () => {
    const res = await request(app).get('/api/status')
    const newsapi = res.body.services.find((s: { name: string }) => s.name === 'NewsAPI')
    expect(newsapi).toBeDefined()
    expect(newsapi.status).toBe('ok')
    expect(newsapi.message).toBe('Connected')
  })

  it('returns unconfigured status for NewsAPI when no API key', async () => {
    delete process.env.NEWSAPI_KEY
    const res = await request(app).get('/api/status')
    const newsapi = res.body.services.find((s: { name: string }) => s.name === 'NewsAPI')
    expect(newsapi.status).toBe('unconfigured')
    expect(newsapi.message).toBe('No API Key')
  })

  it('returns down status for NewsAPI when key is set but fetch fails', async () => {
    mockNewsApi.mockResolvedValue([])
    const res = await request(app).get('/api/status')
    const newsapi = res.body.services.find((s: { name: string }) => s.name === 'NewsAPI')
    expect(newsapi.status).toBe('down')
    expect(newsapi.message).toBe('Down')
  })

  it('reports unused integrations with key check', async () => {
    process.env.FINNHUB_KEY = 'test'
    delete process.env.ALPHA_VANTAGE_KEY
    const res = await request(app).get('/api/status')

    const finnhub = res.body.services.find((s: { name: string }) => s.name === 'Finnhub')
    expect(finnhub.status).toBe('unused')
    expect(finnhub.message).toBe('Not Implemented')

    const alpha = res.body.services.find((s: { name: string }) => s.name === 'Alpha Vantage')
    expect(alpha.status).toBe('unconfigured')
    expect(alpha.message).toBe('No API Key')

    delete process.env.FINNHUB_KEY
  })

  it('checks all 7 services', async () => {
    const res = await request(app).get('/api/status')
    expect(res.body.services).toHaveLength(7)
  })
})
