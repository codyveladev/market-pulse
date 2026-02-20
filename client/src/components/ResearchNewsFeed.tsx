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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Ticker News</h2>
        {news.length > 0 && (
          <span className="text-xs text-gray-500">
            {start + 1}–{Math.min(start + PAGE_SIZE, news.length)} of {news.length}
          </span>
        )}
      </div>

      {news.length === 0 ? (
        <p className="text-gray-500 text-sm">No news available.</p>
      ) : (
        <>
          {pageArticles.map((article, i) => (
            <div
              key={start + i}
              className="bg-surface-raised rounded-lg p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="px-2 py-0.5 rounded-full bg-surface border border-white/10 text-gray-300">
                  {article.source}
                </span>
                <span className="text-gray-500">
                  {timeAgo(new Date(article.datetime * 1000).toISOString())}
                </span>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-100 hover:text-brand transition-colors leading-snug block mb-2"
              >
                {article.headline}
              </a>

              {article.summary && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {article.summary}
                </p>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface-raised text-gray-300 hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface-raised text-gray-300 hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
