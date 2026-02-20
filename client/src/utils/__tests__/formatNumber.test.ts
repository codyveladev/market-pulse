import { describe, it, expect } from 'vitest'
import { formatLargeNumber, formatVolume } from '../formatNumber'

describe('formatLargeNumber', () => {
  it('formats trillions', () => {
    expect(formatLargeNumber(2870000000000)).toBe('$2.87T')
  })

  it('formats billions', () => {
    expect(formatLargeNumber(150300000000)).toBe('$150.30B')
  })

  it('formats millions', () => {
    expect(formatLargeNumber(5200000)).toBe('$5.2M')
  })

  it('formats smaller numbers with commas', () => {
    expect(formatLargeNumber(12345)).toBe('$12,345')
  })
})

describe('formatVolume', () => {
  it('formats with commas', () => {
    expect(formatVolume(48200000)).toBe('48,200,000')
  })

  it('handles small numbers', () => {
    expect(formatVolume(500)).toBe('500')
  })
})
