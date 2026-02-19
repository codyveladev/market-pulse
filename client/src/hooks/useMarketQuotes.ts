import { useState, useEffect, useCallback, useRef } from 'react'
import type { QuoteData } from '@shared/types'

interface UseMarketQuotesResult {
  quotes: QuoteData[]
  loading: boolean
  error: string | null
  fetchedAt: string | null
}

const REFRESH_INTERVAL = 60_000

export function useMarketQuotes(symbols: string[]): UseMarketQuotesResult {
  const [quotes, setQuotes] = useState<QuoteData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const symbolsKey = symbols.join(',')

  const fetchQuotes = useCallback(async () => {
    if (!symbolsKey) {
      setQuotes([])
      setLoading(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/quotes?symbols=${symbolsKey}`, { signal: controller.signal })
      const data = await response.json()
      setQuotes(data.quotes ?? [])
      setFetchedAt(data.fetchedAt ?? null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes')
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }, [symbolsKey])

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, REFRESH_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchQuotes])

  return { quotes, loading, error, fetchedAt }
}
