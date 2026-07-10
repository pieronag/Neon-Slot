import { create } from 'zustand'
import type { BingoCard, CompletedPattern } from '../types/bingo'
import { generateCard, checkPatterns, countExtraChances } from '../lib/bingoEngine'
import { useGameStore } from './gameStore'
import { useUIStore } from './uiStore'
import { useAuthStore } from './authStore'
import { useProgressionStore } from './progressionStore'

interface BingoState {
  cards: BingoCard[]
  cardCount: number
  betAmount: number
  calledNumbers: number[]
  isPlaying: boolean
  isTurbo: boolean
  roundOver: boolean
  completedPatterns: CompletedPattern[]
  totalWin: number
  currentWins: number
  pendingWins: number
  claimed: boolean
  extraChances: number
  extraCost: number
  extraUsed: number
  gameOver: boolean
  extraResult: { number: number; won: number } | null

  setCardCount: (n: number) => void
  setBetAmount: (n: number) => void
  setTurbo: (v: boolean) => void
  generatePreview: () => void
  regenerateCard: (index: number) => void
  randomizeCards: () => void
  startGame: () => void
  callNext: () => boolean
  markNumber: (n: number) => void
  endRound: () => void
  calcExtras: () => void
  buyRandomExtra: () => void
  claimWinnings: () => void
  finishGame: () => void
  resetGame: () => void
}

const MAX_CALLS = 30
const MAX_EXTRAS = 10

