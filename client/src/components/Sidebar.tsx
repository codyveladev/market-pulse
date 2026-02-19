import { useNavigationStore, type TabId } from '../store/navigationStore'

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'markets', label: 'Markets', icon: '📈' },
]

export function Sidebar() {
  const { activeTab, setActiveTab } = useNavigationStore()

  return (
    <aside className="w-16 bg-surface-raised border-r border-white/5 flex flex-col items-center py-4 gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex flex-col items-center gap-1 w-12 py-2 rounded-lg text-xs font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-brand/20 text-brand'
                : 'text-gray-500 hover:text-gray-300 hover:bg-surface-overlay'
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </aside>
  )
}
