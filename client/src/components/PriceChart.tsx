import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

interface PriceChartProps {
  chartData: number[]
  chartDates: string[]
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  changePercent: number
}

type Range = '1M' | '3M'
const TRADING_DAYS_1M = 21

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}

interface TooltipPayload {
  value: number
  payload: { date: string; price: number; open: number }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const { date, price, open } = payload[0].payload
  const delta = open !== 0 ? ((price - open) / open) * 100 : 0
  const sign = delta >= 0 ? '+' : ''
  const color = delta >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1">{formatDate(date)}</p>
      <p className="text-gray-100 font-semibold">{formatPrice(price)}</p>
      <p style={{ color }}>{sign}{delta.toFixed(2)}% from open</p>
    </div>
  )
}

export function PriceChart({
  chartData,
  chartDates,
  fiftyTwoWeekHigh,
  fiftyTwoWeekLow,
  changePercent,
}: PriceChartProps) {
  const [range, setRange] = useState<Range>('3M')

  if (chartData.length < 2 || chartDates.length < 2) return null

  const sliceStart = range === '1M'
    ? Math.max(0, chartData.length - TRADING_DAYS_1M)
    : 0

  const slicedPrices = chartData.slice(sliceStart)
  const slicedDates = chartDates.slice(sliceStart)
  const openPrice = slicedPrices[0]

  const chartPoints = slicedPrices.map((price, i) => ({
    date: slicedDates[i],
    price,
    open: openPrice,
  }))

  const isPositive = changePercent >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const gradientId = isPositive ? 'gradientGreen' : 'gradientRed'

  const prices = slicedPrices
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.08 || 1
  const yDomain = [minPrice - padding, maxPrice + padding]

  // Show ~5 date ticks spaced evenly
  const tickCount = Math.min(5, chartPoints.length)
  const tickInterval = Math.floor((chartPoints.length - 1) / (tickCount - 1)) || 1
  const xTicks = chartPoints
    .filter((_, i) => i % tickInterval === 0 || i === chartPoints.length - 1)
    .map((p) => p.date)

  const rangeBtn = (r: Range) =>
    `px-2 py-0.5 text-xs rounded transition-colors ${
      range === r
        ? 'bg-surface-overlay text-gray-100'
        : 'text-gray-500 hover:text-gray-300'
    }`

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5" data-positive={isPositive}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400">Price Chart</span>
        <div className="flex gap-1">
          <button className={rangeBtn('1M')} onClick={() => setRange('1M')}>1M</button>
          <button className={rangeBtn('3M')} onClick={() => setRange('3M')}>3M</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

          <XAxis
            dataKey="date"
            ticks={xTicks}
            tickFormatter={formatDate}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={yDomain}
            tickFormatter={formatPrice}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />

          <Tooltip content={<CustomTooltip />} />

          {fiftyTwoWeekHigh != null && (
            <ReferenceLine
              y={fiftyTwoWeekHigh}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="4 4"
              label={{ value: '52W H', position: 'insideTopRight', fill: '#9ca3af', fontSize: 10 }}
            />
          )}

          {fiftyTwoWeekLow != null && (
            <ReferenceLine
              y={fiftyTwoWeekLow}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="4 4"
              label={{ value: '52W L', position: 'insideBottomRight', fill: '#9ca3af', fontSize: 10 }}
            />
          )}

          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
