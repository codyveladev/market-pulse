import { create } from 'zustand'

export type TabId = 'news' | 'markets' | 'research' | 'status'

interface NavigationState {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeTab: 'news',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
