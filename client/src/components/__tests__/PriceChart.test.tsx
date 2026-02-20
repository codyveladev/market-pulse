import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceChart } from '../PriceChart'

describe('PriceChart', () => {
  it('renders an SVG element when chartData is provided', () => {
    render(<PriceChart chartData={[100, 105, 110, 108, 112]} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('does not render when chartData has fewer than 2 points', () => {
    const { container } = render(<PriceChart chartData={[100]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders a polyline element within the SVG', () => {
    const { container } = render(<PriceChart chartData={[100, 105, 110]} />)
    expect(container.querySelector('polyline')).not.toBeNull()
  })

  it('shows 3M label for the time range', () => {
    render(<PriceChart chartData={[100, 105, 110]} />)
    expect(screen.getByText('3M')).toBeInTheDocument()
  })
})
