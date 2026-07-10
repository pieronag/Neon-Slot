import { create } from 'zustand'

interface Achievement {
  id: string; name: string; description: string; icon: string;
  condition: (s: ProgressionState) => boolean; reward: number; xp: number;
}

interface DailyMission {
  id: string; name: string; description: string; target: number;
  progress: number; reward: number; completed: boolean;
}

interface ProgressionState {
  xp: number;
  level: number;
  dailyLoginDay: number;
  dailyLoginClaimed: boolean;
  lastLoginDate: string;
  achievements: string[];
  dailyMissions: DailyMission[];
  sessionSpins: number;
  sessionWins: number;

  awardXP: (amount: number) => void;
  claimDailyLogin: () => void;
  checkDailyLogin: () => boolean;
  addAchievement: (id: string) => void;
  checkAchievements: () => void;
  updateMission: (id: string, inc?: number) => void;
  resetDaily: () => void;
}

const DAILY_REWARDS = [200, 400, 600, 800, 1000, 1500, 3000]
const STREAK_BONUS = [0, 0, 50, 100, 200, 300, 500, 1000]
const LEVEL_XP = (l: number) => l * l * 100

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_spin', name: 'Primer giro', description: 'Gira una vez', icon: '🎰', condition: s => s.sessionSpins >= 1, reward: 200, xp: 50 },
  { id: 'spin_25', name: '25 giros', description: 'Gira 25 veces', icon: '🎰', condition: s => s.sessionSpins >= 25, reward: 500, xp: 100 },
  { id: 'spin_100', name: '100 giros', description: 'Gira 100 veces', icon: '💎', condition: s => s.sessionSpins >= 100, reward: 1500, xp: 300 },
  { id: 'spin_500', name: '500 giros', description: 'Gira 500 veces', icon: '🔥', condition: s => s.sessionSpins >= 500, reward: 5000, xp: 1000 },
  { id: 'spin_1000', name: '1000 giros', description: 'Gira 1000 veces', icon: '🔥', condition: s => s.sessionSpins >= 1000, reward: 10000, xp: 2000 },
  { id: 'win_10', name: '+10 ganado', description: 'Gana 10 monedas', icon: '💰', condition: s => s.sessionWins >= 10, reward: 300, xp: 50 },
  { id: 'win_100', name: '+100 ganado', description: 'Gana 100 monedas', icon: '💰', condition: s => s.sessionWins >= 100, reward: 1000, xp: 100 },
  { id: 'win_1000', name: '+1000 ganado', description: 'Gana 1000 monedas', icon: '💵', condition: s => s.sessionWins >= 1000, reward: 3000, xp: 300 },
  { id: 'win_5000', name: '+5000 ganado', description: 'Gana 5000 monedas', icon: '👑', condition: s => s.sessionWins >= 5000, reward: 10000, xp: 1000 },
  { id: 'win_10000', name: '+10000 ganado', description: 'Gana 10000 monedas', icon: '👑', condition: s => s.sessionWins >= 10000, reward: 20000, xp: 3000 },
  { id: 'jackpot_win', name: 'Jackpot', description: 'Gana el pozo global', icon: '🏆', condition: () => false, reward: 50000, xp: 5000 },
  { id: 'level_5', name: 'Nivel 5', description: 'Alcanza nivel 5', icon: '⭐', condition: s => s.level >= 5, reward: 1000, xp: 200 },
  { id: 'level_10', name: 'Nivel 10', description: 'Alcanza nivel 10', icon: '⭐', condition: s => s.level >= 10, reward: 3000, xp: 500 },
  { id: 'level_25', name: 'Nivel 25', description: 'Alcanza nivel 25', icon: '🏆', condition: s => s.level >= 25, reward: 15000, xp: 2000 },
  { id: 'login_3', name: '3 días', description: 'Inicia sesión 3 días seguidos', icon: '📅', condition: s => s.dailyLoginDay >= 3, reward: 500, xp: 200 },
  { id: 'login_7', name: '7 días', description: 'Inicia sesión 7 días seguidos', icon: '📅', condition: s => s.dailyLoginDay >= 7, reward: 3000, xp: 1000 },
  { id: 'mission_1', name: 'Cumplidor', description: 'Completa 1 meta', icon: '📋', condition: s => s.dailyMissions.filter(m => m.completed).length >= 1, reward: 200, xp: 100 },
  { id: 'mission_5', name: 'Entusiasta', description: 'Completa 5 metas', icon: '📋', condition: s => s.dailyMissions.filter(m => m.completed).length >= 5, reward: 1000, xp: 300 },
]

// Deduplicate by id
const ACHIEVEMENT_MAP = new Map<string, Achievement>()
ALL_ACHIEVEMENTS.forEach(a => ACHIEVEMENT_MAP.set(a.id, a))
const UNIQUE_ACHIEVEMENTS = Array.from(ACHIEVEMENT_MAP.values())

