import { TickerTape } from './components/TickerTape'
import { SectorSelector } from './components/SectorSelector'
import { NewsFeed } from './components/NewsFeed'
import { Sidebar } from './components/Sidebar'
import { MarketOverview } from './components/MarketOverview'
import { useSectorStore } from './store/sectorStore'
import { useNavigationStore } from './store/navigationStore'

function App() {
  const { selectedIds } = useSectorStore()
  const { activeTab } = useNavigationStore()
  const isKiosk = new URLSearchParams(window.location.search).get('kiosk') === 'true'

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <TickerTape />

      {!isKiosk && (
        <header className="border-b border-surface-overlay px-6 py-4">
          <h1 className="text-headline font-bold tracking-tight">
            Market Pulse
          </h1>
        </header>
      )}

      <div className="flex flex-1">
        {!isKiosk && <Sidebar />}

        <div className="flex-1">
          {activeTab === 'news' && (
            <>
              {!isKiosk && <SectorSelector />}
              <main className="max-w-4xl mx-auto">
                <NewsFeed sectors={selectedIds} />
              </main>
            </>
          )}

          {activeTab === 'markets' && (
            <main className="max-w-5xl mx-auto">
              <MarketOverview />
            </main>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
