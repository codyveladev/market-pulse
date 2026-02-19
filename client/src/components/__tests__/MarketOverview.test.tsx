import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketOverview } from '../MarketOverview'

vi.mock('../../hooks/useMarketQuotes', () => ({
  useMarketQuotes: vi.fn((symbols: string[]) => ({
    quotes: symbols.map((s) => ({
      symbol: s,
      name: `${s} Name`,
      price: 100,
      change: 1.5,
      changePercent: 1.52,
      dayHigh: 102,
      dayLow: 98,
    })),
    loading: false,
    error: null,
  })),
}))

describe('MarketOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Markets heading', () => {
    render(<MarketOverview />)
    expect(screen.getByRole('heading', { name: 'Markets' })).toBeInTheDocument()
  })

  it('renders category filter buttons', () => {
    render(<MarketOverview />)
    expect(screen.getByRole('button', { name: /Major Indices/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Magnificent 7/ })).toBeInTheDocument()
  })

  it('defaults to Indices and Mag 7 selected', () => {
    render(<MarketOverview />)
    const indicesBtn = screen.getByRole('button', { name: /Major Indices/ })
    const mag7Btn = screen.getByRole('button', { name: /Magnificent 7/ })
    expect(indicesBtn.className).toMatch(/brand/)
    expect(mag7Btn.className).toMatch(/brand/)
  })

  it('renders MarketCards for default selected categories', () => {
    render(<MarketOverview />)
    // Should show SPY, QQQ, DIA, IWM (indices) + AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA (mag7)
    expect(screen.getByText('SPY')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('TSLA')).toBeInTheDocument()
  })

  it('toggles a category on click', async () => {
    const user = userEvent.setup()
    render(<MarketOverview />)

    // Click Technology to add it
    await user.click(screen.getByRole('button', { name: /Technology/ }))
    // GOOG should now appear (from Technology sector, not in Mag 7 which has GOOGL)
    expect(screen.getByText('GOOG')).toBeInTheDocument()
  })

  it('deselects a category on click', async () => {
    const user = userEvent.setup()
    render(<MarketOverview />)

    // Deselect Mag 7
    await user.click(screen.getByRole('button', { name: /Magnificent 7/ }))
    // AAPL should be gone (only in Mag 7 by default, not in indices)
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
    // SPY should still be there (indices still selected)
    expect(screen.getByText('SPY')).toBeInTheDocument()
  })

  it('shows loading state', async () => {
    const { useMarketQuotes } = await import('../../hooks/useMarketQuotes')
    vi.mocked(useMarketQuotes).mockReturnValue({
      quotes: [],
      loading: true,
      error: null,
    })

    const { container } = render(<MarketOverview />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})
