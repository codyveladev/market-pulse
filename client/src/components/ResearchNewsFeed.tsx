import { useState } from 'react'
import type { CompanyNewsArticle } from '../../../shared/types'
import { timeAgo } from '../utils/timeAgo'

interface ResearchNewsFeedProps {
  news: CompanyNewsArticle[]
}

const PAGE_SIZE = 10

export function ResearchNewsFeed({ news }: ResearchNewsFeedProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const pageArticles = news.slice(start, start + PAGE_SIZE)

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">Ticker News</span>
        {news.length > 0 && (
          <span className="text-xs text-gray-500">
            {start + 1}–{Math.min(start + PAGE_SIZE, news.length)} of {news.length}
          </span>
        )}
      </div>
      {news.length === 0 ? (
        <p className="text-gray-500 text-sm mt-2">No news available.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 mt-3">
            {pageArticles.map((article, i) => (
              <div key={start + i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span>{article.source}</span>
                  <span>{timeAgo(new Date(article.datetime * 1000).toISOString())}</span>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-100 hover:text-brand transition-colors line-clamp-2"
                >
                  {article.headline}
                </a>
                {article.image && (
                  <img src={article.image} alt="" className="w-full h-20 object-cover rounded mt-2" />
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface text-gray-300 hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface text-gray-300 hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
