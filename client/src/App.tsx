import { TickerTape } from './components/TickerTape'
import { SectorSelector } from './components/SectorSelector'
import { NewsFeed } from './components/NewsFeed'
import { useSectorStore } from './store/sectorStore'

function App() {
  const { selectedIds } = useSectorStore()
  const isKiosk = new URLSearchParams(window.location.search).get('kiosk') === 'true'

  return (
    <div className="min-h-screen bg-surface text-white">
      <TickerTape />

      {!isKiosk && (
        <header className="border-b border-surface-overlay px-6 py-4">
          <h1 className="text-headline font-bold tracking-tight">
            Market Pulse
          </h1>
        </header>
      )}

      {!isKiosk && <SectorSelector />}

      <main className="max-w-4xl mx-auto">
        <NewsFeed sectors={selectedIds} />
      </main>
    </div>
  )
}

export default App
