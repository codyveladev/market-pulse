import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SECTORS, getSectorsByIds } from '../constants/sectors'
import type { SectorConfig } from '@shared/types'

interface SectorState {
  selectedIds: string[]
  toggleSector: (id: string) => void
  selectAll: () => void
  clearAll: () => void
  getSelectedSectors: () => SectorConfig[]
  isSectorSelected: (id: string) => boolean
}

export const useSectorStore = create<SectorState>()(
  persist(
    (set, get) => ({
      selectedIds: [],

      toggleSector: (id: string) => {
        set((state) => {
          const exists = state.selectedIds.includes(id)
          return {
            selectedIds: exists
              ? state.selectedIds.filter((s) => s !== id)
              : [...state.selectedIds, id],
          }
        })
      },

      selectAll: () => {
        set({ selectedIds: SECTORS.map((s) => s.id) })
      },

      clearAll: () => {
        set({ selectedIds: [] })
      },

      getSelectedSectors: () => {
        return getSectorsByIds(get().selectedIds)
      },

      isSectorSelected: (id: string) => {
        return get().selectedIds.includes(id)
      },
    }),
    {
      name: 'market-pulse-sectors',
    }
  )
)
