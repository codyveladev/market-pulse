import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketOverview } from '../MarketOverview'

const INDICES = ['S&P 500', 'Nasdaq', 'Dow Jones', 'Russell 2000']

describe('MarketOverview', () => {
  it('renders the Markets heading', () => {
    render(<MarketOverview />)
    expect(screen.getByText('Markets')).toBeInTheDocument()
  })

  it('shows a card for each major index', () => {
    render(<MarketOverview />)
    for (const index of INDICES) {
      expect(screen.getByText(index)).toBeInTheDocument()
    }
  })

  it('shows coming soon placeholder in each card', () => {
    render(<MarketOverview />)
    const placeholders = screen.getAllByText(/coming soon/i)
    expect(placeholders).toHaveLength(INDICES.length)
  })
})
