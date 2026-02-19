import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMarketQuotes } from '../useMarketQuotes'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

const MOCK_QUOTES = {
  quotes: [
    { symbol: 'SPY', price: 520.5, change: 3.25, changePercent: 0.63, name: 'SPDR S&P 500', dayHigh: 522.0, dayLow: 518.0 },
    { symbol: 'QQQ', price: 450.0, change: -2.1, changePercent: -0.47, name: 'Invesco QQQ', dayHigh: 453.0, dayLow: 448.5 },
  ],
  fetchedAt: '2026-02-18T12:00:00Z',
}

describe('useMarketQuotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReturnValue(jsonResponse(MOCK_QUOTES))
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useMarketQuotes(['SPY', 'QQQ']))
    expect(result.current.loading).toBe(true)
  })

  it('fetches quotes for given symbols', async () => {
    const { result } = renderHook(() => useMarketQuotes(['SPY', 'QQQ']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.quotes).toHaveLength(2)
    expect(result.current.quotes[0].symbol).toBe('SPY')
    expect(result.current.quotes[0].name).toBe('SPDR S&P 500')
    expect(result.current.quotes[1].symbol).toBe('QQQ')
  })

  it('passes symbols as query param to /api/quotes', async () => {
    const { result } = renderHook(() => useMarketQuotes(['SPY', 'QQQ']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/quotes?symbols=SPY,QQQ')
  })

  it('does not fetch when symbols array is empty', async () => {
    const { result } = renderHook(() => useMarketQuotes([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.quotes).toEqual([])
  })

  it('refetches when symbols change', async () => {
    const { result, rerender } = renderHook(
      ({ symbols }) => useMarketQuotes(symbols),
      { initialProps: { symbols: ['SPY'] } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ symbols: ['AAPL', 'MSFT'] })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    const url = mockFetch.mock.calls[1][0] as string
    expect(url).toContain('/api/quotes?symbols=AAPL,MSFT')
  })

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useMarketQuotes(['SPY']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.quotes).toEqual([])
    expect(result.current.error).toBeTruthy()
  })
})
