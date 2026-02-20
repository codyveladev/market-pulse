import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from '../FilterPanel'
import { useSectorStore } from '../../store/sectorStore'
import { useSourceStore } from '../../store/sourceStore'

describe('FilterPanel', () => {
  beforeEach(() => {
    useSectorStore.setState({ selectedIds: [] })
    useSourceStore.setState({ selectedSources: [] })
  })

  it('renders a Sectors heading', () => {
    render(<FilterPanel availableSources={[]} />)
    expect(screen.getByText('Sectors')).toBeInTheDocument()
  })

  it('renders a Sources heading', () => {
    render(<FilterPanel availableSources={[]} />)
    expect(screen.getByText('Sources')).toBeInTheDocument()
  })

  it('renders sector buttons', () => {
    render(<FilterPanel availableSources={[]} />)
    expect(screen.getByRole('button', { name: /Technology/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crypto/ })).toBeInTheDocument()
  })

  it('renders source buttons from availableSources prop', () => {
    render(<FilterPanel availableSources={['Reuters', 'AP News']} />)
    expect(screen.getByRole('button', { name: 'Reuters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AP News' })).toBeInTheDocument()
  })

  it('toggles a sector on click', async () => {
    const user = userEvent.setup()
    render(<FilterPanel availableSources={[]} />)

    await user.click(screen.getByRole('button', { name: /Technology/ }))

    expect(useSectorStore.getState().selectedIds).toContain('technology')
  })

  it('shows mobile Filters toggle button', () => {
    render(<FilterPanel availableSources={[]} />)
    expect(screen.getByRole('button', { name: /toggle filters/i })).toBeInTheDocument()
  })
})
