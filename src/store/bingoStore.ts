import { create } from 'zustand'
import type { BingoCard, ExtraOption, CompletedPattern } from '../types/bingo'
import { generateCard, checkPatterns, calcExtraOptions, pickRandomExtra } from '../lib/bingoEngine'
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
  extraOptions: ExtraOption[]
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
  extraOptions: [],
  extraUsed: 0,
  gameOver: false,
  extraResult: null,

  setCardCount: (n) => {
    const count = Math.max(1, Math.min(4, n))
    const { cards } = get()
    // Keep existing cards when adding new ones; remove extras when reducing
    const existing = new Set<string>()
    // Track all numbers from cards we want to keep
    const keepCards = cards.slice(0, count)
    for (let i = 0; i < keepCards.length; i++) {
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 3; r++)
          existing.add(`${c}-${keepCards[i].columns[c][r]}`)
    }
    // Generate any new cards needed
    const newCards = [...keepCards]
    for (let i = keepCards.length; i < count; i++) {
      newCards.push(generateCard(i, existing))
    }
    set({ cardCount: count, cards: newCards })
  },

  setBetAmount: (n) => set({ betAmount: Math.max(10, Math.min(5000, n)) }),
  setTurbo: (v) => set({ isTurbo: v }),

  generatePreview: () => {
    const { cardCount } = get()
    const existing = new Set<string>()
    const cards = Array.from({ length: cardCount }, (_, i) => generateCard(i, existing))
    set({ cards, calledNumbers: [], isPlaying: false, roundOver: false, completedPatterns: [], totalWin: 0, currentWins: 0, pendingWins: 0, claimed: false, extraResult: null })
  },

  regenerateCard: (index) => {
    const { cards } = get()
    if (index < 0 || index >= cards.length) return
    const existing = new Set<string>()
    for (let i = 0; i < cards.length; i++) {
      if (i === index) continue
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 3; r++)
          existing.add(`${c}-${cards[i].columns[c][r]}`)
    }
    const newCard = generateCard(index, existing)
    const newCards = cards.map((c, i) => i === index ? newCard : c)
    set({ cards: newCards })
  },

  randomizeCards: () => {
    get().generatePreview()
  },

  startGame: () => {
    const { cards, betAmount } = get()
    const totalCost = cards.length * betAmount
    const gs = useGameStore.getState()
    if (gs.balance < totalCost) {
      useUIStore.getState().addNotification('Saldo insuficiente', 'info')
      return
    }
    useGameStore.setState({ balance: gs.balance - totalCost })
    useAuthStore.getState().updateProfile({ balance: gs.balance - totalCost })
    useProgressionStore.getState().awardXP(Math.max(1, Math.floor(totalCost / 50)))
    useProgressionStore.getState().checkAchievements()
    // Update missions
    const missions = useProgressionStore.getState().dailyMissions
    missions.forEach(m => {
      if (m.id.startsWith('bingo') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
      if (m.id.startsWith('spin') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
    })
    set({
      calledNumbers: [],
      isPlaying: true,
      roundOver: false,
      completedPatterns: [],
      totalWin: 0,
      currentWins: 0,
      pendingWins: 0,
      claimed: false,
      extraOptions: [],
      extraUsed: 0,
      gameOver: false,
      extraResult: null,
    })
  },

  markNumber: (n) => {
    const { cards } = get()
    const newCards = cards.map(c => {
      const marked = c.marked.map(col => [...col])
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
          if (c.columns[col][row] === n) marked[col][row] = true
        }
      }
      return { ...c, marked }
    })
    set({ cards: newCards })
  },

  endRound: () => {
    const { cards, betAmount } = get()
    const patterns = checkPatterns(cards, betAmount)
    const total = patterns.reduce((s, p) => s + p.payout, 0)
    set({
      roundOver: true,
      completedPatterns: patterns,
      totalWin: total,
      pendingWins: get().pendingWins + total,
      isPlaying: false,
    })
    if (total > 0) {
      useProgressionStore.getState().awardXP(Math.max(5, Math.floor(total / 10)))
      useProgressionStore.getState().checkAchievements()
      // Update bonus mission (patterns completed)
      const missions = useProgressionStore.getState().dailyMissions
      missions.forEach(m => {
        if (m.id.startsWith('bonus') && !m.completed) useProgressionStore.getState().updateMission(m.id, patterns.length)
      })
    }
  },

  callNext: () => {
    const { calledNumbers } = get()
    const available: number[] = []
    for (let n = 1; n <= 90; n++) {
      if (!calledNumbers.includes(n)) available.push(n)
    }
    if (available.length === 0) return true
    const pick = available[Math.floor(Math.random() * available.length)]
    const newCalled = [...calledNumbers, pick]
    set({ calledNumbers: newCalled })
    get().markNumber(pick)
    if (newCalled.length >= MAX_CALLS) return true
    return false
  },

  calcExtras: () => {
    const { cards, calledNumbers, betAmount } = get()
    const calledSet = new Set(calledNumbers)
    const options = calcExtraOptions(cards, calledSet, betAmount)
    set({ extraOptions: options.slice(0, 10) })
  },

  buyRandomExtra: () => {
    const { extraOptions, extraUsed, betAmount, calledNumbers } = get()
    const gs = useGameStore.getState()

    let option: ExtraOption | null = null
    let cost = 0

    if (extraOptions.length > 0) {
      option = pickRandomExtra(extraOptions)
      if (!option) return
      if (gs.balance < option.cost) {
        useUIStore.getState().addNotification('Saldo insuficiente para extra', 'info')
        return
      }
      cost = option.cost
    } else {
      // No options available: draw a random remaining number for free
      const available: number[] = []
      for (let n = 1; n <= 90; n++) {
        if (!calledNumbers.includes(n)) available.push(n)
      }
      if (available.length === 0) return
      const num = available[Math.floor(Math.random() * available.length)]
      option = { number: num, potentialWin: 0, cost: 0, completedPatterns: [] }
    }

    useGameStore.setState({ balance: gs.balance - cost })
    useAuthStore.getState().updateProfile({ balance: gs.balance - cost })
    useProgressionStore.getState().awardXP(Math.max(1, Math.floor(cost / 50)))
    get().markNumber(option.number)
    const newCalled = [...get().calledNumbers, option.number]
    set({ calledNumbers: newCalled })

    // Use updated cards after marking
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
      extraOptions: [],
      extraResult: { number: option.number, won: newPayout },
      gameOver,
    })

    if (!gameOver) {
      setTimeout(() => {
        const s = get()
        const calledSet = new Set(s.calledNumbers)
        const opts = calcExtraOptions(s.cards, calledSet, s.betAmount)
        set({ extraOptions: opts.slice(0, 10) })
      }, 100)
    }
  },

  finishGame: () => {
    set({ gameOver: true, isPlaying: false })
  },

  claimWinnings: () => {
    const { pendingWins } = get()
    if (pendingWins <= 0) return
    const gs = useGameStore.getState()
    useGameStore.setState({ balance: gs.balance + pendingWins })
    useAuthStore.getState().updateProfile({ balance: gs.balance + pendingWins })
    useProgressionStore.getState().awardXP(Math.max(5, Math.floor(pendingWins / 20)))
    useProgressionStore.getState().checkAchievements()
    // Update win mission
    const missions = useProgressionStore.getState().dailyMissions
    missions.forEach(m => {
      if (m.id.startsWith('win') && !m.completed) useProgressionStore.getState().updateMission(m.id, pendingWins)
    })
    set({ claimed: true, currentWins: get().currentWins + pendingWins, pendingWins: 0 })
  },

  resetGame: () => {
    set({
      cards: [],
      calledNumbers: [],
      isPlaying: false,
      roundOver: false,
      completedPatterns: [],
      totalWin: 0,
      currentWins: 0,
      pendingWins: 0,
      claimed: false,
      extraOptions: [],
      extraUsed: 0,
      gameOver: false,
      extraResult: null,
    })
    get().generatePreview()
  },
}))

// Auto-generate preview cards on load
setTimeout(() => useBingoStore.getState().generatePreview(), 0)
