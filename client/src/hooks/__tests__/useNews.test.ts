import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useNews } from '../useNews'
import { useSourceStore } from '../../store/sourceStore'

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
    useSourceStore.setState({ selectedSources: [] })
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

  it('derives availableSources from fetched articles', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      articles: [
        { title: 'A1', description: '', url: 'https://example.com/1', source: 'Reuters', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'A2', description: '', url: 'https://example.com/2', source: 'Bloomberg', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['finance'] },
        { title: 'A3', description: '', url: 'https://example.com/3', source: 'Reuters', publishedAt: '2026-02-18T10:00:00Z', sectorIds: ['technology'] },
      ],
    }))

    const { result } = renderHook(() => useNews([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.availableSources).toEqual(['Bloomberg', 'Reuters'])
  })

  it('filters articles by selected sources', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      articles: [
        { title: 'A1', description: '', url: 'https://example.com/1', source: 'Reuters', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'A2', description: '', url: 'https://example.com/2', source: 'Bloomberg', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['finance'] },
      ],
    }))

    useSourceStore.setState({ selectedSources: ['Reuters'] })

    const { result } = renderHook(() => useNews([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].source).toBe('Reuters')
    expect(result.current.allArticles).toHaveLength(2)
  })

  it('shows all articles when no sources are selected', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      articles: [
        { title: 'A1', description: '', url: 'https://example.com/1', source: 'Reuters', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'A2', description: '', url: 'https://example.com/2', source: 'Bloomberg', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['finance'] },
      ],
    }))

    const { result } = renderHook(() => useNews([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(2)
  })

  it('ignores stale source selections not present in current articles', async () => {
    mockFetch.mockReturnValue(jsonResponse({
      articles: [
        { title: 'A1', description: '', url: 'https://example.com/1', source: 'AP News', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'A2', description: '', url: 'https://example.com/2', source: 'TechCrunch', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['technology'] },
      ],
    }))

    // User previously selected "Reuters" which is not in the current article set
    useSourceStore.setState({ selectedSources: ['Reuters'] })

    const { result } = renderHook(() => useNews([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should show all articles since "Reuters" isn't available, not zero
    expect(result.current.articles).toHaveLength(2)
  })
})
