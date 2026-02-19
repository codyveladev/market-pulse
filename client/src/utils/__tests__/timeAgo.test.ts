import { describe, it, expect, vi, afterEach } from 'vitest'
import { timeAgo } from '../timeAgo'

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for times less than 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T12:00:30Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('just now')
  })

  it('returns "X min ago" for minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T12:12:00Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('12 min ago')
  })

  it('returns "1 min ago" for singular', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T12:01:30Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('1 min ago')
  })

  it('returns "X hr ago" for hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T15:00:00Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('3 hr ago')
  })

  it('returns "1 hr ago" for singular', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-18T13:30:00Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('1 hr ago')
  })

  it('returns "X days ago" for days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-20T12:00:00Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('2 days ago')
  })

  it('returns "1 day ago" for singular', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-19T12:00:00Z'))
    expect(timeAgo('2026-02-18T12:00:00Z')).toBe('1 day ago')
  })
})