function generateDailyMissions(): DailyMission[] {
  const missions: DailyMission[] = [
    { id: `spin_${Date.now()}`, name: 'Seguir girando', description: 'Gira 20 veces', target: 20, progress: 0, reward: 200, completed: false },
    { id: `win_${Date.now()}`, name: 'Ganar mucho', description: 'Gana 200 monedas', target: 200, progress: 0, reward: 300, completed: false },
    { id: `bonus_${Date.now()}`, name: 'Cazabonos', description: 'Activa 1 bonificación', target: 1, progress: 0, reward: 500, completed: false },
  ]
  return missions
}

let _savedDaily: any = {}
try { _savedDaily = JSON.parse(localStorage.getItem('ns_daily') || '{}') } catch {}

function saveLocalState(data: any) {
  try {
    const cur = JSON.parse(localStorage.getItem('ns_daily') || '{}')
    localStorage.setItem('ns_daily', JSON.stringify({ ...cur, ...data }))
  } catch {}
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  dailyLoginDay: _savedDaily.dailyLoginDay || 1,
  dailyLoginClaimed: _savedDaily.dailyLoginClaimed || false,
  lastLoginDate: _savedDaily.lastLoginDate || '',
  xp: 0,
  level: 1,
  achievements: [],
  dailyMissions: generateDailyMissions(),
  sessionSpins: 0,
  sessionWins: 0,

  awardXP: (amount) => {
    const { xp, level } = get()
    const newXP = xp + amount
    const nextLevel = LEVEL_XP(level + 1)
    if (newXP >= nextLevel) {
      const reward = (level + 1) * 100
      useGameStore.setState({ balance: useGameStore.getState().balance + reward })
      set({ xp: newXP - nextLevel, level: level + 1 })
      useUIStore.setState({ showLevelUp: true })
      useUIStore.getState().addNotification(`¡Subiste al nivel ${level + 1}! +${reward} monedas`, 'win')
      setTimeout(() => useUIStore.setState({ showLevelUp: false }), 3000)
    } else {
      set({ xp: newXP })
    }
  },

  claimDailyLogin: async () => {
    if (get().dailyLoginClaimed) return
    const day = get().dailyLoginDay
    const baseReward = DAILY_REWARDS[Math.min(day - 1, DAILY_REWARDS.length - 1)]
    const streakBonus = STREAK_BONUS[Math.min(day, STREAK_BONUS.length - 1)]
    const total = baseReward + streakBonus
    useGameStore.setState({ balance: useGameStore.getState().balance + total })
    set({ dailyLoginClaimed: true })
    saveLocalState({ dailyLoginClaimed: true, dailyLoginDay: get().dailyLoginDay, lastLoginDate: get().lastLoginDate })
    const { useAuthStore } = await import('./authStore')
    useAuthStore.getState().addTransaction({
      type: 'login', amount: total,
      balanceBefore: useGameStore.getState().balance - total,
      balanceAfter: useGameStore.getState().balance,
      description: `Recompensa diaria día ${day} (${baseReward} + ${streakBonus} bono)`,
    })
  },

  checkDailyLogin: () => {
    const today = new Date().toDateString()
    const { lastLoginDate, dailyLoginClaimed } = get()
    if (lastLoginDate === today) return !dailyLoginClaimed
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    let newDay = 1
    let newClaimed = false
    if (lastLoginDate === yesterday) {
      newDay = Math.min(get().dailyLoginDay + 1, 7)
    }
    set({ dailyLoginDay: newDay, lastLoginDate: today, dailyLoginClaimed: newClaimed })
    saveLocalState({ dailyLoginDay: newDay, lastLoginDate: today, dailyLoginClaimed: newClaimed })
    return true
  },

  addAchievement: (id) => {
    if (!get().achievements.includes(id)) {
      set({ achievements: [...get().achievements, id] })
    }
  },

  checkAchievements: () => {
    const { achievements } = get()
    UNIQUE_ACHIEVEMENTS.forEach(a => {
      if (!achievements.includes(a.id) && a.condition(get())) {
        get().addAchievement(a.id)
        get().awardXP(a.xp)
        useGameStore.setState({ balance: useGameStore.getState().balance + a.reward })
      }
    })
  },

  updateMission: (id, inc = 1) => {
    const missions = get().dailyMissions.map(m => {
      if (m.id === id && !m.completed) {
        const newProgress = m.progress + inc
        const completed = newProgress >= m.target
        if (completed) {
          useGameStore.setState({ balance: useGameStore.getState().balance + m.reward })
        }
        return { ...m, progress: newProgress, completed }
      }
      return m
    })
    set({ dailyMissions: missions })
  },

  resetDaily: () => {
    set({ dailyMissions: generateDailyMissions(), sessionSpins: 0, sessionWins: 0 })
  },
}))

// Lazy import to avoid circular dependency
import { useUIStore } from './uiStore'
import { useGameStore } from './gameStore'
