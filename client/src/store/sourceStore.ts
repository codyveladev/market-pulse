import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SourceState {
  selectedSources: string[]
  toggleSource: (source: string) => void
  selectAll: (sources: string[]) => void
  clearAll: () => void
  isSourceSelected: (source: string) => boolean
}

export const useSourceStore = create<SourceState>()(
  persist(
    (set, get) => ({
      selectedSources: [],

      toggleSource: (source: string) => {
        set((state) => {
          const exists = state.selectedSources.includes(source)
          return {
            selectedSources: exists
              ? state.selectedSources.filter((s) => s !== source)
              : [...state.selectedSources, source],
          }
        })
      },

      selectAll: (sources: string[]) => {
        set({ selectedSources: [...sources] })
      },

      clearAll: () => {
        set({ selectedSources: [] })
      },

      isSourceSelected: (source: string) => {
        return get().selectedSources.includes(source)
      },
    }),
    {
      name: 'market-pulse-sources',
    }
  )
)
