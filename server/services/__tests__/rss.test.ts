import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock rss-parser before importing the service
vi.mock('rss-parser', () => {
  const mockParse = vi.fn()
  return {
    default: vi.fn().mockImplementation(() => ({
      parseURL: mockParse,
    })),
    _mockParse: mockParse,
  }
})

import { fetchRssArticles, RSS_FEEDS } from '../rss.js'
import type { NewsArticle } from '../../../shared/types.js'

// Access the mock so we can control return values per test
const { _mockParse: mockParseURL } = await import('rss-parser') as any

describe('RSS_FEEDS', () => {
  it('contains at least 2 feed URLs', () => {
    expect(RSS_FEEDS.length).toBeGreaterThanOrEqual(2)
  })

  it('all feed URLs are valid http(s) URLs', () => {
    for (const url of RSS_FEEDS) {
      expect(url).toMatch(/^https?:\/\//)
    }
  })
})

describe('fetchRssArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized NewsArticle objects from RSS items', async () => {
    mockParseURL.mockResolvedValue({
      title: 'Yahoo Finance RSS',
      items: [
        {
          title: 'NVIDIA beats earnings expectations',
          contentSnippet: 'The chipmaker reported record revenue.',
          link: 'https://example.com/nvidia',
          isoDate: '2026-02-18T10:00:00Z',
          creator: 'Yahoo Finance',
        },
        {
          title: 'Oil prices surge on OPEC cuts',
          contentSnippet: 'Crude oil jumps 3% after OPEC announcement.',
          link: 'https://example.com/oil',
          isoDate: '2026-02-18T09:30:00Z',
        },
      ],
    })

    const articles = await fetchRssArticles()

    expect(articles.length).toBeGreaterThanOrEqual(2)
    const nvidia = articles.find((a) => a.url === 'https://example.com/nvidia')
    expect(nvidia).toBeDefined()
    expect(nvidia!.title).toBe('NVIDIA beats earnings expectations')
    expect(nvidia!.description).toBe('The chipmaker reported record revenue.')
    expect(nvidia!.source).toBeTruthy()
    expect(nvidia!.publishedAt).toBe('2026-02-18T10:00:00Z')
    expect(nvidia!.url).toBe('https://example.com/nvidia')
    expect(Array.isArray(nvidia!.sectorIds)).toBe(true)
  })

  it('skips items that are missing a title or link', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        { title: 'Valid article', link: 'https://example.com/valid', isoDate: '2026-02-18T10:00:00Z' },
        { title: '', link: 'https://example.com/no-title', isoDate: '2026-02-18T10:00:00Z' },
        { title: 'No link article', link: '', isoDate: '2026-02-18T10:00:00Z' },
        { title: null, link: null },
      ],
    })

    const articles = await fetchRssArticles()
    expect(articles.every((a) => a.title && a.url)).toBe(true)
  })

  it('handles a feed that fails to parse without crashing', async () => {
    // First feed throws, second succeeds
    mockParseURL
      .mockRejectedValueOnce(new Error('Feed unavailable'))
      .mockResolvedValueOnce({
        items: [
          { title: 'Fallback article', link: 'https://example.com/fallback', isoDate: '2026-02-18T10:00:00Z' },
        ],
      })
      .mockRejectedValue(new Error('Feed unavailable'))

    const articles = await fetchRssArticles()
    // Should still return articles from the feed that succeeded
    expect(articles.length).toBeGreaterThanOrEqual(1)
    expect(articles[0].title).toBe('Fallback article')
  })

  it('returns an empty array when all feeds fail', async () => {
    mockParseURL.mockRejectedValue(new Error('All feeds down'))

    const articles = await fetchRssArticles()
    expect(articles).toEqual([])
  })

  it('deduplicates articles with the same URL across feeds', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        { title: 'Duplicate', link: 'https://example.com/same', isoDate: '2026-02-18T10:00:00Z' },
      ],
    })

    const articles = await fetchRssArticles()
    const urls = articles.map((a) => a.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('assigns sectorIds based on keyword matching in title and description', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: 'Bitcoin surges past $100k as crypto regulation eases',
          contentSnippet: 'Ethereum also rallied.',
          link: 'https://example.com/btc',
          isoDate: '2026-02-18T10:00:00Z',
        },
      ],
    })

    const articles = await fetchRssArticles()
    const btcArticle = articles.find((a) => a.url === 'https://example.com/btc')
    expect(btcArticle).toBeDefined()
    expect(btcArticle!.sectorIds).toContain('crypto')
  })
})
