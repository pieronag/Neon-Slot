import { create } from 'zustand'
import type { SpinResult, GameMode } from '../types/game'
import { spin as spinEngine } from '../lib/spinEngine'
import { soundManager } from '../lib/soundManager'
import { getSymbol } from '../lib/symbols'
import { useUIStore } from './uiStore'
import { useProgressionStore } from './progressionStore'
import { useAuthStore } from './authStore'

const SPIN_DURATION = { normal: 3500, turbo: 1200 }
const formatBet = (n: number) => n.toLocaleString('es-CL') + ' monedas'

interface GameState {
  balance: number
  betAmount: number
  isSpinning: boolean
  reelsResult: string[][]
  lastResult: SpinResult | null
  freeSpinsRemaining: number
  currentMultiplier: number
  gameMode: GameMode
  autoSpinCount: number
  lossStreak: number
  winStreak: number
  totalSpins: number
  totalWins: number
  totalBets: number
  biggestWin: number
  lastWinAmount: number

  setBet: (amount: number) => void
  spin: () => SpinResult | null
  addFreeSpins: (count: number) => void
  setGameMode: (mode: GameMode) => void
  stopAutoSpin: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  balance: 10000,
  betAmount: 100,
  isSpinning: false,
  reelsResult: [],
  lastResult: null,
  freeSpinsRemaining: 0,
  currentMultiplier: 1,
  gameMode: 'normal',
  autoSpinCount: 0,
  lossStreak: 0,
  winStreak: 0,
  totalSpins: 0,
  totalWins: 0,
  totalBets: 0,
  biggestWin: 0,
  lastWinAmount: 0,

  setBet: (amount) => set({ betAmount: Math.max(10, Math.min(5000, amount)) }),

