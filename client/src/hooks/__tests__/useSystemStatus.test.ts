import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSystemStatus } from '../useSystemStatus'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

const MOCK_STATUS = {
  services: [
    { name: 'Yahoo Finance', status: 'ok', message: 'Connected' },
    { name: 'RSS Feeds', status: 'ok', message: 'Connected' },
    { name: 'NewsAPI', status: 'unconfigured', message: 'No API Key' },
  ],
  checkedAt: '2026-02-19T12:00:00Z',
}

describe('useSystemStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReturnValue(jsonResponse(MOCK_STATUS))
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useSystemStatus())
    expect(result.current.loading).toBe(true)
  })

  it('fetches from /api/status', async () => {
    const { result } = renderHook(() => useSystemStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/status')
  })

  it('returns services array from response', async () => {
    const { result } = renderHook(() => useSystemStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.services).toHaveLength(3)
    expect(result.current.services[0].name).toBe('Yahoo Finance')
    expect(result.current.services[0].status).toBe('ok')
  })

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useSystemStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.services).toEqual([])
    expect(result.current.error).toBeTruthy()
  })
})
