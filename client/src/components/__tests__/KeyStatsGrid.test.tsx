import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyStatsGrid } from '../KeyStatsGrid'
import type { StockOverview, CompanyFinancials } from '../../../../shared/types'

const overview: StockOverview = {
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

const financials: CompanyFinancials = {
  peRatio: 31.2,
  eps: 6.13,
  beta: 1.29,
  dividendYield: 0.55,
}

describe('KeyStatsGrid', () => {
  it('renders market cap formatted', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('$2.87T')).toBeInTheDocument()
  })

  it('renders volume formatted', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('48,200,000')).toBeInTheDocument()
  })

  it('renders PE ratio and EPS', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('31.20')).toBeInTheDocument()
    expect(screen.getByText('$6.13')).toBeInTheDocument()
  })

  it('renders 52-week high and low', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('$199.62')).toBeInTheDocument()
    expect(screen.getByText('$124.17')).toBeInTheDocument()
  })

  it('renders day high and low', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('$191.00')).toBeInTheDocument()
    expect(screen.getByText('$188.00')).toBeInTheDocument()
  })

  it('shows N/A for null financials', () => {
    render(<KeyStatsGrid overview={overview} financials={null} />)
    const naItems = screen.getAllByText('N/A')
    expect(naItems.length).toBeGreaterThanOrEqual(4)
  })

  it('renders beta and dividend yield', () => {
    render(<KeyStatsGrid overview={overview} financials={financials} />)
    expect(screen.getByText('1.29')).toBeInTheDocument()
    expect(screen.getByText('0.55%')).toBeInTheDocument()
  })
})
