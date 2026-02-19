import { Router } from 'express'
import type { NewsArticle, NewsResponse } from '../../shared/types.js'
import { fetchRssArticles } from '../services/rss.js'
import { fetchNewsApiArticles } from '../services/newsapi.js'
import { cacheService } from '../services/cache.js'

const router = Router()

router.get('/', async (req, res) => {
  const sectorsParam = (req.query.sectors as string) ?? ''
  const sectorIds = sectorsParam ? sectorsParam.split(',').map((s) => s.trim()).filter(Boolean) : []

  const cacheKey = `news:${[...sectorIds].sort().join(',')}`

  const articles = await cacheService.getOrFetch<NewsArticle[]>(
    cacheKey,
    async () => {
      const [rssResult, newsApiResult] = await Promise.allSettled([
        fetchRssArticles(),
        sectorIds.length > 0 ? fetchNewsApiArticles(sectorIds) : Promise.resolve([]),
      ])

      const rssArticles = rssResult.status === 'fulfilled' ? rssResult.value : []
      const newsApiArticles = newsApiResult.status === 'fulfilled' ? newsApiResult.value : []

      // Deduplicate by URL — RSS takes priority
      const seen = new Set<string>()
      const merged: NewsArticle[] = []

      for (const article of [...rssArticles, ...newsApiArticles]) {
        if (seen.has(article.url)) continue
        seen.add(article.url)
        merged.push(article)
      }

      // Filter by selected sectors (if any sectors requested)
      const filtered = sectorIds.length > 0
        ? merged.filter((a) => a.sectorIds.some((sid) => sectorIds.includes(sid)))
        : merged

      // Sort by publishedAt descending (newest first)
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

      return filtered
    }
  )

  const response: NewsResponse = {
    articles,
    fetchedAt: new Date().toISOString(),
  }

  res.json(response)
})

export default router
