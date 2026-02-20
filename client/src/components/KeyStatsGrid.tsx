import type { StockOverview, CompanyFinancials } from '../../../shared/types'
import { formatLargeNumber, formatVolume } from '../utils/formatNumber'

interface KeyStatsGridProps {
  overview: StockOverview
  financials: CompanyFinancials | null
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised rounded-lg p-3 border border-white/5">
      <span className="text-xs text-gray-500 block">{label}</span>
      <span className="text-sm font-medium text-gray-100">{value}</span>
    </div>
  )
}

export function KeyStatsGrid({ overview, financials }: KeyStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <StatItem label="Market Cap" value={overview.marketCap != null ? formatLargeNumber(overview.marketCap) : 'N/A'} />
      <StatItem label="Volume" value={overview.volume != null ? formatVolume(overview.volume) : 'N/A'} />
      <StatItem label="Day High" value={overview.dayHigh != null ? `$${overview.dayHigh.toFixed(2)}` : 'N/A'} />
      <StatItem label="Day Low" value={overview.dayLow != null ? `$${overview.dayLow.toFixed(2)}` : 'N/A'} />
      <StatItem label="52wk High" value={overview.fiftyTwoWeekHigh != null ? `$${overview.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'} />
      <StatItem label="52wk Low" value={overview.fiftyTwoWeekLow != null ? `$${overview.fiftyTwoWeekLow.toFixed(2)}` : 'N/A'} />
      <StatItem label="P/E Ratio" value={financials?.peRatio != null ? financials.peRatio.toFixed(2) : 'N/A'} />
      <StatItem label="EPS" value={financials?.eps != null ? `$${financials.eps.toFixed(2)}` : 'N/A'} />
      <StatItem label="Beta" value={financials?.beta != null ? financials.beta.toFixed(2) : 'N/A'} />
      <StatItem label="Div Yield" value={financials?.dividendYield != null ? `${financials.dividendYield.toFixed(2)}%` : 'N/A'} />
    </div>
  )
}
