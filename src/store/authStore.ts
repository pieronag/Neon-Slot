import { create } from 'zustand'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export interface Transaction {
  id?: string
  type: 'bet' | 'win' | 'bonus' | 'wheel' | 'double' | 'login'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: string
}

export interface DailyMissionData {
  id: string; name: string; description: string; target: number
  progress: number; reward: number; completed: boolean
}

export interface UserProfile {
  displayName: string
  level: number
  xp: number
  balance: number
  totalSpins: number
  totalWins: number
  totalBets: number
  biggestWin: number
  minigameWins: number
  minigameLosses: number
  achievements: string[]
  dailyMissions?: DailyMissionData[]
  dailyLoginDay?: number
  lastLoginDate?: string
  lastConnection?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  transactions: Transaction[]
  loading: boolean
  globalJackpot: number
  error: string | null
  registering: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  loadProfile: () => Promise<void>
  unsubscribeProfile: (() => void) | null
  unsubscribeJackpot: (() => void) | null
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  addMinigameResult: (type: 'win' | 'loss', amount: number, balance: number) => Promise<void>
  loadTransactions: (limitCount?: number) => Promise<void>
  loadGlobalJackpot: () => Promise<void>
  addToJackpot: (amount: number) => Promise<void>
  resetJackpot: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  transactions: [],
  loading: true,
  globalJackpot: 50000,
  error: null,
  registering: false,
  unsubscribeProfile: null,
  unsubscribeJackpot: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      set({ error: 'Email o contraseña incorrectos', loading: false })
    }
  },

  register: async (email, password, displayName) => {
    set({ loading: true, error: null, registering: true })
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const profile: UserProfile = {
        displayName, level: 1, xp: 0, balance: 10000,
        totalSpins: 0, totalWins: 0, totalBets: 0, biggestWin: 0, minigameWins: 0, minigameLosses: 0,
        achievements: [], createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'usuarios', cred.user.uid), profile)
      set({ profile, loading: false, registering: false })
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use' ? 'Este email ya está registrado'
        : e.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres'
        : `Error: ${e.message || 'Error desconocido'}`
      console.error('Error en registro:', e)
      set({ error: msg, loading: false, registering: false })
    }
  },

  logout: async () => {
    const { unsubscribeProfile, unsubscribeJackpot } = get()
    if (unsubscribeProfile) unsubscribeProfile()
    if (unsubscribeJackpot) unsubscribeJackpot()
    await signOut(auth)
    set({ user: null, profile: null, transactions: [], unsubscribeProfile: null, unsubscribeJackpot: null })
  },

  loadProfile: async () => {
    const { user, unsubscribeProfile } = get()
    if (!user) { set({ loading: false }); return }
    if (unsubscribeProfile) unsubscribeProfile()
    try {
      const snap = await getDoc(doc(db, 'usuarios', user.uid))
      if (!snap.exists()) {
        const profile: UserProfile = {
          displayName: user.email?.split('@')[0] || 'Jugador',
          level: 1, xp: 0, balance: 10000,
        totalSpins: 0, totalWins: 0, totalBets: 0, biggestWin: 0, minigameWins: 0, minigameLosses: 0,
          achievements: [], createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'usuarios', user.uid), profile)
        set({ profile })
      }
      await setDoc(doc(db, 'usuarios', user.uid), { lastConnection: new Date().toISOString() }, { merge: true })
      const unsub = onSnapshot(doc(db, 'usuarios', user.uid), async (snap) => {
        if (!snap.exists()) return
        const data = snap.data() as UserProfile
        set({ profile: data })
        const { useProgressionStore } = await import('./progressionStore')
        useProgressionStore.setState({
          level: data.level,
          xp: data.xp,
          achievements: data.achievements || [],
          dailyMissions: useProgressionStore.getState().dailyMissions,
          dailyLoginDay: data.dailyLoginDay || useProgressionStore.getState().dailyLoginDay,
          lastLoginDate: data.lastLoginDate || useProgressionStore.getState().lastLoginDate,
        })
        const { useGameStore } = await import('./gameStore')
        useGameStore.setState({
          balance: data.balance,
          totalSpins: data.totalSpins,
          totalWins: data.totalWins,
          totalBets: data.totalBets || 0,
          biggestWin: data.biggestWin,
        })
      })
      set({ unsubscribeProfile: unsub })
    } catch (e) {
      console.error('Error cargando perfil:', e)
    }
    set({ loading: false })
  },

  updateProfile: async (data) => {
    const { user, profile } = get()
    if (!user) return
    const merged = { ...profile, ...data }
    set({ profile: merged as UserProfile })
    try {
      await setDoc(doc(db, 'usuarios', user.uid), merged, { merge: true })
    } catch (e) {
      console.error('Error guardando perfil:', e)
    }
  },

  addTransaction: async (data) => {
    const { user } = get()
    if (!user) return
    try {
      await addDoc(collection(db, 'usuarios', user.uid, 'transacciones'), { ...data, createdAt: new Date().toISOString() })
    } catch (e) { console.error('Error guardando transacción:', e) }
  },

  addMinigameResult: async (type: 'win' | 'loss', amount: number, newBalance: number) => {
    const { profile } = get()
    if (!profile) return
    const mw = profile.minigameWins ?? 0
    const ml = profile.minigameLosses ?? 0
    const update = type === 'win'
      ? { minigameWins: mw + amount, balance: newBalance }
      : { minigameLosses: ml + amount, balance: newBalance }
    set({ profile: { ...profile, ...update } as UserProfile })
    try {
      const { user } = get()
      if (user) await setDoc(doc(db, 'usuarios', user.uid), update, { merge: true })
    } catch (e) { console.error('Error guardando minijuego:', e) }
  },

  loadTransactions: async (limitCount = 100) => {
    const { user } = get()
    if (!user) return
    try {
      const q = query(collection(db, 'usuarios', user.uid, 'transacciones'), orderBy('createdAt', 'desc'), limit(limitCount))
      const snap = await getDocs(q)
      set({ transactions: snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)) })
    } catch (e) { console.error('Error cargando transacciones:', e) }
  },

  loadGlobalJackpot: async () => {
    const { unsubscribeJackpot } = get()
    if (unsubscribeJackpot) unsubscribeJackpot()
    try {
      const snap = await getDoc(doc(db, 'global', 'pozo'))
      if (!snap.exists()) await setDoc(doc(db, 'global', 'pozo'), { monto: 50000 })
    } catch (e) { console.error('Error inicializando pozo:', e) }
    const unsub = onSnapshot(doc(db, 'global', 'pozo'), (snap) => {
      if (snap.exists()) set({ globalJackpot: snap.data().monto || 50000 })
    })
    set({ unsubscribeJackpot: unsub })
  },

  addToJackpot: async (amount) => {
    const { globalJackpot } = get()
    const nuevo = globalJackpot + amount
    set({ globalJackpot: nuevo })
    try {
      await setDoc(doc(db, 'global', 'pozo'), { monto: nuevo })
    } catch (e) { console.error('Error actualizando pozo:', e) }
  },

  resetJackpot: async () => {
    set({ globalJackpot: 50000 })
    try {
      await setDoc(doc(db, 'global', 'pozo'), { monto: 50000 })
    } catch (e) { console.error('Error reseteando pozo:', e) }
  },

  clearError: () => set({ error: null }),
}))

onAuthStateChanged(auth, async (user) => {
  const state = useAuthStore.getState()
  if (user) {
    useAuthStore.setState({ user })
    if (!state.registering) {
      if (!state.profile) state.loadProfile()
      state.loadTransactions()
      state.loadGlobalJackpot()
    }
  } else {
    useAuthStore.setState({ user: null, profile: null, loading: false })
  }
})
