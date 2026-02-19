import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectorSelector } from '../SectorSelector'
import { SECTORS } from '../../constants/sectors'
import { useSectorStore } from '../../store/sectorStore'

describe('SectorSelector', () => {
  beforeEach(() => {
    useSectorStore.setState({ selectedIds: [] })
  })

  it('renders a button for each sector', () => {
    render(<SectorSelector />)
    for (const sector of SECTORS) {
      expect(screen.getByRole('button', { name: new RegExp(sector.label) })).toBeInTheDocument()
    }
  })

  it('displays sector icons', () => {
    render(<SectorSelector />)
    for (const sector of SECTORS) {
      expect(screen.getByText(sector.icon)).toBeInTheDocument()
    }
  })

  it('toggles a sector on click', async () => {
    const user = userEvent.setup()
    render(<SectorSelector />)

    const techButton = screen.getByRole('button', { name: /Technology/ })
    await user.click(techButton)

    expect(useSectorStore.getState().selectedIds).toContain('technology')
  })

  it('deselects a sector on second click', async () => {
    useSectorStore.setState({ selectedIds: ['technology'] })
    const user = userEvent.setup()
    render(<SectorSelector />)

    const techButton = screen.getByRole('button', { name: /Technology/ })
    await user.click(techButton)

    expect(useSectorStore.getState().selectedIds).not.toContain('technology')
  })

  it('applies active styling to selected sectors', () => {
    useSectorStore.setState({ selectedIds: ['technology'] })
    render(<SectorSelector />)

    const techButton = screen.getByRole('button', { name: /Technology/ })
    expect(techButton.className).toMatch(/ring|border|brand|active/)
  })

  it('does not apply active styling to unselected sectors', () => {
    useSectorStore.setState({ selectedIds: [] })
    render(<SectorSelector />)

    const techButton = screen.getByRole('button', { name: /Technology/ })
    // Should not have brand/active classes when unselected
    expect(techButton.className).not.toMatch(/brand/)
  })

  it('supports multi-select (multiple sectors active)', async () => {
    const user = userEvent.setup()
    render(<SectorSelector />)

    await user.click(screen.getByRole('button', { name: /Technology/ }))
    await user.click(screen.getByRole('button', { name: /Crypto/ }))

    const state = useSectorStore.getState()
    expect(state.selectedIds).toContain('technology')
    expect(state.selectedIds).toContain('crypto')
  })

  it('renders all 10 sector buttons', () => {
    render(<SectorSelector />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(10)
  })
})
