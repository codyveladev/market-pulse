import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundamentalsPanel } from '../FundamentalsPanel'
import type { FundamentalData } from '../../../../shared/types'

const fullData: FundamentalData = {
  pegRatio: 2.237,
  forwardPE: 21.01,
  priceToBook: 7.51,
  priceToSales: 3.547,
  evToRevenue: 4.375,
  evToEbitda: 17.09,
  profitMargin: 0.157,
  operatingMargin: 0.231,
  returnOnEquity: 0.352,
  returnOnAssets: 0.0508,
  quarterlyRevenueGrowth: 0.122,
  quarterlyEarningsGrowth: 0.9,
  analystTargetPrice: 324.95,
  analystStrongBuy: 1,
  analystBuy: 9,
  analystHold: 8,
  analystSell: 2,
  analystStrongSell: 1,
}

describe('FundamentalsPanel', () => {
  it('renders the Fundamentals heading', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('Fundamentals')).toBeInTheDocument()
  })

  it('renders all three section headers', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('Valuation')).toBeInTheDocument()
    expect(screen.getByText('Profitability')).toBeInTheDocument()
    expect(screen.getByText('Growth (YoY)')).toBeInTheDocument()
  })

  it('renders valuation metrics', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('PEG Ratio')).toBeInTheDocument()
    expect(screen.getByText('2.24')).toBeInTheDocument()
    expect(screen.getByText('Forward P/E')).toBeInTheDocument()
    expect(screen.getByText('21.01')).toBeInTheDocument()
    expect(screen.getByText('EV / EBITDA')).toBeInTheDocument()
    expect(screen.getByText('17.09')).toBeInTheDocument()
  })

  it('renders profitability metrics as percentages', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('Profit Margin')).toBeInTheDocument()
    expect(screen.getByText('15.7%')).toBeInTheDocument()
    expect(screen.getByText('ROE')).toBeInTheDocument()
    expect(screen.getByText('35.2%')).toBeInTheDocument()
  })

  it('renders growth metrics as percentages', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('Revenue Growth')).toBeInTheDocument()
    expect(screen.getByText('12.2%')).toBeInTheDocument()
    expect(screen.getByText('Earnings Growth')).toBeInTheDocument()
    expect(screen.getByText('90.0%')).toBeInTheDocument()
  })

  it('renders analyst consensus bar with buy/hold/sell segments', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByTestId('analyst-bar')).toBeInTheDocument()
    expect(screen.getByTestId('bar-buy')).toBeInTheDocument()
    expect(screen.getByTestId('bar-hold')).toBeInTheDocument()
    expect(screen.getByTestId('bar-sell')).toBeInTheDocument()
  })

  it('shows analyst counts in legend', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    // Buy = strongBuy(1) + buy(9) = 10, Hold = 8, Sell = sell(2) + strongSell(1) = 3
    expect(screen.getByText('Buy 10')).toBeInTheDocument()
    expect(screen.getByText('Hold 8')).toBeInTheDocument()
    expect(screen.getByText('Sell 3')).toBeInTheDocument()
  })

  it('shows analyst target price with delta from current price', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    expect(screen.getByText('$324.95')).toBeInTheDocument()
    // delta = (324.95 - 256) / 256 * 100 = 26.9%
    expect(screen.getByText('(+26.9%)')).toBeInTheDocument()
  })

  it('shows negative delta when target is below current price', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={400.0} />)
    // delta = (324.95 - 400) / 400 * 100 = -18.8%
    expect(screen.getByText('(-18.8%)')).toBeInTheDocument()
  })

  it('shows N/A for null metric values', () => {
    const sparse: FundamentalData = {
      ...fullData,
      pegRatio: null,
      forwardPE: null,
      profitMargin: null,
      quarterlyRevenueGrowth: null,
    }
    render(<FundamentalsPanel fundamentals={sparse} currentPrice={256.0} />)
    const naElements = screen.getAllByText('N/A')
    expect(naElements.length).toBeGreaterThanOrEqual(4)
  })

  it('hides analyst bar when all analyst counts are null', () => {
    const noAnalyst: FundamentalData = {
      ...fullData,
      analystStrongBuy: null,
      analystBuy: null,
      analystHold: null,
      analystSell: null,
      analystStrongSell: null,
    }
    render(<FundamentalsPanel fundamentals={noAnalyst} currentPrice={256.0} />)
    expect(screen.queryByTestId('analyst-bar')).not.toBeInTheDocument()
  })

  it('renders correct bar segment widths', () => {
    render(<FundamentalsPanel fundamentals={fullData} currentPrice={256.0} />)
    const buyBar = screen.getByTestId('bar-buy')
    const holdBar = screen.getByTestId('bar-hold')
    const sellBar = screen.getByTestId('bar-sell')
    // total = 21, buy = 10 (47.6%), hold = 8 (38.1%), sell = 3 (14.3%)
    expect(buyBar.style.width).toContain('47.')
    expect(holdBar.style.width).toContain('38.')
    expect(sellBar.style.width).toContain('14.')
  })
})
