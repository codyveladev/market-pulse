import { useState, useEffect, useCallback, useRef } from 'react'
import type { NewsArticle } from '@shared/types'

interface UseNewsResult {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  refresh: () => void
  secondsUntilRefresh: number
  fetchedAt: string | null
}

const REFRESH_INTERVAL = 90_000

export function useNews(sectors: string[]): UseNewsResult {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(90)
  const sectorsKey = sectors.join(',')
  const abortRef = useRef<AbortController | null>(null)

  const fetchNews = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const params = sectorsKey ? `?sectors=${sectorsKey}` : ''
      const response = await fetch(`/api/news${params}`, { signal: controller.signal })
      const data = await response.json()
      setArticles(data.articles ?? [])
      setFetchedAt(data.fetchedAt ?? null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [sectorsKey])

  // Fetch on mount + when sectors change, auto-refresh every 90s
  useEffect(() => {
    fetchNews()
    setSecondsUntilRefresh(90)

    const interval = setInterval(() => {
      fetchNews()
      setSecondsUntilRefresh(90)
    }, REFRESH_INTERVAL)

    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchNews])

  // Countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(countdown)
  }, [])

  const manualRefresh = useCallback(() => {
    fetchNews()
    setSecondsUntilRefresh(90)
  }, [fetchNews])

  return { articles, loading, error, refresh: manualRefresh, secondsUntilRefresh, fetchedAt }
}
