import { useState } from 'react'
import { SECTORS } from '../constants/sectors'
import { useSectorStore } from '../store/sectorStore'
import { SourceFilter } from './SourceFilter'

interface FilterPanelProps {
  availableSources: string[]
}

export function FilterPanel({ availableSources }: FilterPanelProps) {
  const { selectedIds, toggleSector, clearAll: clearSectors, selectAll: selectAllSectors } = useSectorStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasSectorSelection = selectedIds.length > 0

  const panelContent = (
    <div className="flex flex-col gap-6">
      {/* Sectors Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sectors</span>
          <button
            onClick={() => hasSectorSelection ? clearSectors() : selectAllSectors()}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {hasSectorSelection ? 'Clear' : 'All'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((sector) => {
            const isActive = selectedIds.includes(sector.id)
            return (
              <button
                key={sector.id}
                onClick={() => toggleSector(sector.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-brand/20 text-brand ring-2 ring-brand/50'
                    : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-gray-200'
                  }
                `}
              >
                {sector.icon} {sector.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sources Section */}
      <SourceFilter sources={availableSources} />
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-full bg-brand text-white text-sm font-medium shadow-lg"
        aria-label="Toggle filters"
      >
        Filters
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-surface p-4 overflow-y-auto border-l border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-100">Filters</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                Close
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop panel */}
      <div className="hidden lg:block w-56 shrink-0 p-4" data-testid="filter-panel">
        {panelContent}
      </div>
    </>
  )
}
