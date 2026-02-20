import { useState, useEffect, useCallback, useRef } from 'react'
import type { ServiceStatus } from '@shared/types'

interface UseSystemStatusResult {
  services: ServiceStatus[]
  loading: boolean
  error: string | null
}

const REFRESH_INTERVAL = 30_000

export function useSystemStatus(): UseSystemStatusResult {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchStatus = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/status', { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setServices(data.services ?? [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchStatus])

  return { services, loading, error }
}
