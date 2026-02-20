import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SourceFilter } from '../SourceFilter'
import { useSourceStore } from '../../store/sourceStore'

describe('SourceFilter', () => {
  beforeEach(() => {
    useSourceStore.setState({ selectedSources: [] })
  })

  it('renders a button for each source', () => {
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)
    expect(screen.getByRole('button', { name: 'Reuters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bloomberg' })).toBeInTheDocument()
  })

  it('toggles a source on click', async () => {
    const user = userEvent.setup()
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)

    await user.click(screen.getByRole('button', { name: 'Reuters' }))

    expect(useSourceStore.getState().selectedSources).toContain('Reuters')
  })

  it('deselects a source on second click', async () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    const user = userEvent.setup()
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)

    await user.click(screen.getByRole('button', { name: 'Reuters' }))

    expect(useSourceStore.getState().selectedSources).not.toContain('Reuters')
  })

  it('applies active styling to selected sources', () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)

    const reutersBtn = screen.getByRole('button', { name: 'Reuters' })
    expect(reutersBtn.className).toMatch(/brand/)
  })

  it('shows Clear button when sources are selected', () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears all selections when Clear is clicked', async () => {
    useSourceStore.setState({ selectedSources: ['Reuters', 'Bloomberg'] })
    const user = userEvent.setup()
    render(<SourceFilter sources={['Reuters', 'Bloomberg']} />)

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(useSourceStore.getState().selectedSources).toEqual([])
  })

  it('shows empty state when no sources are available', () => {
    render(<SourceFilter sources={[]} />)
    expect(screen.getByText(/no sources available/i)).toBeInTheDocument()
  })
})
