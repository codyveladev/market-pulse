import type { FundamentalData } from '../../../shared/types'

interface FundamentalsPanelProps {
  fundamentals: FundamentalData
  currentPrice: number
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised rounded-lg p-3 border border-white/5">
      <span className="text-xs text-gray-500 block">{label}</span>
      <span className="text-sm font-medium text-gray-100">{value}</span>
    </div>
  )
}

function pct(v: number | null): string {
  if (v == null) return 'N/A'
  return `${(v * 100).toFixed(1)}%`
}

function num(v: number | null, decimals = 2): string {
  if (v == null) return 'N/A'
  return v.toFixed(decimals)
}

function AnalystBar({ fundamentals, currentPrice }: FundamentalsPanelProps) {
  const { analystStrongBuy, analystBuy, analystHold, analystSell, analystStrongSell, analystTargetPrice } = fundamentals
  const counts = [analystStrongBuy, analystBuy, analystHold, analystSell, analystStrongSell]

  if (counts.every((c) => c == null)) return null

  const total = counts.reduce((sum, c) => sum + (c ?? 0), 0)
  if (total === 0) return null

  const buyTotal = (analystStrongBuy ?? 0) + (analystBuy ?? 0)
  const holdTotal = analystHold ?? 0
  const sellTotal = (analystSell ?? 0) + (analystStrongSell ?? 0)

  const buyPct = (buyTotal / total) * 100
  const holdPct = (holdTotal / total) * 100
  const sellPct = (sellTotal / total) * 100

  const targetDelta = analystTargetPrice != null
    ? ((analystTargetPrice - currentPrice) / currentPrice) * 100
    : null

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5" data-testid="analyst-bar">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Analyst Consensus</span>
        {analystTargetPrice != null && (
          <span className="text-sm text-gray-100">
            Target <span className="font-semibold">${num(analystTargetPrice)}</span>
            {targetDelta != null && (
              <span className={`ml-1 text-xs ${targetDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                ({targetDelta >= 0 ? '+' : ''}{targetDelta.toFixed(1)}%)
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex h-3 rounded-full overflow-hidden mb-2" data-testid="consensus-bar">
        {buyPct > 0 && (
          <div className="bg-positive" style={{ width: `${buyPct}%` }} data-testid="bar-buy" />
        )}
        {holdPct > 0 && (
          <div className="bg-yellow-500" style={{ width: `${holdPct}%` }} data-testid="bar-hold" />
        )}
        {sellPct > 0 && (
          <div className="bg-negative" style={{ width: `${sellPct}%` }} data-testid="bar-sell" />
        )}
      </div>

      <div className="flex gap-4 text-xs text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full bg-positive mr-1" />Buy {buyTotal}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />Hold {holdTotal}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-negative mr-1" />Sell {sellTotal}</span>
      </div>
    </div>
  )
}

export function FundamentalsPanel({ fundamentals, currentPrice }: FundamentalsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">Fundamentals</h2>

      {/* Valuation */}
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-2">Valuation</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatItem label="PEG Ratio" value={num(fundamentals.pegRatio)} />
          <StatItem label="Forward P/E" value={num(fundamentals.forwardPE)} />
          <StatItem label="Price / Book" value={num(fundamentals.priceToBook)} />
          <StatItem label="Price / Sales" value={num(fundamentals.priceToSales)} />
          <StatItem label="EV / Revenue" value={num(fundamentals.evToRevenue)} />
          <StatItem label="EV / EBITDA" value={num(fundamentals.evToEbitda)} />
        </div>
      </div>

      {/* Profitability */}
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-2">Profitability</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatItem label="Profit Margin" value={pct(fundamentals.profitMargin)} />
          <StatItem label="Operating Margin" value={pct(fundamentals.operatingMargin)} />
          <StatItem label="ROE" value={pct(fundamentals.returnOnEquity)} />
          <StatItem label="ROA" value={pct(fundamentals.returnOnAssets)} />
        </div>
      </div>

      {/* Growth */}
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-2">Growth (YoY)</span>
        <div className="grid grid-cols-2 gap-2">
          <StatItem label="Revenue Growth" value={pct(fundamentals.quarterlyRevenueGrowth)} />
          <StatItem label="Earnings Growth" value={pct(fundamentals.quarterlyEarningsGrowth)} />
        </div>
      </div>

      {/* Analyst Consensus */}
      <AnalystBar fundamentals={fundamentals} currentPrice={currentPrice} />
    </div>
  )
}
