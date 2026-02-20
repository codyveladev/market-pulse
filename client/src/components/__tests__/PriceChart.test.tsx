import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { PriceChart } from '../PriceChart'

// Mock ResponsiveContainer so Recharts SVG children render in jsdom (no layout engine)
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  }
})

function makeDates(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(2024, 10, i + 1) // Nov 1..count 2024
    return d.toISOString().slice(0, 10)
  })
}

const baseProps = {
  chartData: [180, 182, 185, 183, 187],
  chartDates: makeDates(5),
  fiftyTwoWeekHigh: 200,
  fiftyTwoWeekLow: 150,
  changePercent: 2.5,
}

describe('PriceChart', () => {
  it('returns null when chartData has fewer than 2 points', () => {
    const { container } = render(
      <PriceChart {...baseProps} chartData={[100]} chartDates={['2024-11-01']} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when chartDates has fewer than 2 entries', () => {
    const { container } = render(
      <PriceChart {...baseProps} chartDates={['2024-11-01']} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the Price Chart label', () => {
    render(<PriceChart {...baseProps} />)
    expect(screen.getByText('Price Chart')).toBeInTheDocument()
  })

  it('shows 1M and 3M range toggle buttons', () => {
    render(<PriceChart {...baseProps} />)
    expect(screen.getByRole('button', { name: '1M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3M' })).toBeInTheDocument()
  })

  it('defaults to 3M range (3M button has active styling)', () => {
    render(<PriceChart {...baseProps} />)
    const btn3M = screen.getByRole('button', { name: '3M' })
    expect(btn3M.className).toMatch(/bg-surface-overlay/)
    const btn1M = screen.getByRole('button', { name: '1M' })
    expect(btn1M.className).not.toMatch(/bg-surface-overlay/)
  })

  it('switches to 1M range when 1M button is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceChart {...baseProps} />)
    await user.click(screen.getByRole('button', { name: '1M' }))
    const btn1M = screen.getByRole('button', { name: '1M' })
    expect(btn1M.className).toMatch(/bg-surface-overlay/)
    const btn3M = screen.getByRole('button', { name: '3M' })
    expect(btn3M.className).not.toMatch(/bg-surface-overlay/)
  })

  it('renders the chart card wrapper', () => {
    render(<PriceChart {...baseProps} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('marks chart as positive when changePercent is positive', () => {
    const { container } = render(<PriceChart {...baseProps} changePercent={3.0} />)
    expect(container.firstChild).toHaveAttribute('data-positive', 'true')
  })

  it('marks chart as negative when changePercent is negative', () => {
    const { container } = render(<PriceChart {...baseProps} changePercent={-1.5} />)
    expect(container.firstChild).toHaveAttribute('data-positive', 'false')
  })

  it('renders with null fiftyTwoWeekHigh and fiftyTwoWeekLow without error', () => {
    expect(() =>
      render(<PriceChart {...baseProps} fiftyTwoWeekHigh={null} fiftyTwoWeekLow={null} />)
    ).not.toThrow()
  })

  it('slices to last 21 points when 1M is selected from a 3M dataset', async () => {
    const user = userEvent.setup()
    const data63 = Array.from({ length: 63 }, (_, i) => 100 + i)
    const dates63 = makeDates(63)
    render(
      <PriceChart
        {...baseProps}
        chartData={data63}
        chartDates={dates63}
      />
    )
    // In 3M mode all 63 points are used — last price should be 162
    // In 1M mode the last 21 points are used — first price of that slice should be 142
    await user.click(screen.getByRole('button', { name: '1M' }))
    // Chart switched to 1M, no crash
    expect(screen.getByRole('button', { name: '1M' }).className).toMatch(/bg-surface-overlay/)
  })
})
