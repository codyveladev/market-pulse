import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useResearch } from '../useResearch'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

const MOCK_RESEARCH = {
  overview: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.84,
    change: 2.34,
    changePercent: 1.25,
    dayHigh: 191.0,
    dayLow: 188.0,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 124.17,
    marketCap: 2870000000000,
    volume: 48200000,
    chartData: [185, 186, 187, 188, 189],
  },
  profile: { name: 'Apple Inc', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: 2870000 },
  financials: { peRatio: 31.2, eps: 6.13, beta: 1.29, dividendYield: 0.55 },
  news: [{ headline: 'Apple beats earnings', summary: 'Strong quarter', url: 'https://example.com', source: 'Reuters', datetime: 1708300800, image: null }],
  fetchedAt: '2026-02-18T12:00:00Z',
}

describe('useResearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReturnValue(jsonResponse(MOCK_RESEARCH))
  })

  it('starts in idle state when no symbol provided', () => {
    const { result } = renderHook(() => useResearch(''))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('starts loading when symbol is provided', () => {
    const { result } = renderHook(() => useResearch('AAPL'))
    expect(result.current.loading).toBe(true)
  })

  it('fetches /api/research?symbol=AAPL and sets data', async () => {
    const { result } = renderHook(() => useResearch('AAPL'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data!.overview!.symbol).toBe('AAPL')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/research?symbol=AAPL')
  })

  it('sets error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useResearch('AAPL'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeNull()
  })

  it('resets data when symbol changes', async () => {
    const { result, rerender } = renderHook(
      ({ symbol }) => useResearch(symbol),
      { initialProps: { symbol: 'AAPL' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ symbol: 'MSFT' })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    const url = mockFetch.mock.calls[1][0] as string
    expect(url).toContain('/api/research?symbol=MSFT')
  })

  it('does not fetch when symbol is empty string', () => {
    renderHook(() => useResearch(''))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('exposes fetchedAt from the API response', async () => {
    const { result } = renderHook(() => useResearch('AAPL'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fetchedAt).toBe('2026-02-18T12:00:00Z')
  })

  it('clears data when symbol becomes empty', async () => {
    const { result, rerender } = renderHook(
      ({ symbol }) => useResearch(symbol),
      { initialProps: { symbol: 'AAPL' } }
    )

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
    })

    rerender({ symbol: '' })

    await waitFor(() => {
      expect(result.current.data).toBeNull()
    })
  })
})
