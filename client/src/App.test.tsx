import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

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

describe('App', () => {
  it('renders the Market Pulse heading', () => {
    render(<App />)
    expect(screen.getByText('Market Pulse')).toBeInTheDocument()
  })

  it('renders the TickerTape section', () => {
    render(<App />)
    // TickerTape shows loading or quote data
    expect(document.querySelector('[class*="border-b"]')).toBeTruthy()
  })

  it('renders sector selector buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Technology/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crypto/ })).toBeInTheDocument()
  })

  it('renders the news feed section', () => {
    render(<App />)
    expect(screen.getByText(/News Feed/)).toBeInTheDocument()
  })

  it('renders the refresh button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Refresh/ })).toBeInTheDocument()
  })
})
