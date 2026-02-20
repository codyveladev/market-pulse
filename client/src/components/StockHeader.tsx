import type { StockOverview } from '../../../shared/types'

interface StockHeaderProps {
  overview: StockOverview
}

export function StockHeader({ overview }: StockHeaderProps) {
  const isPositive = overview.change >= 0
  const sign = isPositive ? '+' : ''

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-medium px-2 py-0.5 rounded bg-brand/10 text-brand">
          {overview.symbol}
        </span>
        <h3 className="text-xl font-semibold text-gray-100">{overview.name}</h3>
      </div>
      <div className="flex items-baseline gap-3 mt-2">
        <span className="text-3xl font-bold text-gray-100">
          ${overview.price.toFixed(2)}
        </span>
        <span className={`text-lg font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
          {sign}{overview.change.toFixed(2)} ({sign}{overview.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}
