import { MARKET_CATEGORIES } from '../constants/marketCategories'

interface MarketCategoryFilterProps {
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function MarketCategoryFilter({ selectedIds, onToggle }: MarketCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {MARKET_CATEGORIES.map((cat) => {
        const isActive = selectedIds.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-150
              ${isActive
                ? 'bg-brand/20 text-brand ring-2 ring-brand/50'
                : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-gray-200'
              }
            `}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
