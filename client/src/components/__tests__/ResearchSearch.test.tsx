import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResearchSearch } from '../ResearchSearch'

describe('ResearchSearch', () => {
  const onSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a text input with placeholder', () => {
    render(<ResearchSearch onSearch={onSearch} />)
    expect(screen.getByPlaceholderText(/enter stock symbol/i)).toBeInTheDocument()
  })

  it('renders a Search button', () => {
    render(<ResearchSearch onSearch={onSearch} />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('calls onSearch with uppercased symbol on form submit', async () => {
    const user = userEvent.setup()
    render(<ResearchSearch onSearch={onSearch} />)

    await user.type(screen.getByPlaceholderText(/enter stock symbol/i), 'aapl')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalledWith('AAPL')
  })

  it('calls onSearch on Enter key press', async () => {
    const user = userEvent.setup()
    render(<ResearchSearch onSearch={onSearch} />)

    await user.type(screen.getByPlaceholderText(/enter stock symbol/i), 'msft{Enter}')

    expect(onSearch).toHaveBeenCalledWith('MSFT')
  })

  it('does not call onSearch when input is empty', async () => {
    const user = userEvent.setup()
    render(<ResearchSearch onSearch={onSearch} />)

    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).not.toHaveBeenCalled()
  })
})
