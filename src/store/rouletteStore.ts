import { create } from 'zustand'
import type { Bet, BetType } from '../lib/rouletteEngine'
import { calcWin } from '../lib/rouletteEngine'
import { useGameStore } from './gameStore'
import { useAuthStore } from './authStore'
import { useUIStore } from './uiStore'
import { useProgressionStore } from './progressionStore'
import { soundManager } from '../lib/soundManager'

interface RouletteState {
  bets: Bet[]
  chipValue: number
  spinning: boolean
  winnerNumber: number | null
  result: string
  lastPayout: number
  phase: 'bet' | 'spin' | 'result'

  setChipValue: (v: number) => void
  placeBet: (type: BetType, numbers: number[], label: string) => void
  removeBet: (id: string) => void
  clearBets: () => void
  spin: () => void
  newRound: () => void
}

let betId = 0

export const useRouletteStore = create<RouletteState>((set, get) => ({
  bets: [],
  chipValue: 500,
  spinning: false,
  winnerNumber: null,
  result: '',
  lastPayout: 0,
  phase: 'bet',

  setChipValue: (v) => set({ chipValue: Math.max(500, Math.min(25000, v)) }),

  placeBet: (type, numbers, label) => {
    const { chipValue, bets } = get()
    const gs = useGameStore.getState()
    if (gs.balance < chipValue) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }
    const existing = bets.find(b => b.type === type && JSON.stringify(b.numbers) === JSON.stringify(numbers))
    if (existing) {
      if (gs.balance < chipValue) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }
      useGameStore.setState({ balance: gs.balance - chipValue })
      useAuthStore.getState().addToJackpot('roulette', Math.round(chipValue * 0.05))
      set({ bets: bets.map(b => b.id === existing.id ? { ...b, amount: b.amount + chipValue } : b) })
    } else {
      useGameStore.setState({ balance: gs.balance - chipValue })
      useAuthStore.getState().addToJackpot('roulette', Math.round(chipValue * 0.05))
      set({ bets: [...bets, { id: `bet_${betId++}`, type, numbers, amount: chipValue, label, payout: 0 }] })
    }
  },

  removeBet: (id) => {
    const bet = get().bets.find(b => b.id === id)
    if (bet) { useGameStore.setState({ balance: useGameStore.getState().balance + bet.amount }); set({ bets: get().bets.filter(b => b.id !== id) }) }
  },

  clearBets: () => {
    const total = get().bets.reduce((s, b) => s + b.amount, 0)
    if (total > 0) useGameStore.setState({ balance: useGameStore.getState().balance + total })
    set({ bets: [] })
  },

  spin: () => {
    const { bets } = get()
    if (bets.length === 0 || get().spinning) return
    set({ spinning: true, phase: 'spin', winnerNumber: null, result: '' })
    soundManager.play('spin')

    const winner = Math.floor(Math.random() * 37)
    const { totalPayout } = calcWin(bets, winner)

    setTimeout(() => {
      const gs = useGameStore.getState()
      const totalBet = bets.reduce((s, b) => s + b.amount, 0)
      if (totalPayout > 0) {
        useGameStore.setState({ balance: gs.balance + totalPayout })
        useAuthStore.getState().updateProfile({ balance: gs.balance + totalPayout })
        soundManager.play('win')
        useProgressionStore.getState().awardXP(Math.max(5, Math.floor(totalPayout / 50)))
      } else {
        soundManager.play('click')
        useProgressionStore.getState().awardXP(Math.max(1, Math.floor(totalBet / 100)))
      }
      useProgressionStore.getState().checkAchievements()
      useProgressionStore.getState().dailyMissions.forEach(m => {
        if (m.id.startsWith('spin') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
        if (m.id.startsWith('win') && totalPayout > 0 && !m.completed) useProgressionStore.getState().updateMission(m.id, totalPayout)
      })
      set({ spinning: false, winnerNumber: winner, phase: 'result', lastPayout: totalPayout, result: totalPayout > 0 ? `Ganaste +${totalPayout.toLocaleString('es-CL')}` : `Perdiste -${totalBet.toLocaleString('es-CL')}` })
    }, 3000)
  },

  newRound: () => { set({ bets: [], winnerNumber: null, result: '', lastPayout: 0, phase: 'bet' }) },
}))
