import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsFeed } from '../NewsFeed'

vi.mock('../../hooks/useNews', () => ({
  useNews: vi.fn(),
}))

import { useNews } from '../../hooks/useNews'

const mockUseNews = vi.mocked(useNews)

describe('NewsFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows loading skeleton while fetching', () => {
    mockUseNews.mockReturnValue({
      articles: [],
      loading: true,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    const { container } = render(<NewsFeed sectors={['technology']} />)
    // Skeleton cards use animate-pulse class
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders NewsCard components for each article', () => {
    mockUseNews.mockReturnValue({
      articles: [
        { title: 'Article 1', description: 'Desc', url: 'https://example.com/1', source: 'Src', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'Article 2', description: 'Desc', url: 'https://example.com/2', source: 'Src', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['crypto'] },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    render(<NewsFeed sectors={['technology', 'crypto']} />)
    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.getByText('Article 2')).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    mockUseNews.mockReturnValue({
      articles: [],
      loading: false,
      error: 'Failed to fetch news',
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    render(<NewsFeed sectors={['technology']} />)
    expect(screen.getByText(/failed/i)).toBeInTheDocument()
  })

  it('renders a refresh button', () => {
    mockUseNews.mockReturnValue({
      articles: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    render(<NewsFeed sectors={['technology']} />)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('calls refresh when refresh button is clicked', async () => {
    const refreshFn = vi.fn()
    mockUseNews.mockReturnValue({
      articles: [],
      loading: false,
      error: null,
      refresh: refreshFn,
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    const user = userEvent.setup()
    render(<NewsFeed sectors={['technology']} />)

    await user.click(screen.getByRole('button', { name: /refresh/i }))
    expect(refreshFn).toHaveBeenCalledOnce()
  })

  it('shows empty state when no articles match', () => {
    mockUseNews.mockReturnValue({
      articles: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    render(<NewsFeed sectors={['technology']} />)
    expect(screen.getByText(/no articles/i)).toBeInTheDocument()
  })

  it('displays last updated timestamp when fetchedAt is available', () => {
    mockUseNews.mockReturnValue({
      articles: [
        { title: 'Article 1', description: 'Desc', url: 'https://example.com/1', source: 'Src', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: new Date().toISOString(),
    })

    render(<NewsFeed sectors={['technology']} />)
    expect(screen.getByText(/updated/i)).toBeInTheDocument()
  })

  it('passes sectors to useNews hook', () => {
    mockUseNews.mockReturnValue({
      articles: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      secondsUntilRefresh: 90,
      fetchedAt: null,
    })

    render(<NewsFeed sectors={['technology', 'crypto']} />)
    expect(mockUseNews).toHaveBeenCalledWith(['technology', 'crypto'])
  })
})
