import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMarketData } from '../useMarketData'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

describe('useMarketData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReturnValue(jsonResponse({
      quotes: [
        { symbol: 'XLK', price: 200.5, change: 3.25, changePercent: 1.65 },
        { symbol: 'XLE', price: 85.0, change: -1.5, changePercent: -1.73 },
      ],
      fetchedAt: '2026-02-18T12:00:00Z',
    }))
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useMarketData())
    expect(result.current.loading).toBe(true)
  })

  it('fetches quotes and sets data', async () => {
    const { result } = renderHook(() => useMarketData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.quotes).toHaveLength(2)
    expect(result.current.quotes[0].symbol).toBe('XLK')
    expect(result.current.quotes[1].changePercent).toBe(-1.73)
  })

  it('calls the /api/quotes endpoint', async () => {
    const { result } = renderHook(() => useMarketData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/quotes')
  })

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useMarketData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.quotes).toEqual([])
    expect(result.current.error).toBeTruthy()
  })
})
