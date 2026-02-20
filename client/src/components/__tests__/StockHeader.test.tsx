import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockHeader } from '../StockHeader'
import type { StockOverview } from '../../../../shared/types'

const baseOverview: StockOverview = {
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
  chartData: [],
}

describe('StockHeader', () => {
  it('renders company name and symbol', () => {
    render(<StockHeader overview={baseOverview} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('renders current price formatted to 2 decimals', () => {
    render(<StockHeader overview={baseOverview} />)
    expect(screen.getByText('$189.84')).toBeInTheDocument()
  })

  it('renders change and changePercent with sign', () => {
    render(<StockHeader overview={baseOverview} />)
    expect(screen.getByText(/\+2\.34/)).toBeInTheDocument()
    expect(screen.getByText(/\+1\.25%/)).toBeInTheDocument()
  })

  it('applies text-positive class for positive change', () => {
    const { container } = render(<StockHeader overview={baseOverview} />)
    const changeEl = container.querySelector('.text-positive')
    expect(changeEl).not.toBeNull()
  })

  it('applies text-negative class for negative change', () => {
    const negOverview = { ...baseOverview, change: -3.5, changePercent: -1.8 }
    const { container } = render(<StockHeader overview={negOverview} />)
    const changeEl = container.querySelector('.text-negative')
    expect(changeEl).not.toBeNull()
  })
})
