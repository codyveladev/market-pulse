import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { NewsArticle } from '@shared/types'
import { useSourceStore } from '../store/sourceStore'

interface UseNewsResult {
  articles: NewsArticle[]
  allArticles: NewsArticle[]
  availableSources: string[]
  loading: boolean
  error: string | null
  refresh: () => void
  secondsUntilRefresh: number
  fetchedAt: string | null
}

const REFRESH_INTERVAL = 90_000

export function useNews(sectors: string[]): UseNewsResult {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(90)
  const sectorsKey = sectors.join(',')
  const abortRef = useRef<AbortController | null>(null)
  const { selectedSources } = useSourceStore()

  const fetchNews = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const params = sectorsKey ? `?sectors=${sectorsKey}` : ''
      const response = await fetch(`/api/news${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setAllArticles(data.articles ?? [])
      setFetchedAt(data.fetchedAt ?? null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      setAllArticles([])
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

  const availableSources = useMemo(() => {
    const sources = [...new Set(allArticles.map((a) => a.source))]
    return sources.sort()
  }, [allArticles])

  const articles = useMemo(() => {
    if (selectedSources.length === 0) return allArticles
    const activeSources = selectedSources.filter((s) => availableSources.includes(s))
    if (activeSources.length === 0) return allArticles
    const sourceSet = new Set(activeSources)
    return allArticles.filter((a) => sourceSet.has(a.source))
  }, [allArticles, selectedSources, availableSources])

  return { articles, allArticles, availableSources, loading, error, refresh: manualRefresh, secondsUntilRefresh, fetchedAt }
}
