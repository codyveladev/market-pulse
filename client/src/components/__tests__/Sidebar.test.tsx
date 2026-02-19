import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'
import { useNavigationStore } from '../../store/navigationStore'

describe('Sidebar', () => {
  beforeEach(() => {
    useNavigationStore.setState({ activeTab: 'news' })
  })

  it('renders News and Markets nav items', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /News/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Markets/ })).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(<Sidebar />)
    const newsButton = screen.getByRole('button', { name: /News/ })
    expect(newsButton.className).toMatch(/brand/)
  })

  it('does not highlight the inactive tab', () => {
    render(<Sidebar />)
    const marketsButton = screen.getByRole('button', { name: /Markets/ })
    expect(marketsButton.className).not.toMatch(/brand/)
  })

  it('switches to markets tab on click', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    await user.click(screen.getByRole('button', { name: /Markets/ }))
    expect(useNavigationStore.getState().activeTab).toBe('markets')
  })

  it('switches back to news tab on click', async () => {
    useNavigationStore.setState({ activeTab: 'markets' })
    const user = userEvent.setup()
    render(<Sidebar />)

    await user.click(screen.getByRole('button', { name: /News/ }))
    expect(useNavigationStore.getState().activeTab).toBe('news')
  })
})
