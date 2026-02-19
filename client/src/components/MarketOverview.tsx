import { useState, useMemo } from 'react'
import { MarketCategoryFilter } from './MarketCategoryFilter'
import { MarketCard } from './MarketCard'
import { getSymbolsForCategories } from '../constants/marketCategories'
import { useMarketQuotes } from '../hooks/useMarketQuotes'
import { timeAgo } from '../utils/timeAgo'

const DEFAULT_CATEGORIES = ['indices', 'mag7']

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="h-4 w-12 bg-surface-overlay rounded" />
          <div className="h-3 w-24 bg-surface-overlay rounded mt-1" />
        </div>
        <div className="h-5 w-16 bg-surface-overlay rounded" />
      </div>
      <div className="h-4 w-20 bg-surface-overlay rounded mt-2" />
      <div className="h-1 w-full bg-surface-overlay rounded mt-3" />
    </div>
  )
}

export function MarketOverview() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(DEFAULT_CATEGORIES)

  const symbols = useMemo(
    () => getSymbolsForCategories(selectedCategories),
    [selectedCategories]
  )

  const { quotes, loading, error, fetchedAt } = useMarketQuotes(symbols)

  const handleToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Markets</h2>
        {fetchedAt && (
          <span className="text-xs text-gray-500">Updated {timeAgo(fetchedAt)}</span>
        )}
      </div>

      <MarketCategoryFilter
        selectedIds={selectedCategories}
        onToggle={handleToggle}
      />

      {loading && quotes.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {error && (
        <div className="text-negative text-center py-8">
          Failed to load market data: {error}
        </div>
      )}

      {quotes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote) => (
            <MarketCard key={quote.symbol} quote={quote} />
          ))}
        </div>
      )}

      {!loading && !error && quotes.length === 0 && selectedCategories.length > 0 && (
        <div className="text-gray-500 text-center py-8">
          No market data available.
        </div>
      )}

      {selectedCategories.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          Select a category above to see market data.
        </div>
      )}
    </div>
  )
}