export const useBingoStore = create<BingoState>((set, get) => ({
  cards: [],
  cardCount: 4,
  betAmount: 100,
  calledNumbers: [],
  isPlaying: false,
  isTurbo: false,
  roundOver: false,
  completedPatterns: [],
  totalWin: 0,
  currentWins: 0,
  pendingWins: 0,
  claimed: false,
  extraChances: 0,
  extraCost: 0,
  extraUsed: 0,
  gameOver: false,
  extraResult: null,

  setCardCount: (n) => {
    const count = Math.max(1, Math.min(4, n))
    const { cards } = get()
    const keepCards = cards.slice(0, count)
    const newCards = [...keepCards]
    for (let i = keepCards.length; i < count; i++)
      newCards.push(generateCard(i))
    set({ cardCount: count, cards: newCards })
  },

  setBetAmount: (n) => set({ betAmount: Math.max(10, Math.min(5000, n)) }),
  setTurbo: (v) => set({ isTurbo: v }),

  generatePreview: () => {
    const { cardCount } = get()
    const cards = Array.from({ length: cardCount }, (_, i) => generateCard(i))
    set({ cards, calledNumbers: [], isPlaying: false, roundOver: false, completedPatterns: [], totalWin: 0, currentWins: 0, pendingWins: 0, claimed: false, extraResult: null })
  },

  regenerateCard: (index) => {
    const { cards } = get()
    if (index < 0 || index >= cards.length) return
    const newCard = generateCard(index)
    set({ cards: cards.map((c, i) => i === index ? newCard : c) })
  },

  randomizeCards: () => { get().generatePreview() },

  startGame: () => {
    const { cards, betAmount } = get()
    const totalCost = cards.length * betAmount
    const gs = useGameStore.getState()
    if (gs.balance < totalCost) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }
    useGameStore.setState({ balance: gs.balance - totalCost })
    useAuthStore.getState().updateProfile({ balance: gs.balance - totalCost })
    useProgressionStore.getState().awardXP(Math.max(1, Math.floor(totalCost / 50)))
    useProgressionStore.getState().checkAchievements()
    useProgressionStore.getState().dailyMissions.forEach(m => {
      if (m.id.startsWith('bingo') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
      if (m.id.startsWith('spin') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
    })
    set({
      calledNumbers: [], isPlaying: true, roundOver: false, completedPatterns: [],
      totalWin: 0, currentWins: 0, pendingWins: 0, claimed: false,
      extraUsed: 0, gameOver: false, extraResult: null,
    })
  },

  markNumber: (n) => {
    const { cards } = get()
    set({ cards: cards.map(c => {
      const marked = c.marked.map(col => [...col])
      for (let col = 0; col < 5; col++)
        for (let row = 0; row < 3; row++)
          if (c.columns[col][row] === n) marked[col][row] = true
      return { ...c, marked }
    }) })
  },

  endRound: () => {
    const { cards, betAmount } = get()
    const patterns = checkPatterns(cards, betAmount)
    const total = patterns.reduce((s, p) => s + p.payout, 0)
    set({ roundOver: true, completedPatterns: patterns, totalWin: total, pendingWins: get().pendingWins + total, isPlaying: false })
    if (total > 0) {
      useProgressionStore.getState().awardXP(Math.max(5, Math.floor(total / 10)))
      useProgressionStore.getState().checkAchievements()
      useProgressionStore.getState().dailyMissions.forEach(m => {
        if (m.id.startsWith('bonus') && !m.completed) useProgressionStore.getState().updateMission(m.id, patterns.length)
      })
    }
  },

  callNext: () => {
    const { calledNumbers } = get()
    const available: number[] = []
    for (let n = 1; n <= 90; n++) { if (!calledNumbers.includes(n)) available.push(n) }
    if (available.length === 0) return true
    const pick = available[Math.floor(Math.random() * available.length)]
    set({ calledNumbers: [...calledNumbers, pick] })
    get().markNumber(pick)
    return calledNumbers.length + 1 >= MAX_CALLS
  },

  calcExtras: () => {
    const { cards, calledNumbers, betAmount } = get()
    const calledSet = new Set(calledNumbers)
    const chances = countExtraChances(cards, calledSet)
    const cost = Math.max(10, Math.round(chances * (betAmount / 100) * 2))
    set({ extraChances: chances, extraCost: cost })
  },

  buyRandomExtra: () => {
    const { extraCost, extraUsed, betAmount, calledNumbers } = get()
    const gs = useGameStore.getState()
    if (gs.balance < extraCost) { useUIStore.getState().addNotification('Saldo insuficiente para extra', 'info'); return }

    useGameStore.setState({ balance: gs.balance - extraCost })
    useAuthStore.getState().updateProfile({ balance: gs.balance - extraCost })
    useProgressionStore.getState().awardXP(Math.max(1, Math.floor(extraCost / 50)))

    // Draw a random remaining number
    const available: number[] = []
    for (let n = 1; n <= 90; n++) { if (!calledNumbers.includes(n)) available.push(n) }
    if (available.length === 0) return
    const num = available[Math.floor(Math.random() * available.length)]

    get().markNumber(num)
    set({ calledNumbers: [...get().calledNumbers, num] })

    // Check for new patterns
    const { cards: updatedCards } = get()
    const existing = new Set(get().completedPatterns.map(cp => `${cp.cardIndex}-${cp.patternId}`))
    const allPatterns = checkPatterns(updatedCards, betAmount)
    const newPatterns = allPatterns.filter(cp => !existing.has(`${cp.cardIndex}-${cp.patternId}`))
    const newPayout = newPatterns.reduce((s, p) => s + p.payout, 0)

    const newExtraUsed = extraUsed + 1
    const gameOver = newExtraUsed >= MAX_EXTRAS
    set({
      extraUsed: newExtraUsed,
      completedPatterns: [...get().completedPatterns, ...newPatterns],
      totalWin: get().totalWin + newPayout,
      pendingWins: get().pendingWins + newPayout,
      claimed: newPayout > 0 ? false : get().claimed,
      extraResult: { number: num, won: newPayout },
      gameOver,
    })

    if (!gameOver) {
      setTimeout(() => {
        const s = get()
        const calledSet = new Set(s.calledNumbers)
        set({ extraChances: countExtraChances(s.cards, calledSet), extraCost: Math.max(10, Math.round(countExtraChances(s.cards, calledSet) * (s.betAmount / 100) * 2)) })
      }, 100)
    }
  },

  finishGame: () => { set({ gameOver: true, isPlaying: false }) },

  claimWinnings: () => {
    const { pendingWins } = get()
    if (pendingWins <= 0) return
    const gs = useGameStore.getState()
    useGameStore.setState({ balance: gs.balance + pendingWins })
    useAuthStore.getState().updateProfile({ balance: gs.balance + pendingWins })
    useProgressionStore.getState().awardXP(Math.max(5, Math.floor(pendingWins / 20)))
    useProgressionStore.getState().checkAchievements()
    useProgressionStore.getState().dailyMissions.forEach(m => {
      if (m.id.startsWith('win') && !m.completed) useProgressionStore.getState().updateMission(m.id, pendingWins)
    })
    set({ claimed: true, currentWins: get().currentWins + pendingWins, pendingWins: 0 })
  },

  resetGame: () => {
    set({
      cards: [], calledNumbers: [], isPlaying: false, roundOver: false,
      completedPatterns: [], totalWin: 0, currentWins: 0, pendingWins: 0,
      claimed: false, extraUsed: 0, gameOver: false, extraResult: null,
    })
    get().generatePreview()
  },
}))

// Auto-generate preview cards on load
setTimeout(() => useBingoStore.getState().generatePreview(), 0)
