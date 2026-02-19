import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketCategoryFilter } from '../MarketCategoryFilter'
import { MARKET_CATEGORIES } from '../../constants/marketCategories'

describe('MarketCategoryFilter', () => {
  const defaultSelected = ['indices', 'mag7']

  it('renders a button for each market category', () => {
    render(<MarketCategoryFilter selectedIds={defaultSelected} onToggle={() => {}} />)
    for (const cat of MARKET_CATEGORIES) {
      expect(screen.getByRole('button', { name: new RegExp(cat.label) })).toBeInTheDocument()
    }
  })

  it('highlights selected categories with brand styling', () => {
    render(<MarketCategoryFilter selectedIds={['indices']} onToggle={() => {}} />)
    const indicesButton = screen.getByRole('button', { name: /Major Indices/ })
    expect(indicesButton.className).toMatch(/brand/)
  })

  it('does not highlight unselected categories', () => {
    render(<MarketCategoryFilter selectedIds={['indices']} onToggle={() => {}} />)
    const mag7Button = screen.getByRole('button', { name: /Magnificent 7/ })
    expect(mag7Button.className).not.toMatch(/brand/)
  })

  it('calls onToggle with category id when clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<MarketCategoryFilter selectedIds={defaultSelected} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: /Technology/ }))
    expect(onToggle).toHaveBeenCalledWith('technology')
  })

  it('calls onToggle to deselect an active category', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<MarketCategoryFilter selectedIds={defaultSelected} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: /Major Indices/ }))
    expect(onToggle).toHaveBeenCalledWith('indices')
  })

  it('renders category icons', () => {
    render(<MarketCategoryFilter selectedIds={[]} onToggle={() => {}} />)
    for (const cat of MARKET_CATEGORIES) {
      expect(screen.getByText(cat.icon)).toBeInTheDocument()
    }
  })
})
