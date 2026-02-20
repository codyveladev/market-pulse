import { useNavigationStore, type TabId } from '../store/navigationStore'

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'markets', label: 'Markets', icon: '📈' },
  { id: 'research', label: 'Research', icon: '🔍' },
]

const BOTTOM_NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'status', label: 'Status', icon: '⚡' },
]

function NavButton({ item, isActive, onClick }: { item: { id: TabId; label: string; icon: string }; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
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
}

export function Sidebar() {
  const { activeTab, setActiveTab } = useNavigationStore()

  return (
    <aside className="w-16 bg-surface-raised border-r border-white/5 flex flex-col items-center py-4 gap-2">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
        />
      ))}

      <div className="mt-auto flex flex-col items-center gap-2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>
    </aside>
  )
}
