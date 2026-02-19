import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TickerTape } from '../TickerTape'

vi.mock('../../hooks/useMarketData', () => ({
  useMarketData: vi.fn(),
}))

import { useMarketData } from '../../hooks/useMarketData'

const mockUseMarketData = vi.mocked(useMarketData)

describe('TickerTape', () => {
  it('renders quote symbols and prices', () => {
    mockUseMarketData.mockReturnValue({
      quotes: [
        { symbol: 'XLK', price: 200.5, change: 3.25, changePercent: 1.65 },
        { symbol: 'XLE', price: 85.0, change: -1.5, changePercent: -1.73 },
      ],
      loading: false,
      error: null,
    })

    render(<TickerTape />)
    // Duplicated for seamless scroll, so use getAllByText
    expect(screen.getAllByText('XLK').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('XLE').length).toBeGreaterThanOrEqual(1)
  })

  it('shows green color for positive change', () => {
    mockUseMarketData.mockReturnValue({
      quotes: [
        { symbol: 'XLK', price: 200.5, change: 3.25, changePercent: 1.65 },
      ],
      loading: false,
      error: null,
    })

    render(<TickerTape />)
    const changeEls = screen.getAllByText(/\+1\.65%/)
    expect(changeEls[0].className).toMatch(/positive|green/)
  })

  it('shows red color for negative change', () => {
    mockUseMarketData.mockReturnValue({
      quotes: [
        { symbol: 'XLE', price: 85.0, change: -1.5, changePercent: -1.73 },
      ],
      loading: false,
      error: null,
    })

    render(<TickerTape />)
    const changeEls = screen.getAllByText(/-1\.73%/)
    expect(changeEls[0].className).toMatch(/negative|red/)
  })

  it('shows loading state', () => {
    mockUseMarketData.mockReturnValue({
      quotes: [],
      loading: true,
      error: null,
    })

    render(<TickerTape />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('formats price with 2 decimal places', () => {
    mockUseMarketData.mockReturnValue({
      quotes: [
        { symbol: 'XLK', price: 200.5, change: 3.25, changePercent: 1.65 },
      ],
      loading: false,
      error: null,
    })

    render(<TickerTape />)
    expect(screen.getAllByText('$200.50').length).toBeGreaterThanOrEqual(1)
  })
})
