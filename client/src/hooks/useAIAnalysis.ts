import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAIAnalysisResult {
  text: string
  loading: boolean
  error: string | null
  isStreaming: boolean
  cached: boolean
  start: () => void
  regenerate: () => void
}

export function useAIAnalysis(symbol: string): UseAIAnalysisResult {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [cached, setCached] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  const connect = useCallback((regen: boolean) => {
    if (!symbol) return

    cleanup()
    setText('')
    setError(null)
    setLoading(true)
    setIsStreaming(false)
    setCached(false)

    const url = `/api/research/ai?symbol=${encodeURIComponent(symbol)}${regen ? '&regenerate=1' : ''}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'chunk') {
          setIsStreaming(true)
          setLoading(false)
          setText((prev) => prev + data.text)
        } else if (data.type === 'done') {
          setCached(data.cached ?? false)
          setIsStreaming(false)
          es.close()
        } else if (data.type === 'error') {
          setError(data.error)
          setLoading(false)
          setIsStreaming(false)
          es.close()
        }
      } catch {
        // ignore malformed SSE data
      }
    }

    es.onerror = () => {
      setError('Connection to AI analysis failed')
      setLoading(false)
      setIsStreaming(false)
      es.close()
    }
  }, [symbol, cleanup])

  const start = useCallback(() => {
    connect(false)
  }, [connect])

  const regenerate = useCallback(() => {
    connect(true)
  }, [connect])

  // Reset on symbol change
  useEffect(() => {
    cleanup()
    setText('')
    setError(null)
    setLoading(false)
    setIsStreaming(false)
    setCached(false)
  }, [symbol, cleanup])

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  return { text, loading, error, isStreaming, cached, start, regenerate }
}
