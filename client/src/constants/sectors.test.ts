import { describe, it, expect } from 'vitest'
import { SECTORS, getSectorById, getSectorsByIds } from './sectors'
import type { SectorConfig } from '@shared/types'

const EXPECTED_SECTOR_IDS = [
  'technology',
  'oil-gas',
  'automotive',
  'finance',
  'healthcare',
  'real-estate',
  'crypto',
  'commodities',
  'retail',
  'aerospace',
]

describe('SECTORS', () => {
  it('contains exactly 10 sectors', () => {
    expect(SECTORS).toHaveLength(10)
  })

  it('includes all expected sector IDs', () => {
    const ids = SECTORS.map((s) => s.id)
    expect(ids).toEqual(EXPECTED_SECTOR_IDS)
  })

  it.each(EXPECTED_SECTOR_IDS)('sector "%s" has all required fields', (id) => {
    const sector = SECTORS.find((s) => s.id === id) as SectorConfig
    expect(sector).toBeDefined()
    expect(sector.label).toBeTruthy()
    expect(sector.icon).toBeTruthy()
    expect(sector.keywords.length).toBeGreaterThan(0)
    expect(sector.tickers.length).toBeGreaterThan(0)
    expect(sector.etfSymbol).toBeTruthy()
  })

  it('has unique IDs', () => {
    const ids = SECTORS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique ETF symbols', () => {
    const etfs = SECTORS.map((s) => s.etfSymbol)
    expect(new Set(etfs).size).toBe(etfs.length)
  })
})

describe('getSectorById', () => {
  it('returns the correct sector for a valid ID', () => {
    const sector = getSectorById('technology')
    expect(sector).toBeDefined()
    expect(sector!.label).toBe('Technology')
  })

  it('returns undefined for an invalid ID', () => {
    expect(getSectorById('nonexistent')).toBeUndefined()
  })
})

describe('getSectorsByIds', () => {
  it('returns multiple sectors matching the given IDs', () => {
    const result = getSectorsByIds(['technology', 'crypto'])
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.id)).toEqual(['technology', 'crypto'])
  })

  it('skips invalid IDs without erroring', () => {
    const result = getSectorsByIds(['technology', 'fake'])
    expect(result).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(getSectorsByIds([])).toEqual([])
  })
})
