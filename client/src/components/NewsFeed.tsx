import { useNews } from '../hooks/useNews'
import { NewsCard } from './NewsCard'

interface NewsFeedProps {
  sectors: string[]
}

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-3 w-20 bg-surface-overlay rounded" />
        <div className="h-3 w-3 bg-surface-overlay rounded-full" />
        <div className="h-3 w-16 bg-surface-overlay rounded" />
      </div>
      <div className="h-5 w-3/4 bg-surface-overlay rounded mb-2" />
      <div className="h-4 w-full bg-surface-overlay rounded mb-1" />
      <div className="h-4 w-2/3 bg-surface-overlay rounded mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 w-24 bg-surface-overlay rounded-full" />
      </div>
    </div>
  )
}

export function NewsFeed({ sectors }: NewsFeedProps) {
  const { articles, loading, error, refresh, secondsUntilRefresh } = useNews(sectors)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">News Feed</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Refresh in {secondsUntilRefresh}s
          </span>
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-sm rounded-lg bg-surface-raised text-gray-300 hover:bg-surface-overlay transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && articles.length === 0 && (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && (
        <div className="text-negative text-center py-8">Failed to load news: {error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-gray-500 text-center py-8">No articles found. Select sectors above to see news.</div>
      )}

      {articles.length > 0 && articles.map((article) => (
        <NewsCard key={article.url} article={article} />
      ))}
    </div>
  )
}
