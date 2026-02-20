import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResearchPage } from '../ResearchPage'

// Recharts ResponsiveContainer (used in PriceChart) needs ResizeObserver as a constructor
const _ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = _ResizeObserver as unknown as typeof ResizeObserver

vi.mock('../../hooks/useResearch', () => ({
  useResearch: vi.fn(),
}))

import { useResearch } from '../../hooks/useResearch'

const mockUseResearch = vi.mocked(useResearch)

const MOCK_DATA = {
  overview: {
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
    chartData: [185, 186, 187, 188, 189],
    chartDates: ['2024-11-01', '2024-11-04', '2024-11-05', '2024-11-06', '2024-11-07'],
  },
  profile: { name: 'Apple Inc', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: 2870000 },
  financials: { peRatio: 31.2, eps: 6.13, beta: 1.29, dividendYield: 0.55 },
  news: [{ headline: 'Apple earnings', summary: 'Strong', url: 'https://example.com', source: 'Reuters', datetime: Math.floor(Date.now() / 1000) - 3600, image: null }],
  fetchedAt: new Date().toISOString(),
}

describe('ResearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseResearch.mockReturnValue({ data: null, loading: false, error: null, fetchedAt: null })
  })

  it('renders search bar in initial state', () => {
    render(<ResearchPage />)
    expect(screen.getByPlaceholderText(/enter stock symbol/i)).toBeInTheDocument()
  })

  it('shows prompt text initially', () => {
    render(<ResearchPage />)
    expect(screen.getByText(/search for a stock symbol to get started/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when searching', () => {
    mockUseResearch.mockReturnValue({ data: null, loading: true, error: null, fetchedAt: null })
    render(<ResearchPage />)
    expect(screen.getByTestId('research-skeleton')).toBeInTheDocument()
  })

  it('renders stock data after loading', () => {
    mockUseResearch.mockReturnValue({ data: MOCK_DATA, loading: false, error: null, fetchedAt: MOCK_DATA.fetchedAt })
    render(<ResearchPage />)
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('$189.84')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Apple earnings')).toBeInTheDocument()
  })

  it('shows error message when fetch fails', () => {
    mockUseResearch.mockReturnValue({ data: null, loading: false, error: 'Network failure', fetchedAt: null })
    render(<ResearchPage />)
    expect(screen.getByText(/failed to load research data/i)).toBeInTheDocument()
  })

  it('calls useResearch with symbol when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ResearchPage />)

    await user.type(screen.getByPlaceholderText(/enter stock symbol/i), 'AAPL{Enter}')

    expect(mockUseResearch).toHaveBeenCalledWith('AAPL')
  })

  it('shows updated timestamp after data loads', () => {
    mockUseResearch.mockReturnValue({ data: MOCK_DATA, loading: false, error: null, fetchedAt: new Date().toISOString() })
    render(<ResearchPage />)
    expect(screen.getByText(/updated/i)).toBeInTheDocument()
  })
})
