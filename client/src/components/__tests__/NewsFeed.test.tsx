import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsFeed } from '../NewsFeed'

function defaultProps(overrides = {}) {
  return {
    articles: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    secondsUntilRefresh: 90,
    fetchedAt: null,
    ...overrides,
  }
}

describe('NewsFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading skeleton while fetching', () => {
    const { container } = render(<NewsFeed {...defaultProps({ loading: true })} />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders NewsCard components for each article', () => {
    render(<NewsFeed {...defaultProps({
      articles: [
        { title: 'Article 1', description: 'Desc', url: 'https://example.com/1', source: 'Src', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
        { title: 'Article 2', description: 'Desc', url: 'https://example.com/2', source: 'Src', publishedAt: '2026-02-18T11:00:00Z', sectorIds: ['crypto'] },
      ],
    })} />)
    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.getByText('Article 2')).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    render(<NewsFeed {...defaultProps({ error: 'Failed to fetch news' })} />)
    expect(screen.getByText(/failed/i)).toBeInTheDocument()
  })

  it('renders a refresh button', () => {
    render(<NewsFeed {...defaultProps()} />)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('calls refresh when refresh button is clicked', async () => {
    const refreshFn = vi.fn()
    const user = userEvent.setup()
    render(<NewsFeed {...defaultProps({ refresh: refreshFn })} />)

    await user.click(screen.getByRole('button', { name: /refresh/i }))
    expect(refreshFn).toHaveBeenCalledOnce()
  })

  it('shows empty state when no articles match', () => {
    render(<NewsFeed {...defaultProps()} />)
    expect(screen.getByText(/no articles/i)).toBeInTheDocument()
  })

  it('displays last updated timestamp when fetchedAt is available', () => {
    render(<NewsFeed {...defaultProps({
      articles: [
        { title: 'Article 1', description: 'Desc', url: 'https://example.com/1', source: 'Src', publishedAt: '2026-02-18T12:00:00Z', sectorIds: ['technology'] },
      ],
      fetchedAt: new Date().toISOString(),
    })} />)
    expect(screen.getByText(/updated/i)).toBeInTheDocument()
  })

  it('displays refresh countdown', () => {
    render(<NewsFeed {...defaultProps({ secondsUntilRefresh: 45 })} />)
    expect(screen.getByText(/45s/)).toBeInTheDocument()
  })
})
