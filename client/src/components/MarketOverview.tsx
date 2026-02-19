const INDICES = [
  { name: 'S&P 500', symbol: 'SPY' },
  { name: 'Nasdaq', symbol: 'QQQ' },
  { name: 'Dow Jones', symbol: 'DIA' },
  { name: 'Russell 2000', symbol: 'IWM' },
]

export function MarketOverview() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold text-gray-100">Markets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INDICES.map((index) => (
          <div
            key={index.symbol}
            className="bg-surface-raised rounded-lg p-6 border border-white/5 flex flex-col items-center justify-center min-h-[200px]"
          >
            <span className="text-base font-semibold text-gray-200">{index.name}</span>
            <span className="text-xs text-gray-500 mt-1">{index.symbol}</span>
            <div className="mt-4 h-24 w-full rounded bg-surface-overlay flex items-center justify-center">
              <span className="text-sm text-gray-500">Chart coming soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
