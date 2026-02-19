import { SECTORS } from '../constants/sectors'
import { useSectorStore } from '../store/sectorStore'

export function SectorSelector() {
  const { selectedIds, toggleSector } = useSectorStore()

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {SECTORS.map((sector) => {
        const isActive = selectedIds.includes(sector.id)
        return (
          <button
            key={sector.id}
            onClick={() => toggleSector(sector.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-150
              ${isActive
                ? 'bg-brand/20 text-brand ring-2 ring-brand/50'
                : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-gray-200'
              }
            `}
          >
            <span>{sector.icon}</span>
            <span>{sector.label}</span>
          </button>
        )
      })}
    </div>
  )
}
