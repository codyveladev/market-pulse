import type { QuoteData } from '@shared/types'

interface MarketCardProps {
  quote: QuoteData
}

export function MarketCard({ quote }: MarketCardProps) {
  const isPositive = quote.change >= 0
  const colorClass = isPositive ? 'text-positive' : 'text-negative'
  const sign = isPositive ? '+' : '-'
  const absChange = Math.abs(quote.change)
  const absPercent = Math.abs(quote.changePercent)

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-gray-100">{quote.symbol}</span>
          {quote.name && (
            <p className="text-xs text-gray-500 truncate max-w-[160px]">{quote.name}</p>
          )}
        </div>
        <span className="text-base font-semibold text-gray-100">
          ${quote.price.toFixed(2)}
        </span>
      </div>

      <div className={`flex items-center gap-2 text-sm ${colorClass}`}>
        <span>{sign}${absChange.toFixed(2)}</span>
        <span>{sign}{absPercent.toFixed(2)}%</span>
      </div>

      {quote.dayHigh != null && quote.dayLow != null && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>L {quote.dayLow.toFixed(2)}</span>
          <div className="flex-1 h-1 bg-surface-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-brand/50 rounded-full"
              style={{
                width: `${quote.dayHigh !== quote.dayLow
                  ? ((quote.price - quote.dayLow) / (quote.dayHigh - quote.dayLow)) * 100
                  : 50
                }%`,
              }}
            />
          </div>
          <span>H {quote.dayHigh.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
