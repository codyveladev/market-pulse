import { useState } from 'react'
import { useResearch } from '../hooks/useResearch'
import { ResearchSearch } from './ResearchSearch'
import { StockHeader } from './StockHeader'
import { KeyStatsGrid } from './KeyStatsGrid'
import { PriceChart } from './PriceChart'
import { CompanyInfo } from './CompanyInfo'
import { ResearchNewsFeed } from './ResearchNewsFeed'
import { timeAgo } from '../utils/timeAgo'

export function ResearchPage() {
  const [symbol, setSymbol] = useState('')
  const { data, loading, error, fetchedAt } = useResearch(symbol)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Research</h2>
        {fetchedAt && (
          <span className="text-xs text-gray-500">Updated {timeAgo(fetchedAt)}</span>
        )}
      </div>

      <ResearchSearch onSearch={setSymbol} />

      {!symbol && !loading && (
        <div className="text-gray-500 text-center py-16">
          Search for a stock symbol to get started.
        </div>
      )}

      {loading && <ResearchSkeleton />}

      {error && (
        <div className="text-negative text-center py-8">
          Failed to load research data: {error}
        </div>
      )}

      {data && !loading && (
        <>
          {data.overview && <StockHeader overview={data.overview} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {data.overview && (
                <KeyStatsGrid overview={data.overview} financials={data.financials} />
              )}
            </div>
            <div className="flex flex-col gap-4">
              <CompanyInfo profile={data.profile} />
            </div>
          </div>

          {data.overview && data.overview.chartData.length > 1 && (
            <PriceChart chartData={data.overview.chartData} />
          )}
          <ResearchNewsFeed news={data.news} />
        </>
      )}
    </div>
  )
}

function ResearchSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4" data-testid="research-skeleton">
      <div className="h-20 bg-surface-raised rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-32 bg-surface-raised rounded-lg" />
        <div className="h-32 bg-surface-raised rounded-lg" />
      </div>
      <div className="h-48 bg-surface-raised rounded-lg" />
      <div className="h-64 bg-surface-raised rounded-lg" />
    </div>
  )
}
