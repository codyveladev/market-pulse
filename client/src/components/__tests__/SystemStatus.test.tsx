import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SystemStatus } from '../SystemStatus'

vi.mock('../../hooks/useSystemStatus', () => ({
  useSystemStatus: vi.fn(() => ({
    services: [
      { name: 'Yahoo Finance', status: 'ok', message: 'Connected' },
      { name: 'RSS Feeds', status: 'ok', message: 'Connected' },
      { name: 'NewsAPI', status: 'down', message: 'Down' },
      { name: 'Finnhub', status: 'unconfigured', message: 'No API Key' },
      { name: 'Alpha Vantage', status: 'unused', message: 'Not Implemented' },
    ],
    loading: false,
    error: null,
  })),
}))

describe('SystemStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Partner System Status heading', () => {
    render(<SystemStatus />)
    expect(screen.getByRole('heading', { name: 'Partner System Status' })).toBeInTheDocument()
  })

  it('renders a card for each service', () => {
    render(<SystemStatus />)
    expect(screen.getByText('Yahoo Finance')).toBeInTheDocument()
    expect(screen.getByText('RSS Feeds')).toBeInTheDocument()
    expect(screen.getByText('NewsAPI')).toBeInTheDocument()
    expect(screen.getByText('Finnhub')).toBeInTheDocument()
    expect(screen.getByText('Alpha Vantage')).toBeInTheDocument()
  })

  it('shows Connected label for ok status', () => {
    render(<SystemStatus />)
    const connectedLabels = screen.getAllByText('Connected')
    expect(connectedLabels.length).toBe(2)
  })

  it('shows Down label for down status', () => {
    render(<SystemStatus />)
    expect(screen.getByText('Down')).toBeInTheDocument()
  })

  it('shows No API Key label for unconfigured status', () => {
    render(<SystemStatus />)
    expect(screen.getByText('No API Key')).toBeInTheDocument()
  })

  it('shows Not Implemented label for unused status', () => {
    render(<SystemStatus />)
    expect(screen.getByText('Not Implemented')).toBeInTheDocument()
  })

  it('shows green indicator for ok status', () => {
    const { container } = render(<SystemStatus />)
    const greenDots = container.querySelectorAll('.bg-positive')
    expect(greenDots.length).toBe(2)
  })

  it('shows red indicator for down status', () => {
    const { container } = render(<SystemStatus />)
    const redDots = container.querySelectorAll('.bg-negative')
    expect(redDots.length).toBe(1)
  })

  it('shows loading skeleton state', async () => {
    const { useSystemStatus } = await import('../../hooks/useSystemStatus')
    vi.mocked(useSystemStatus).mockReturnValue({
      services: [],
      loading: true,
      error: null,
    })

    const { container } = render(<SystemStatus />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})
