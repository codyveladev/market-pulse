import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewsCard } from '../NewsCard'
import type { NewsArticle } from '@shared/types'

function makeArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    title: 'AI chips see record demand',
    description: 'Semiconductor makers report strong Q4.',
    url: 'https://news.example.com/ai-chips',
    source: 'TechCrunch',
    publishedAt: '2026-02-18T12:00:00Z',
    sectorIds: ['technology'],
    imageUrl: undefined,
    ...overrides,
  }
}

describe('NewsCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the headline', () => {
    render(<NewsCard article={makeArticle()} />)
    expect(screen.getByText('AI chips see record demand')).toBeInTheDocument()
  })

  it('renders the source name', () => {
    render(<NewsCard article={makeArticle()} />)
    expect(screen.getByText('TechCrunch')).toBeInTheDocument()
  })

  it('renders sector tags', () => {
    render(<NewsCard article={makeArticle({ sectorIds: ['technology', 'crypto'] })} />)
    expect(screen.getByText(/Technology/)).toBeInTheDocument()
    expect(screen.getByText(/Crypto/)).toBeInTheDocument()
  })

  it('renders time-ago text', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T12:12:00Z'))

    render(<NewsCard article={makeArticle()} />)
    expect(screen.getByText('12 min ago')).toBeInTheDocument()
  })

  it('renders the headline as a clickable link', () => {
    render(<NewsCard article={makeArticle()} />)
    const link = screen.getByRole('link', { name: /AI chips see record demand/ })
    expect(link).toHaveAttribute('href', 'https://news.example.com/ai-chips')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders the description', () => {
    render(<NewsCard article={makeArticle()} />)
    expect(screen.getByText('Semiconductor makers report strong Q4.')).toBeInTheDocument()
  })
})
