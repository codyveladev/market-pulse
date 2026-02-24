import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AIAnalystCard } from '../AIAnalystCard'

const mockStart = vi.fn()
const mockRegenerate = vi.fn()

vi.mock('../../hooks/useAIAnalysis', () => ({
  useAIAnalysis: vi.fn(),
}))

import { useAIAnalysis } from '../../hooks/useAIAnalysis'
const mockUseAIAnalysis = vi.mocked(useAIAnalysis)

function setHookState(overrides: Partial<ReturnType<typeof useAIAnalysis>> = {}) {
  mockUseAIAnalysis.mockReturnValue({
    text: '',
    loading: false,
    error: null,
    isStreaming: false,
    cached: false,
    start: mockStart,
    regenerate: mockRegenerate,
    ...overrides,
  })
}

describe('AIAnalystCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHookState()
  })

  it('returns null when no symbol', () => {
    const { container } = render(<AIAnalystCard symbol="" dataReady={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows generate button when data is ready and analysis not started', () => {
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
    expect(screen.getByText('Generate AI Analysis')).toBeInTheDocument()
  })

  it('calls start when generate button is clicked', () => {
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    fireEvent.click(screen.getByTestId('generate-btn'))
    expect(mockStart).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    setHookState({ loading: true })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
    expect(screen.getByText('Analyzing AAPL...')).toBeInTheDocument()
    expect(screen.queryByTestId('generate-btn')).not.toBeInTheDocument()
  })

  it('shows streamed text with cursor', () => {
    setHookState({ text: 'Analysis text here', isStreaming: true })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('ai-text')).toHaveTextContent('Analysis text here')
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument()
  })

  it('shows disclaimer after streaming completes', () => {
    setHookState({ text: 'Completed analysis' })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
    expect(screen.getByText(/not financial advice/i)).toBeInTheDocument()
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument()
  })

  it('shows error message', () => {
    setHookState({ error: 'Rate limited' })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('ai-error')).toHaveTextContent('Rate limited')
  })

  it('shows cached badge when response is from cache', () => {
    setHookState({ text: 'Cached response', cached: true })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    expect(screen.getByTestId('cached-badge')).toHaveTextContent('cached')
  })

  it('shows regenerate button after text is available', () => {
    setHookState({ text: 'Some analysis' })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    const btn = screen.getByTestId('regenerate-btn')
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(mockRegenerate).toHaveBeenCalled()
  })

  it('disables regenerate button during streaming', () => {
    setHookState({ text: 'Partial', isStreaming: true })
    render(<AIAnalystCard symbol="AAPL" dataReady={true} />)
    const btn = screen.getByTestId('regenerate-btn')
    expect(btn).toBeDisabled()
  })
})
