import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketCard } from '../MarketCard'
import type { QuoteData } from '@shared/types'

const positiveQuote: QuoteData = {
  symbol: 'SPY',
  name: 'SPDR S&P 500 ETF',
  price: 520.5,
  change: 3.25,
  changePercent: 0.63,
  dayHigh: 522.0,
  dayLow: 518.0,
}

const negativeQuote: QuoteData = {
  symbol: 'QQQ',
  name: 'Invesco QQQ Trust',
  price: 450.0,
  change: -2.1,
  changePercent: -0.47,
  dayHigh: 453.0,
  dayLow: 448.5,
}

const minimalQuote: QuoteData = {
  symbol: 'XLK',
  price: 200.0,
  change: 1.0,
  changePercent: 0.5,
}

describe('MarketCard', () => {
  it('renders symbol and name', () => {
    render(<MarketCard quote={positiveQuote} />)
    expect(screen.getByText('SPY')).toBeInTheDocument()
    expect(screen.getByText('SPDR S&P 500 ETF')).toBeInTheDocument()
  })

  it('renders price', () => {
    render(<MarketCard quote={positiveQuote} />)
    expect(screen.getByText('$520.50')).toBeInTheDocument()
  })

  it('renders change and percent change for positive values', () => {
    render(<MarketCard quote={positiveQuote} />)
    expect(screen.getByText('+$3.25')).toBeInTheDocument()
    expect(screen.getByText('+0.63%')).toBeInTheDocument()
  })

  it('renders change and percent change for negative values', () => {
    render(<MarketCard quote={negativeQuote} />)
    expect(screen.getByText('-$2.10')).toBeInTheDocument()
    expect(screen.getByText('-0.47%')).toBeInTheDocument()
  })

  it('applies green styling for positive change', () => {
    const { container } = render(<MarketCard quote={positiveQuote} />)
    const changeEl = container.querySelector('.text-positive')
    expect(changeEl).toBeTruthy()
  })

  it('applies red styling for negative change', () => {
    const { container } = render(<MarketCard quote={negativeQuote} />)
    const changeEl = container.querySelector('.text-negative')
    expect(changeEl).toBeTruthy()
  })

  it('renders day high and low when available', () => {
    render(<MarketCard quote={positiveQuote} />)
    expect(screen.getByText('H 522.00')).toBeInTheDocument()
    expect(screen.getByText('L 518.00')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    render(<MarketCard quote={minimalQuote} />)
    expect(screen.getByText('XLK')).toBeInTheDocument()
    expect(screen.getByText('$200.00')).toBeInTheDocument()
    expect(screen.queryByText('SPDR')).not.toBeInTheDocument()
  })
})
