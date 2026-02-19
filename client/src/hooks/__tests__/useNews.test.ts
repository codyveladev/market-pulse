import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useNews } from '../useNews'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

describe('useNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReturnValue(jsonResponse({
      articles: [
        { title: 'Test', description: 'Desc', url: 'https://example.com', source: 'Src', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
      ],
      fetchedAt: '2026-02-18T12:00:00Z',
    }))
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useNews(['technology']))
    expect(result.current.loading).toBe(true)
  })

  it('fetches articles and sets data', async () => {
    const { result } = renderHook(() => useNews(['technology']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].title).toBe('Test')
  })

  it('passes sectors as query param', async () => {
    const { result } = renderHook(() => useNews(['technology', 'crypto']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('sectors=technology,crypto')
  })

  it('sets error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useNews(['technology']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.articles).toEqual([])
  })

  it('provides a manual refresh function', async () => {
    const { result } = renderHook(() => useNews(['technology']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.refresh()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('exposes fetchedAt from the API response', async () => {
    const { result } = renderHook(() => useNews(['technology']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fetchedAt).toBe('2026-02-18T12:00:00Z')
  })

  it('refetches when sectors change', async () => {
    const { result, rerender } = renderHook(
      ({ sectors }) => useNews(sectors),
      { initialProps: { sectors: ['technology'] } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ sectors: ['crypto'] })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    const secondUrl = mockFetch.mock.calls[1][0] as string
    expect(secondUrl).toContain('sectors=crypto')
  })
})
