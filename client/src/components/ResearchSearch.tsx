import { useState } from 'react'

interface ResearchSearchProps {
  onSearch: (symbol: string) => void
}

export function ResearchSearch({ onSearch }: ResearchSearchProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const symbol = input.trim().toUpperCase()
    if (symbol) onSearch(symbol)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter stock symbol (e.g. AAPL)"
        className="flex-1 px-4 py-2 rounded-lg bg-surface-raised border border-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand/80 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
