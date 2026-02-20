import { useSourceStore } from '../store/sourceStore'

interface SourceFilterProps {
  sources: string[]
}

export function SourceFilter({ sources }: SourceFilterProps) {
  const { selectedSources, toggleSource, clearAll } = useSourceStore()
  const hasSelection = selectedSources.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sources</span>
        {hasSelection && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source) => {
          const isActive = selectedSources.includes(source)
          return (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${isActive
                  ? 'bg-brand/20 text-brand ring-2 ring-brand/50'
                  : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-gray-200'
                }
              `}
            >
              {source}
            </button>
          )
        })}
      </div>
      {sources.length === 0 && (
        <p className="text-xs text-gray-500">No sources available.</p>
      )}
    </div>
  )
}
