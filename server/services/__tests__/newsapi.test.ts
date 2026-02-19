import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchNewsApiArticles, buildNewsApiQuery } from '../newsapi.js'

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

describe('buildNewsApiQuery', () => {
  it('joins keywords with OR for a single sector', () => {
    const query = buildNewsApiQuery(['technology'])
    // Should contain at least some tech keywords joined with OR
    expect(query).toContain('OR')
    expect(query.toLowerCase()).toContain('ai')
  })

  it('joins keywords across multiple sectors with OR', () => {
    const query = buildNewsApiQuery(['technology', 'crypto'])
    expect(query.toLowerCase()).toContain('ai')
    expect(query.toLowerCase()).toContain('bitcoin')
  })

  it('returns an empty string for empty sector list', () => {
    expect(buildNewsApiQuery([])).toBe('')
  })
})

describe('fetchNewsApiArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized NewsArticle objects from the API response', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      status: 'ok',
      articles: [
        {
          title: 'AI chips see record demand',
          description: 'Semiconductor makers report strong Q4.',
          url: 'https://news.example.com/ai-chips',
          source: { name: 'TechCrunch' },
          publishedAt: '2026-02-18T12:00:00Z',
          urlToImage: 'https://img.example.com/ai.jpg',
        },
      ],
    }))

    const articles = await fetchNewsApiArticles(['technology'])
    expect(articles).toHaveLength(1)
    expect(articles[0]).toMatchObject({
      title: 'AI chips see record demand',
      description: 'Semiconductor makers report strong Q4.',
      url: 'https://news.example.com/ai-chips',
      source: 'TechCrunch',
      publishedAt: '2026-02-18T12:00:00Z',
      imageUrl: 'https://img.example.com/ai.jpg',
    })
    expect(Array.isArray(articles[0].sectorIds)).toBe(true)
  })

  it('passes the correct query params to the NewsAPI endpoint', async () => {
    mockFetch.mockReturnValue(jsonResponse({ status: 'ok', articles: [] }))

    await fetchNewsApiArticles(['crypto'])
    expect(mockFetch).toHaveBeenCalledOnce()
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('newsapi.org')
    expect(url).toContain('language=en')
    expect(url).toContain('sortBy=publishedAt')
    // Keywords should be in the q param
    expect(url.toLowerCase()).toContain('bitcoin')
  })

  it('returns empty array when API returns an error status', async () => {
    mockFetch.mockReturnValue(jsonResponse({ status: 'error', message: 'rate limited' }, 429))

    const articles = await fetchNewsApiArticles(['technology'])
    expect(articles).toEqual([])
  })

  it('returns empty array when fetch throws a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const articles = await fetchNewsApiArticles(['technology'])
    expect(articles).toEqual([])
  })

  it('returns empty array for empty sector list', async () => {
    const articles = await fetchNewsApiArticles([])
    expect(articles).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('skips articles with missing title or url', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      status: 'ok',
      articles: [
        { title: 'Valid', url: 'https://example.com/valid', source: { name: 'X' }, publishedAt: '2026-02-18T12:00:00Z' },
        { title: null, url: 'https://example.com/no-title', source: { name: 'X' }, publishedAt: '2026-02-18T12:00:00Z' },
        { title: 'No URL', url: null, source: { name: 'X' }, publishedAt: '2026-02-18T12:00:00Z' },
      ],
    }))

    const articles = await fetchNewsApiArticles(['technology'])
    expect(articles).toHaveLength(1)
    expect(articles[0].title).toBe('Valid')
  })
})
