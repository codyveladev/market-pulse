import ReactMarkdown from 'react-markdown'
import { useAIAnalysis } from '../hooks/useAIAnalysis'

interface AIAnalystCardProps {
  symbol: string
  dataReady: boolean
}

export function AIAnalystCard({ symbol, dataReady }: AIAnalystCardProps) {
  const { text, loading, error, isStreaming, cached, start, regenerate } = useAIAnalysis(symbol)

  if (!symbol) return null

  const hasStarted = loading || isStreaming || text || error

  return (
    <div
      className="bg-surface-raised rounded-lg p-4 border border-white/5"
      data-testid="ai-analyst-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-100">AI Analysis</span>
          {cached && (
            <span
              className="text-xs text-gray-500 bg-surface px-2 py-0.5 rounded-full border border-white/10"
              data-testid="cached-badge"
            >
              cached
            </span>
          )}
        </div>
        {hasStarted && (
          <button
            onClick={regenerate}
            disabled={loading || isStreaming}
            className="text-xs text-gray-400 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Regenerate analysis"
            data-testid="regenerate-btn"
          >
            ↻ Regenerate
          </button>
        )}
      </div>

      {/* Generate button — initial state */}
      {!hasStarted && dataReady && (
        <button
          onClick={start}
          className="w-full py-2.5 rounded-lg border border-brand/30 bg-brand/10 text-brand text-sm font-medium hover:bg-brand/20 transition-colors"
          data-testid="generate-btn"
        >
          Generate AI Analysis
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm" data-testid="ai-loading">
          <span className="animate-pulse">Analyzing {symbol}...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-negative text-sm" data-testid="ai-error">
          {error}
        </div>
      )}

      {/* Streamed text */}
      {text && (
        <div className="text-sm text-gray-300 leading-relaxed" data-testid="ai-text">
          <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-gray-100">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          {isStreaming && (
            <span
              className="inline-block w-1.5 h-4 bg-brand animate-pulse ml-0.5 align-text-bottom"
              data-testid="streaming-cursor"
            />
          )}
        </div>
      )}

      {/* Disclaimer */}
      {text && !isStreaming && (
        <p className="text-xs text-gray-600 mt-3 border-t border-white/5 pt-2" data-testid="disclaimer">
          AI-generated analysis — not financial advice.
        </p>
      )}
    </div>
  )
}
