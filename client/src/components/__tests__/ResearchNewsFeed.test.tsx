import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResearchNewsFeed } from '../ResearchNewsFeed'
import type { CompanyNewsArticle } from '../../../../shared/types'

function makeArticles(count: number): CompanyNewsArticle[] {
  return Array.from({ length: count }, (_, i) => ({
    headline: `Article ${i + 1}`,
    summary: `Summary ${i + 1}`,
    url: `https://example.com/${i + 1}`,
    source: i % 2 === 0 ? 'Reuters' : 'Bloomberg',
    datetime: Math.floor(Date.now() / 1000) - (i + 1) * 3600,
    image: i === 0 ? 'https://example.com/img.jpg' : null,
  }))
}

describe('ResearchNewsFeed', () => {
  it('renders news article headlines', () => {
    render(<ResearchNewsFeed news={makeArticles(2)} />)
    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.getByText('Article 2')).toBeInTheDocument()
  })

  it('renders source for each article', () => {
    render(<ResearchNewsFeed news={makeArticles(2)} />)
    expect(screen.getByText('Reuters')).toBeInTheDocument()
    expect(screen.getByText('Bloomberg')).toBeInTheDocument()
  })

  it('renders "No news available" when array is empty', () => {
    render(<ResearchNewsFeed news={[]} />)
    expect(screen.getByText(/no news available/i)).toBeInTheDocument()
  })

  it('each headline is a clickable link opening in new tab', () => {
    render(<ResearchNewsFeed news={makeArticles(2)} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('target', '_blank')
  })

  it('does not render images even when image data is present', () => {
    const { container } = render(<ResearchNewsFeed news={makeArticles(2)} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('renders source as a styled pill badge', () => {
    render(<ResearchNewsFeed news={makeArticles(1)} />)
    const badge = screen.getByText('Reuters')
    expect(badge.className).toMatch(/rounded-full/)
    expect(badge.className).toMatch(/bg-surface/)
  })

  it('renders article summary when non-empty', () => {
    render(<ResearchNewsFeed news={makeArticles(1)} />)
    expect(screen.getByText('Summary 1')).toBeInTheDocument()
  })

  it('shows only 10 articles per page', () => {
    render(<ResearchNewsFeed news={makeArticles(15)} />)
    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.getByText('Article 10')).toBeInTheDocument()
    expect(screen.queryByText('Article 11')).not.toBeInTheDocument()
  })

  it('shows pagination controls when more than 10 articles', () => {
    render(<ResearchNewsFeed news={makeArticles(15)} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('does not show pagination when 10 or fewer articles', () => {
    render(<ResearchNewsFeed news={makeArticles(8)} />)
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('navigates to next page and back', async () => {
    const user = userEvent.setup()
    render(<ResearchNewsFeed news={makeArticles(15)} />)

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Article 11')).toBeInTheDocument()
    expect(screen.queryByText('Article 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /previous/i }))

    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.queryByText('Article 11')).not.toBeInTheDocument()
  })

  it('disables Previous on first page and Next on last page', async () => {
    const user = userEvent.setup()
    render(<ResearchNewsFeed news={makeArticles(15)} />)

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows item range indicator', () => {
    render(<ResearchNewsFeed news={makeArticles(15)} />)
    expect(screen.getByText(/1–10 of 15/)).toBeInTheDocument()
  })
})