  spin: () => {
    const { balance, betAmount, isSpinning, freeSpinsRemaining, currentMultiplier, gameMode, lossStreak } = get()
    if (isSpinning) return null
    const canSpin = freeSpinsRemaining > 0 || balance >= betAmount
    if (!canSpin) return null

    const cost = freeSpinsRemaining > 0 ? 0 : betAmount
    soundManager.play('spin')

    const result = spinEngine(betAmount, freeSpinsRemaining > 0, currentMultiplier, lossStreak)
    set({ isSpinning: true, reelsResult: result.reels, lastResult: result })
    const duration = gameMode === 'turbo' ? SPIN_DURATION.turbo : SPIN_DURATION.normal

    setTimeout(() => {
      const { freeSpinsRemaining: fs, balance: bal, gameMode: gm, autoSpinCount: ac } = get()

      const newBalance = Math.round(bal - cost + result.totalPayout)
      const newFreeSpins = fs > 0 ? fs - 1 : 0
      const isWin = result.totalPayout > 0
      const newLossStreak = isWin ? 0 : get().lossStreak + 1
      const newWinStreak = isWin ? get().winStreak + 1 : 0

      useAuthStore.getState().addToJackpot(Math.round(cost * 0.15))

      const jackpotActual = useAuthStore.getState().globalJackpot
      const jackpotWon = result.wins.some(w => w.count >= 5 && w.symbolId === 'diamond')
      const jackpotPayout = jackpotWon ? jackpotActual : 0

      if (jackpotWon) {
        soundManager.play('bigwin')
        useUIStore.getState().showWin(jackpotActual)
        useAuthStore.getState().resetJackpot()
        useProgressionStore.getState().addAchievement('jackpot_win')
      }

      set({
        balance: newBalance + jackpotPayout,
        isSpinning: false,
        totalSpins: get().totalSpins + 1,
        totalWins: isWin ? get().totalWins + result.totalPayout + jackpotPayout : get().totalWins,
        totalBets: get().totalBets + cost,
        biggestWin: Math.max(get().biggestWin, result.totalPayout, jackpotPayout),
        lossStreak: newLossStreak,
        winStreak: newWinStreak,
        freeSpinsRemaining: result.bonusTriggered ? newFreeSpins + result.freeSpinsAwarded : newFreeSpins,
        currentMultiplier: result.bonusTriggered ? Math.min(get().currentMultiplier + 1, 5) : currentMultiplier,
        autoSpinCount: gm === 'auto' ? Math.max(0, ac - 1) : 0,
      })

      if (result.totalPayout > 0) {
        if (result.totalPayout >= betAmount * 30) soundManager.play('bigwin')
        else soundManager.play('win')
        useUIStore.getState().showWin(result.totalPayout)
      }
      if (result.bonusTriggered) soundManager.play('bonus')

      useProgressionStore.getState().awardXP(Math.max(1, Math.floor(betAmount / 10)))
      useProgressionStore.getState().checkAchievements()
      useProgressionStore.setState({ sessionSpins: useProgressionStore.getState().sessionSpins + 1 })
      if (result.totalPayout > 0) {
        useProgressionStore.setState({ sessionWins: useProgressionStore.getState().sessionWins + Math.round(result.totalPayout) })
      }
      const { user, profile } = useAuthStore.getState()
      if (user && profile) {
        const { level, xp, achievements, dailyMissions, dailyLoginDay, lastLoginDate } = useProgressionStore.getState()
        useAuthStore.getState().updateProfile({
          balance: newBalance,
          level,
          xp,
          achievements,
          dailyMissions,
          dailyLoginDay,
          lastLoginDate,
          totalSpins: get().totalSpins + 1,
          totalBets: get().totalBets + cost,
          totalWins: isWin ? profile.totalWins + Math.round(result.totalPayout) : profile.totalWins,
          biggestWin: Math.max(profile.biggestWin, Math.round(result.totalPayout)),
        }).catch(() => {})

        if (cost > 0) {
          useAuthStore.getState().addTransaction({
            type: 'bet', amount: -cost,
            balanceBefore: bal, balanceAfter: bal - cost,
            description: `Apuesta de ${formatBet(betAmount)}`,
          })
        }
        if (result.totalPayout > 0) {
          const txType = result.bonusTriggered ? 'bonus' : 'win'
          useAuthStore.getState().addTransaction({
            type: txType, amount: Math.round(result.totalPayout),
            balanceBefore: newBalance - Math.round(result.totalPayout),
            balanceAfter: newBalance,
            description: result.bonusTriggered
              ? `Bonificación de ${formatBet(Math.round(result.totalPayout))}`
              : `Ganancia de ${formatBet(Math.round(result.totalPayout))}`,
          })
        }
      }

      const missions = useProgressionStore.getState().dailyMissions
      missions.forEach(m => {
        if (m.id.startsWith('spin') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
        if (m.id.startsWith('win') && result.totalPayout > 0 && !m.completed) useProgressionStore.getState().updateMission(m.id, Math.round(result.totalPayout))
        if (m.id.startsWith('bonus') && result.bonusTriggered && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
      })

      if (result.avalancheCount > 0) {
        useUIStore.setState({ showAvalanche: result.avalancheCount })
        setTimeout(() => useUIStore.setState({ showAvalanche: 0 }), 3000)
      }

      if (result.expandingWild && freeSpinsRemaining > 0) {
        const sym = getSymbol(result.expandingWild)
        useUIStore.getState().addNotification(`Expanding Wild: ${sym.name} se expande!`, 'bonus')
      }

      if (newLossStreak >= 8 && isWin === false && newBalance > 0 && gm !== 'auto') {
        setTimeout(() => {
          useUIStore.setState({ showWheel: true })
        }, 600)
      }

      if (isWin && result.totalPayout > 10 && result.totalPayout < betAmount * 50 && gm !== 'auto' && Math.random() < 0.25) {
        setTimeout(() => {
          useUIStore.setState({ showDouble: true, doubleAmount: result.totalPayout, doubleWon: null })
        }, 700)
      }

      if (gm === 'auto' && get().autoSpinCount > 0 && get().balance >= get().betAmount) {
        setTimeout(() => get().spin(), 400)
      }
    }, duration)

    return result
  },

  addFreeSpins: (count) => set(s => ({ freeSpinsRemaining: s.freeSpinsRemaining + count })),
  setGameMode: (mode) => {
    const cur = get().gameMode
    if (cur === mode) set({ gameMode: 'normal', autoSpinCount: 0 })
    else set({ gameMode: mode, autoSpinCount: mode === 'auto' ? 25 : 0 })
  },
  stopAutoSpin: () => set({ gameMode: 'normal', autoSpinCount: 0 }),
  resetGame: () => set({
    balance: 10000, betAmount: 100, isSpinning: false, reelsResult: [], lastResult: null,
    freeSpinsRemaining: 0, currentMultiplier: 1, lossStreak: 0, winStreak: 0,
    totalSpins: 0, totalWins: 0, totalBets: 0, biggestWin: 0, lastWinAmount: 0,
    gameMode: 'normal', autoSpinCount: 0,
  }),
}))
