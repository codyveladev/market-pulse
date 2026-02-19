import NodeCache from 'node-cache'

const DEFAULT_TTL_SECONDS = 90

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: 30,
  useClones: false,
})

export const cacheService = {
  get<T>(key: string): T | undefined {
    return cache.get<T>(key)
  },

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    if (ttlSeconds !== undefined) {
      cache.set(key, value, ttlSeconds)
    } else {
      cache.set(key, value)
    }
  },

  flush(): void {
    cache.flushAll()
  },

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }
    const fresh = await fetcher()
    this.set(key, fresh, ttlSeconds)
    return fresh
  },
}
