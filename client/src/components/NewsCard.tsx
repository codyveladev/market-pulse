import type { NewsArticle } from '@shared/types'
import { getSectorById } from '../constants/sectors'
import { timeAgo } from '../utils/timeAgo'

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <div className="flex items-center gap-2 text-xs mb-2">
        <span
          data-testid="source-tag"
          className="px-2 py-0.5 rounded-full bg-surface border border-white/10 text-gray-300"
        >
          {article.source}
        </span>
        <span className="text-gray-500">{timeAgo(article.publishedAt)}</span>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-semibold text-gray-100 hover:text-brand transition-colors leading-snug block mb-2"
      >
        {article.title}
      </a>

      {article.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {article.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {article.sectorIds.map((id) => {
          const sector = getSectorById(id)
          if (!sector) return null
          return (
            <span
              key={id}
              className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand"
            >
              {sector.icon} {sector.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
