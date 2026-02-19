import Parser from 'rss-parser'
import type { NewsArticle } from '../../shared/types.js'
import { matchSectors } from './sectorMatcher.js'

const parser = new Parser()

export const RSS_FEEDS = [
  'https://feeds.finance.yahoo.com/rss/2.0/headline',
  'https://feeds.reuters.com/reuters/businessNews',
  'https://feeds.marketwatch.com/marketwatch/topstories',
  'https://www.investing.com/rss/news.rss',
]

export async function fetchRssArticles(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((url) => parser.parseURL(url))
  )

  const seen = new Set<string>()
  const articles: NewsArticle[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue

    for (const item of result.value.items ?? []) {
      const title = item.title?.trim()
      const link = item.link?.trim()

      if (!title || !link) continue
      if (seen.has(link)) continue
      seen.add(link)

      const description = item.contentSnippet?.trim() ?? item.content?.trim() ?? ''
      const textToMatch = `${title} ${description}`

      articles.push({
        title,
        description,
        url: link,
        source: item.creator ?? result.value.title ?? 'RSS',
        publishedAt: item.isoDate ?? new Date().toISOString(),
        sectorIds: matchSectors(textToMatch),
        imageUrl: undefined,
      })
    }
  }

  return articles
}
