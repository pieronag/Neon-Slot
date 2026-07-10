import { create } from 'zustand'

interface UIState {
  showPaytable: boolean
  showShop: boolean
  showAchievements: boolean
  showMissions: boolean
  showStats: boolean
  showGlossary: boolean
  showProfile: boolean
  showTutorial: boolean
  showWinPopup: boolean
  winPopupAmount: number
  showWheel: boolean
  showDouble: boolean
  mobilePanelOpen: boolean
  doubleAmount: number
  doubleWon: boolean | null
  showAvalanche: number
  showLevelUp: boolean
  showDailyLogin: boolean
  notifications: { id: string; message: string; type: 'win' | 'info' | 'bonus' }[]

  togglePaytable: () => void
  toggleShop: () => void
  toggleAchievements: () => void
  toggleMissions: () => void
  toggleStats: () => void
  toggleGlossary: () => void
  setShowProfile: (v: boolean) => void
  setMobilePanel: (v: boolean) => void
  showWin: (amount: number) => void
  hideWin: () => void
  hideWheel: () => void
  showDoubleGame: (amount: number) => void
  hideDouble: () => void
  addNotification: (message: string, type: 'win' | 'info' | 'bonus') => void
  removeNotification: (id: string) => void
  closeTutorial: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  showPaytable: false,
  showShop: false,
  showAchievements: false,
  showMissions: false,
  showStats: false,
  showGlossary: false,
  showProfile: false,
  showTutorial: false,
  showWinPopup: false,
  winPopupAmount: 0,
  showWheel: false,
  showDouble: false,
  mobilePanelOpen: false,
  doubleAmount: 0,
  doubleWon: null,
  showAvalanche: 0,
  showLevelUp: false,
  showDailyLogin: false,
  notifications: [],

  togglePaytable: () => set(s => ({ showPaytable: !s.showPaytable })),
  toggleShop: () => set(s => ({ showShop: !s.showShop })),
  toggleAchievements: () => set(s => ({ showAchievements: !s.showAchievements })),
  toggleMissions: () => set(s => ({ showMissions: !s.showMissions })),
  toggleStats: () => set(s => ({ showStats: !s.showStats })),
  toggleGlossary: () => set(s => ({ showGlossary: !s.showGlossary })),
  setShowProfile: (v) => set({ showProfile: v }),
  setMobilePanel: (v) => set({ mobilePanelOpen: v }),
  showWin: (amount) => set({ showWinPopup: true, winPopupAmount: amount }),
  hideWin: () => set({ showWinPopup: false, winPopupAmount: 0 }),
  hideWheel: () => set({ showWheel: false }),
  showDoubleGame: (amount) => set({ showDouble: true, doubleAmount: amount, doubleWon: null }),
  hideDouble: () => set({ showDouble: false, doubleAmount: 0, doubleWon: null }),

  addNotification: (message, type) => {
    const id = Date.now().toString()
    set(s => ({ notifications: [...s.notifications, { id, message, type }] }))
    setTimeout(() => get().removeNotification(id), 3500)
  },
  removeNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),

  closeTutorial: () => {
    try { localStorage.setItem('ns_tut', '1') } catch {}
    set({ showTutorial: false })
  },
}))
