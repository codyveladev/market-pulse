import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { cacheService } from '../cache.js'

describe('cacheService', () => {
  beforeEach(() => {
    cacheService.flush()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for a cache miss', () => {
    expect(cacheService.get<string>('nonexistent')).toBeUndefined()
  })

  it('stores and retrieves a value', () => {
    cacheService.set('key1', { data: 'hello' })
    expect(cacheService.get<{ data: string }>('key1')).toEqual({ data: 'hello' })
  })

  it('expires entries after the default TTL (90s)', () => {
    cacheService.set('expiring', 'value')
    expect(cacheService.get('expiring')).toBe('value')

    // Advance past the 90s TTL
    vi.advanceTimersByTime(91_000)

    expect(cacheService.get('expiring')).toBeUndefined()
  })

  it('supports a custom TTL override', () => {
    cacheService.set('short-lived', 'value', 5) // 5 seconds
    expect(cacheService.get('short-lived')).toBe('value')

    vi.advanceTimersByTime(6_000)
    expect(cacheService.get('short-lived')).toBeUndefined()
  })

  it('flush clears all entries', () => {
    cacheService.set('a', 1)
    cacheService.set('b', 2)
    cacheService.flush()
    expect(cacheService.get('a')).toBeUndefined()
    expect(cacheService.get('b')).toBeUndefined()
  })

  it('getOrFetch returns cached value without calling the fetcher', async () => {
    cacheService.set('cached', 'existing')
    const fetcher = vi.fn().mockResolvedValue('fresh')

    const result = await cacheService.getOrFetch('cached', fetcher)
    expect(result).toBe('existing')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('getOrFetch calls fetcher on cache miss and stores result', async () => {
    const fetcher = vi.fn().mockResolvedValue('fresh-data')

    const result = await cacheService.getOrFetch('miss', fetcher)
    expect(result).toBe('fresh-data')
    expect(fetcher).toHaveBeenCalledOnce()
    expect(cacheService.get('miss')).toBe('fresh-data')
  })

  it('getOrFetch passes custom TTL to cache.set', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')

    await cacheService.getOrFetch('custom-ttl', fetcher, 10)
    expect(cacheService.get('custom-ttl')).toBe('data')

    vi.advanceTimersByTime(11_000)
    expect(cacheService.get('custom-ttl')).toBeUndefined()
  })

  it('getOrFetch propagates fetcher errors without caching', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network fail'))

    await expect(cacheService.getOrFetch('err', fetcher)).rejects.toThrow('network fail')
    expect(cacheService.get('err')).toBeUndefined()
  })
})
