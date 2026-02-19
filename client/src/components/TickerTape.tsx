import { useMarketData } from '../hooks/useMarketData'
import type { QuoteData } from '@shared/types'

function QuoteItem({ q }: { q: QuoteData }) {
  const isPositive = q.changePercent >= 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-gray-200">{q.symbol}</span>
      <span className="text-gray-400">${q.price.toFixed(2)}</span>
      <span className={isPositive ? 'text-positive' : 'text-negative'}>
        {isPositive ? '+' : ''}{q.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

export function TickerTape() {
  const { quotes, loading } = useMarketData()

  if (loading) {
    return (
      <div className="bg-surface h-10 flex items-center justify-center text-gray-500 text-sm border-b border-white/5">
        Loading market data...
      </div>
    )
  }

  return (
    <div className="bg-surface h-10 flex items-center overflow-hidden border-b border-white/5">
      {/* Duplicate the list so the scroll animation loops seamlessly */}
      <div className="flex animate-scroll gap-8 px-4 whitespace-nowrap">
        {quotes.map((q) => (
          <QuoteItem key={q.symbol} q={q} />
        ))}
        {quotes.map((q) => (
          <QuoteItem key={`${q.symbol}-dup`} q={q} />
        ))}
      </div>
    </div>
  )
}
