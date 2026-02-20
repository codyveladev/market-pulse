import { TickerTape } from './components/TickerTape'
import { NewsFeed } from './components/NewsFeed'
import { FilterPanel } from './components/FilterPanel'
import { Sidebar } from './components/Sidebar'
import { MarketOverview } from './components/MarketOverview'
import { SystemStatus } from './components/SystemStatus'
import { ResearchPage } from './components/ResearchPage'
import { useSectorStore } from './store/sectorStore'
import { useNavigationStore } from './store/navigationStore'
import { useNews } from './hooks/useNews'

function App() {
  const { selectedIds } = useSectorStore()
  const { activeTab } = useNavigationStore()
  const isKiosk = new URLSearchParams(window.location.search).get('kiosk') === 'true'
  const newsData = useNews(selectedIds)

  return (
    <div className="h-screen bg-surface text-white flex flex-col overflow-hidden">
      <TickerTape />

      {!isKiosk && (
        <header className="border-b border-surface-overlay px-6 py-4">
          <h1 className="text-headline font-bold tracking-tight">
            Market Pulse
          </h1>
        </header>
      )}

      <div className="flex flex-1 min-h-0">
        {!isKiosk && <Sidebar />}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'news' && (
            <div className="flex max-w-5xl mx-auto">
              <main className="flex-1 min-w-0">
                <NewsFeed
                  articles={newsData.articles}
                  loading={newsData.loading}
                  error={newsData.error}
                  refresh={newsData.refresh}
                  secondsUntilRefresh={newsData.secondsUntilRefresh}
                  fetchedAt={newsData.fetchedAt}
                />
              </main>
              {!isKiosk && <FilterPanel availableSources={newsData.availableSources} />}
            </div>
          )}

          {activeTab === 'markets' && (
            <main className="max-w-5xl mx-auto">
              <MarketOverview />
            </main>
          )}

          {activeTab === 'research' && (
            <main className="max-w-5xl mx-auto">
              <ResearchPage />
            </main>
          )}

          {activeTab === 'status' && (
            <main className="max-w-5xl mx-auto">
              <SystemStatus />
            </main>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
