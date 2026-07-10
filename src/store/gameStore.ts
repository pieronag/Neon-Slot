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
  bonusSpins: number
  bonusMult: number
  gameMode: GameMode
  autoSpinCount: number
  lossStreak: number
  winStreak: number
  autoPausedCount: number
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
  resumeAutoSpin: () => void
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
  bonusSpins: 0,
  bonusMult: 1,
  gameMode: 'normal',
  autoSpinCount: 0,
  lossStreak: 0,
  winStreak: 0,
  autoPausedCount: 0,
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

    const effMult = get().bonusSpins > 0 ? get().bonusMult : 1
    const result = spinEngine(betAmount, freeSpinsRemaining > 0, effMult, lossStreak)
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

      const newBonusSpins = result.bonusTriggered ? 25 : Math.max(0, get().bonusSpins - (get().bonusSpins > 0 ? 1 : 0))
      const newBonusMult = result.bonusTriggered ? (result.scatterCount >= 5 ? 10 : result.scatterCount >= 4 ? 5 : 2) : get().bonusMult
      const baseForBonus = result.bonusTriggered ? Math.round(result.totalPayout / Math.max(1, effMult)) : result.totalPayout
      const finalWinMult = result.bonusTriggered ? newBonusMult : effMult
      const totalWinAmount = isWin ? Math.round(baseForBonus * finalWinMult) : 0
      const bonusExtra = totalWinAmount > 0 && result.bonusTriggered ? totalWinAmount - result.totalPayout : 0
      const finalBalance = newBalance + jackpotPayout + bonusExtra

      set({
        balance: finalBalance,
        isSpinning: false,
        totalSpins: get().totalSpins + 1,
        totalWins: get().totalWins + totalWinAmount + jackpotPayout,
        totalBets: get().totalBets + cost,
        biggestWin: Math.max(get().biggestWin, result.totalPayout, jackpotPayout),
        lossStreak: newLossStreak,
        winStreak: newWinStreak,
        freeSpinsRemaining: newFreeSpins,
        currentMultiplier: currentMultiplier,
        bonusSpins: newBonusSpins,
        bonusMult: newBonusMult,
        autoSpinCount: gm === 'auto' ? Math.max(0, ac - 1) : 0,
      })

      if (result.totalPayout > 0) {
        if (result.totalPayout >= betAmount * 30) soundManager.play('bigwin')
        else soundManager.play('win')
        useUIStore.getState().showWin(result.totalPayout + bonusExtra)
      }
      if (result.bonusTriggered) {
        soundManager.play('bonus')
        useUIStore.getState().addNotification(`Bonificación x${newBonusMult} activada por 25 giros!`, 'bonus')
      }

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
          balance: finalBalance,
          level,
          xp,
          achievements,
          dailyMissions,
          dailyLoginDay,
          lastLoginDate,
          totalSpins: get().totalSpins,
          totalBets: get().totalBets,
          totalWins: isWin ? profile.totalWins + totalWinAmount : profile.totalWins,
          biggestWin: Math.max(profile.biggestWin, Math.round(result.totalPayout)),
          lastConnection: new Date().toISOString(),
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
              ? `Bonificación x${result.bonusMultiplier}: ${formatBet(Math.round(result.totalPayout))}`
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

      let willShowMinigame = false

      if (!isWin && newBalance > 0 && Math.random() < 0.15) {
        willShowMinigame = true
        setTimeout(() => { useUIStore.setState({ showWheel: true }) }, 600)
      }

      if (isWin && result.totalPayout > betAmount * 0.5) {
        if (Math.random() < 0.25) {
          willShowMinigame = true
          setTimeout(() => { useUIStore.setState({ showDouble: true, doubleAmount: result.totalPayout, doubleWon: null }) }, 700)
        }
        if (Math.random() < 0.1) {
          willShowMinigame = true
          setTimeout(() => { useUIStore.setState({ showMysteryBox: true }) }, 900)
        }
      }

      if (newBalance > 0 && Math.random() < 0.05) {
        willShowMinigame = true
        setTimeout(() => { useUIStore.setState({ showCardFlip: true }) }, 800)
      }

      if (gm === 'auto' && get().autoSpinCount > 0 && get().balance >= get().betAmount) {
        if (willShowMinigame) {
          set({ autoPausedCount: get().autoSpinCount, autoSpinCount: 0 })
        } else {
          setTimeout(() => get().spin(), 400)
        }
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
  resumeAutoSpin: () => {
    const count = get().autoPausedCount
    if (count > 0) {
      set({ autoPausedCount: 0, autoSpinCount: count, gameMode: 'auto' })
      setTimeout(() => get().spin(), 400)
    }
  },
  resetGame: () => set({
    balance: 10000, betAmount: 100, isSpinning: false, reelsResult: [], lastResult: null,
    freeSpinsRemaining: 0, currentMultiplier: 1, bonusSpins: 0, bonusMult: 1, lossStreak: 0, winStreak: 0,
    totalSpins: 0, totalWins: 0, totalBets: 0, biggestWin: 0, lastWinAmount: 0,
    gameMode: 'normal', autoSpinCount: 0, autoPausedCount: 0,
  }),
}))
