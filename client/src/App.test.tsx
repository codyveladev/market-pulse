import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { useNavigationStore } from './store/navigationStore'

// Mock the hooks to avoid real fetch calls
vi.mock('./hooks/useNews', () => ({
  useNews: vi.fn(() => ({
    articles: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    secondsUntilRefresh: 90,
  })),
}))

vi.mock('./hooks/useMarketData', () => ({
  useMarketData: vi.fn(() => ({
    quotes: [],
    loading: false,
    error: null,
  })),
}))

vi.mock('./hooks/useMarketQuotes', () => ({
  useMarketQuotes: vi.fn(() => ({
    quotes: [],
    loading: false,
    error: null,
  })),
}))

vi.mock('./hooks/useSystemStatus', () => ({
  useSystemStatus: vi.fn(() => ({
    services: [],
    loading: false,
    error: null,
  })),
}))

describe('App', () => {
  beforeEach(() => {
    useNavigationStore.setState({ activeTab: 'news' })
  })

  it('renders the Market Pulse heading', () => {
    render(<App />)
    expect(screen.getByText('Market Pulse')).toBeInTheDocument()
  })

  it('renders the TickerTape section', () => {
    render(<App />)
    expect(document.querySelector('[class*="border-b"]')).toBeTruthy()
  })

  it('renders the sidebar with News and Markets tabs', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /News/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Markets/ })).toBeInTheDocument()
  })

  it('renders sector selector buttons on news tab', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Technology/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crypto/ })).toBeInTheDocument()
  })

  it('renders the news feed section on news tab', () => {
    render(<App />)
    expect(screen.getByText(/News Feed/)).toBeInTheDocument()
  })

  it('switches to markets view when Markets tab is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Markets/ }))

    expect(screen.getByRole('heading', { name: 'Markets' })).toBeInTheDocument()
    expect(screen.queryByText(/News Feed/)).not.toBeInTheDocument()
  })

  it('hides news feed and refresh button on markets tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Markets/ }))

    expect(screen.queryByText(/News Feed/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Refresh/ })).not.toBeInTheDocument()
  })

  it('renders the refresh button on news tab', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Refresh/ })).toBeInTheDocument()
  })

  it('switches to status view when Status tab is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Status/ }))

    expect(screen.getByRole('heading', { name: 'Partner System Status' })).toBeInTheDocument()
    expect(screen.queryByText(/News Feed/)).not.toBeInTheDocument()
  })
})
