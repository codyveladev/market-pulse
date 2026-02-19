import type { NewsArticle } from '../../shared/types.js'
import { getKeywordsForSectors, matchSectors } from './sectorMatcher.js'

const NEWSAPI_BASE = 'https://newsapi.org/v2/everything'

export function buildNewsApiQuery(sectorIds: string[]): string {
  if (sectorIds.length === 0) return ''

  const keywords = getKeywordsForSectors(sectorIds)
  return keywords.join(' OR ')
}

export async function fetchNewsApiArticles(sectorIds: string[]): Promise<NewsArticle[]> {
  if (sectorIds.length === 0) return []

  const query = buildNewsApiQuery(sectorIds)
  if (!query) return []

  const apiKey = process.env.NEWSAPI_KEY ?? ''
  const params = new URLSearchParams({
    q: query,
    language: 'en',
    sortBy: 'publishedAt',
    apiKey,
  })

  try {
    const response = await fetch(`${NEWSAPI_BASE}?${params}`)
    if (!response.ok) return []

    const data = await response.json()
    if (data.status !== 'ok') return []

    const articles: NewsArticle[] = []
    for (const item of data.articles ?? []) {
      if (!item.title || !item.url) continue

      const title = item.title.trim()
      const description = item.description?.trim() ?? ''
      const textToMatch = `${title} ${description}`

      articles.push({
        title,
        description,
        url: item.url,
        source: item.source?.name ?? 'Unknown',
        publishedAt: item.publishedAt ?? new Date().toISOString(),
        sectorIds: matchSectors(textToMatch),
        imageUrl: item.urlToImage ?? undefined,
      })
    }

    return articles
  } catch {
    return []
  }
}
