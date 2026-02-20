import { useState, useEffect, useRef } from 'react'
import type { ResearchResponse } from '../../../shared/types'

interface UseResearchResult {
  data: ResearchResponse | null
  loading: boolean
  error: string | null
  fetchedAt: string | null
}

export function useResearch(symbol: string): UseResearchResult {
  const [data, setData] = useState<ResearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!symbol) {
      setData(null)
      setLoading(false)
      setError(null)
      setFetchedAt(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const doFetch = async () => {
      try {
        const res = await fetch(`/api/research?symbol=${encodeURIComponent(symbol)}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: ResearchResponse = await res.json()
        setData(json)
        setFetchedAt(json.fetchedAt ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Failed to fetch research data')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    doFetch()

    return () => controller.abort()
  }, [symbol])

  return { data, loading, error, fetchedAt }
}
