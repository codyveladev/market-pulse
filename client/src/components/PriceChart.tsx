interface PriceChartProps {
  chartData: number[]
}

export function PriceChart({ chartData }: PriceChartProps) {
  if (chartData.length < 2) return null

  const width = 600
  const height = 200
  const min = Math.min(...chartData)
  const max = Math.max(...chartData)
  const range = max - min || 1

  const points = chartData
    .map((price, i) => {
      const x = (i / (chartData.length - 1)) * width
      const y = height - ((price - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  const isPositive = chartData[chartData.length - 1] >= chartData[0]
  const strokeColor = isPositive ? '#22c55e' : '#ef4444'

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">Price Chart</span>
        <span className="text-xs text-gray-500">3M</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" role="img">
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
