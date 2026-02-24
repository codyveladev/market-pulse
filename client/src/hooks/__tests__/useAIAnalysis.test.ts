import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAIAnalysis } from '../useAIAnalysis'

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: (() => void) | null = null
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    this.closed = true
  }

  // Test helper: simulate server sending a message
  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent)
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror()
    }
  }
}

vi.stubGlobal('EventSource', MockEventSource)

describe('useAIAnalysis', () => {
  beforeEach(() => {
    MockEventSource.instances = []
  })

  it('returns idle state when start has not been called', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))
    expect(result.current.text).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isStreaming).toBe(false)
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('sets loading true on start', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    expect(result.current.loading).toBe(true)
    expect(MockEventSource.instances).toHaveLength(1)
    expect(MockEventSource.instances[0].url).toContain('symbol=AAPL')
    expect(MockEventSource.instances[0].url).not.toContain('regenerate')
  })

  it('appends text on chunk events', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    const es = MockEventSource.instances[0]
    act(() => es.simulateMessage({ type: 'chunk', text: 'Hello ' }))
    expect(result.current.text).toBe('Hello ')
    expect(result.current.isStreaming).toBe(true)
    expect(result.current.loading).toBe(false)

    act(() => es.simulateMessage({ type: 'chunk', text: 'World' }))
    expect(result.current.text).toBe('Hello World')
  })

  it('sets cached flag on done event', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    const es = MockEventSource.instances[0]
    act(() => es.simulateMessage({ type: 'chunk', text: 'text' }))
    act(() => es.simulateMessage({ type: 'done', cached: true }))

    expect(result.current.cached).toBe(true)
    expect(result.current.isStreaming).toBe(false)
    expect(es.closed).toBe(true)
  })

  it('sets error on error events', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    const es = MockEventSource.instances[0]
    act(() => es.simulateMessage({ type: 'error', error: 'Rate limited' }))

    expect(result.current.error).toBe('Rate limited')
    expect(result.current.loading).toBe(false)
    expect(result.current.isStreaming).toBe(false)
  })

  it('sets error on EventSource connection failure', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    const es = MockEventSource.instances[0]
    act(() => es.simulateError())

    expect(result.current.error).toBe('Connection to AI analysis failed')
  })

  it('cleans up EventSource on unmount', () => {
    const { result, unmount } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())

    const es = MockEventSource.instances[0]
    expect(es.closed).toBe(false)

    unmount()
    expect(es.closed).toBe(true)
  })

  it('regenerate sends regenerate=1 param', () => {
    const { result } = renderHook(() => useAIAnalysis('AAPL'))

    act(() => result.current.start())
    const es1 = MockEventSource.instances[0]
    act(() => es1.simulateMessage({ type: 'chunk', text: 'old' }))
    act(() => es1.simulateMessage({ type: 'done', cached: false }))

    act(() => result.current.regenerate())

    expect(MockEventSource.instances).toHaveLength(2)
    const es2 = MockEventSource.instances[1]
    expect(es2.url).toContain('regenerate=1')
    expect(es1.closed).toBe(true)
    expect(result.current.text).toBe('')
  })

  it('resets state on symbol change', () => {
    const { result, rerender } = renderHook(
      ({ symbol }) => useAIAnalysis(symbol),
      { initialProps: { symbol: 'AAPL' } },
    )

    act(() => result.current.start())
    const es = MockEventSource.instances[0]
    act(() => es.simulateMessage({ type: 'chunk', text: 'data' }))

    rerender({ symbol: 'MSFT' })

    expect(result.current.text).toBe('')
    expect(result.current.loading).toBe(false)
    expect(es.closed).toBe(true)
  })
})
