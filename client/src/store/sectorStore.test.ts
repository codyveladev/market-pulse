import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SECTORS } from '../constants/sectors'

// Mock localStorage before importing the store so the persist middleware
// picks up our fake storage on module load.
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get _store() {
      return store
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Dynamic import so each test file gets the mock in place first.
// We re-import the store module for isolation via vi.resetModules where needed.
const { useSectorStore } = await import('./sectorStore')

// Helper: get the plain state without React rendering
const getState = () => useSectorStore.getState()
const { toggleSector, selectAll, clearAll } = getState()

describe('sectorStore — initial state', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Reset store to defaults
    clearAll()
  })

  it('starts with an empty selectedIds set', () => {
    expect(getState().selectedIds).toEqual([])
  })

  it('exposes toggle, selectAll, and clearAll actions', () => {
    const state = getState()
    expect(typeof state.toggleSector).toBe('function')
    expect(typeof state.selectAll).toBe('function')
    expect(typeof state.clearAll).toBe('function')
  })
})

describe('sectorStore — toggleSector', () => {
  beforeEach(() => {
    clearAll()
  })

  it('adds a sector ID when it is not selected', () => {
    toggleSector('technology')
    expect(getState().selectedIds).toEqual(['technology'])
  })

  it('removes a sector ID when it is already selected', () => {
    toggleSector('technology')
    toggleSector('technology')
    expect(getState().selectedIds).toEqual([])
  })

  it('supports multi-select — multiple sectors can be active', () => {
    toggleSector('technology')
    toggleSector('crypto')
    toggleSector('finance')
    expect(getState().selectedIds).toEqual(['technology', 'crypto', 'finance'])
  })

  it('only removes the toggled sector, leaving others intact', () => {
    toggleSector('technology')
    toggleSector('crypto')
    toggleSector('finance')
    toggleSector('crypto') // deselect crypto
    expect(getState().selectedIds).toEqual(['technology', 'finance'])
  })

  it('ignores duplicate toggles on — no duplicate IDs', () => {
    toggleSector('technology')
    // Directly calling the store action again for the same sector should toggle off, not duplicate
    toggleSector('technology')
    toggleSector('technology')
    expect(getState().selectedIds).toEqual(['technology'])
  })
})

describe('sectorStore — selectAll / clearAll', () => {
  beforeEach(() => {
    clearAll()
  })

  it('selectAll adds all 10 sector IDs', () => {
    selectAll()
    const ids = getState().selectedIds
    expect(ids).toHaveLength(SECTORS.length)
    for (const sector of SECTORS) {
      expect(ids).toContain(sector.id)
    }
  })

  it('clearAll removes every selection', () => {
    selectAll()
    clearAll()
    expect(getState().selectedIds).toEqual([])
  })

  it('selectAll is idempotent — calling twice gives same result', () => {
    selectAll()
    selectAll()
    expect(getState().selectedIds).toHaveLength(SECTORS.length)
  })
})

describe('sectorStore — localStorage persistence', () => {
  beforeEach(() => {
    localStorageMock.clear()
    clearAll()
  })

  it('writes to localStorage when state changes', () => {
    toggleSector('technology')
    // Zustand persist middleware serializes state to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled()
    const stored = localStorageMock.getItem('market-pulse-sectors')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed.state.selectedIds).toContain('technology')
  })

  it('uses the correct storage key', () => {
    toggleSector('crypto')
    const calls = localStorageMock.setItem.mock.calls
    const keyUsed = calls.some(
      ([key]: [string, string]) => key === 'market-pulse-sectors'
    )
    expect(keyUsed).toBe(true)
  })
})

describe('sectorStore — derived helpers', () => {
  beforeEach(() => {
    clearAll()
  })

  it('getSelectedSectors returns full SectorConfig objects for selected IDs', () => {
    toggleSector('technology')
    toggleSector('aerospace')
    const selected = getState().getSelectedSectors()
    expect(selected).toHaveLength(2)
    expect(selected[0].id).toBe('technology')
    expect(selected[1].id).toBe('aerospace')
    // Ensure they are full objects, not just IDs
    expect(selected[0].label).toBe('Technology')
    expect(selected[0].keywords.length).toBeGreaterThan(0)
  })

  it('getSelectedSectors returns empty array when nothing is selected', () => {
    expect(getState().getSelectedSectors()).toEqual([])
  })

  it('isSectorSelected returns true for selected, false for unselected', () => {
    toggleSector('crypto')
    expect(getState().isSectorSelected('crypto')).toBe(true)
    expect(getState().isSectorSelected('technology')).toBe(false)
  })
})
