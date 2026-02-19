import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

// Mock the services
vi.mock('../../services/newsapi.js', () => ({
  fetchNewsApiArticles: vi.fn(),
}))

vi.mock('../../services/rss.js', () => ({
  fetchRssArticles: vi.fn(),
}))

vi.mock('../../services/cache.js', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    getOrFetch: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

import { fetchNewsApiArticles } from '../../services/newsapi.js'
import { fetchRssArticles } from '../../services/rss.js'

const mockFetchNewsApi = vi.mocked(fetchNewsApiArticles)
const mockFetchRss = vi.mocked(fetchRssArticles)

function makeArticle(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test headline',
    description: 'Test description',
    url: 'https://example.com/article',
    source: 'TestSource',
    publishedAt: '2026-02-18T12:00:00Z',
    sectorIds: ['technology'],
    imageUrl: undefined,
    ...overrides,
  }
}

describe('GET /api/news', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchNewsApi.mockResolvedValue([])
    mockFetchRss.mockResolvedValue([])
  })

  it('returns a NewsResponse with articles array and fetchedAt', async () => {
    const res = await request(app).get('/api/news')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('articles')
    expect(res.body).toHaveProperty('fetchedAt')
    expect(Array.isArray(res.body.articles)).toBe(true)
  })

  it('passes sectors query param to NewsAPI fetcher', async () => {
    await request(app).get('/api/news?sectors=technology,crypto')
    expect(mockFetchNewsApi).toHaveBeenCalledWith(['technology', 'crypto'])
  })

  it('fetches RSS articles regardless of sectors param', async () => {
    await request(app).get('/api/news?sectors=technology')
    expect(mockFetchRss).toHaveBeenCalled()
  })

  it('merges articles from RSS and NewsAPI', async () => {
    mockFetchRss.mockResolvedValue([makeArticle({ title: 'RSS Article', url: 'https://rss.example.com/1' })])
    mockFetchNewsApi.mockResolvedValue([makeArticle({ title: 'API Article', url: 'https://api.example.com/1' })])

    const res = await request(app).get('/api/news?sectors=technology')
    expect(res.body.articles).toHaveLength(2)
    const titles = res.body.articles.map((a: { title: string }) => a.title)
    expect(titles).toContain('RSS Article')
    expect(titles).toContain('API Article')
  })

  it('deduplicates articles by URL (RSS takes priority)', async () => {
    const sharedUrl = 'https://example.com/same-article'
    mockFetchRss.mockResolvedValue([makeArticle({ title: 'RSS Version', url: sharedUrl })])
    mockFetchNewsApi.mockResolvedValue([makeArticle({ title: 'API Version', url: sharedUrl })])

    const res = await request(app).get('/api/news?sectors=technology')
    expect(res.body.articles).toHaveLength(1)
    expect(res.body.articles[0].title).toBe('RSS Version')
  })

  it('returns empty articles array when no sectors specified and no RSS results', async () => {
    const res = await request(app).get('/api/news')
    expect(res.body.articles).toEqual([])
  })

  it('still returns RSS articles when no sectors specified', async () => {
    mockFetchRss.mockResolvedValue([makeArticle({ title: 'General News' })])

    const res = await request(app).get('/api/news')
    expect(res.body.articles).toHaveLength(1)
  })

  it('handles RSS failure gracefully (still returns NewsAPI results)', async () => {
    mockFetchRss.mockRejectedValue(new Error('RSS feed down'))
    mockFetchNewsApi.mockResolvedValue([makeArticle({ title: 'API Only' })])

    const res = await request(app).get('/api/news?sectors=technology')
    expect(res.status).toBe(200)
    expect(res.body.articles).toHaveLength(1)
    expect(res.body.articles[0].title).toBe('API Only')
  })

  it('handles NewsAPI failure gracefully (still returns RSS results)', async () => {
    mockFetchRss.mockResolvedValue([makeArticle({ title: 'RSS Only' })])
    mockFetchNewsApi.mockRejectedValue(new Error('API key exhausted'))

    const res = await request(app).get('/api/news?sectors=technology')
    expect(res.status).toBe(200)
    expect(res.body.articles).toHaveLength(1)
    expect(res.body.articles[0].title).toBe('RSS Only')
  })

  it('sorts articles by publishedAt descending (newest first)', async () => {
    mockFetchRss.mockResolvedValue([
      makeArticle({ title: 'Old', url: 'https://example.com/old', publishedAt: '2026-02-18T10:00:00Z' }),
      makeArticle({ title: 'New', url: 'https://example.com/new', publishedAt: '2026-02-18T14:00:00Z' }),
    ])

    const res = await request(app).get('/api/news')
    expect(res.body.articles[0].title).toBe('New')
    expect(res.body.articles[1].title).toBe('Old')
  })
})
