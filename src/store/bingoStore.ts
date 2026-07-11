import { create } from 'zustand'
import type { BingoCard, CompletedPattern, MissingHighlight } from '../types/bingo'
import { generateCard, checkPatterns, getMissingHighlights } from '../lib/bingoEngine'
import { useGameStore } from './gameStore'
import { useUIStore } from './uiStore'
import { useAuthStore } from './authStore'
import { useProgressionStore } from './progressionStore'
import { soundManager } from '../lib/soundManager'

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
  highlights: MissingHighlight[][]

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
  highlights: [],

  setCardCount: (n) => {
    const count = Math.max(1, Math.min(6, n))
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
    set({ cards, calledNumbers: [], isPlaying: false, roundOver: false, completedPatterns: [], totalWin: 0, currentWins: 0, pendingWins: 0, claimed: false, extraResult: null, highlights: [] })
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
    useAuthStore.getState().addToJackpot('bingo', Math.round(totalCost * 0.05))
    useProgressionStore.getState().awardXP(Math.max(1, Math.floor(totalCost / 50)))
    useProgressionStore.getState().checkAchievements()
    useProgressionStore.setState({ bingoRounds: useProgressionStore.getState().bingoRounds + 1 })
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
      soundManager.play('win')
      useProgressionStore.getState().awardXP(Math.max(5, Math.floor(total / 10)))
      useProgressionStore.getState().checkAchievements()
      useProgressionStore.setState({ bingoPatterns: useProgressionStore.getState().bingoPatterns + patterns.filter(p => !p.patternId.startsWith('combo')).length })
      if (patterns.some(p => p.patternId === 'full_card')) {
        useProgressionStore.setState({ bingoFullCards: useProgressionStore.getState().bingoFullCards + 1 })
      }
      useProgressionStore.getState().dailyMissions.forEach(m => {
        if (m.id.startsWith('bonus') && !m.completed) useProgressionStore.getState().updateMission(m.id, patterns.length)
      })
    }
  },

  callNext: () => {
    const { calledNumbers, cards } = get()
    const calledSet = new Set(calledNumbers)
    const pool: { num: number; weight: number }[] = []
    for (let n = 1; n <= 90; n++) {
      if (calledSet.has(n)) continue
      let weight = 1
      for (const card of cards)
        for (let c = 0; c < 5; c++)
          for (let r = 0; r < 3; r++)
            if (card.columns[c][r] === n && !card.marked[c][r]) weight = 4
      pool.push({ num: n, weight })
    }
    if (pool.length === 0) return true
    const total = pool.reduce((s, i) => s + i.weight, 0)
    let r = Math.random() * total
    let pick = pool[0].num
    for (const item of pool) { r -= item.weight; if (r <= 0) { pick = item.num; break } }
    set({ calledNumbers: [...calledNumbers, pick] })
    get().markNumber(pick)
    return calledNumbers.length + 1 >= MAX_CALLS
  },

  calcExtras: () => {
    const { cards, betAmount } = get()
    const highlights = getMissingHighlights(cards)
    const totalPayoutX = highlights.reduce((sum, cardHl) => sum + cardHl.reduce((s, h) => s + h.payout, 0), 0)
    const cost = highlights.length > 0 ? Math.max(10, Math.round(totalPayoutX * betAmount * 0.15 / Math.max(1, highlights.length))) : 0
    set({ extraChances: highlights.length, extraCost: cost, highlights })
  },

  buyRandomExtra: () => {
    const { extraCost, extraUsed, betAmount, calledNumbers } = get()
    const gs = useGameStore.getState()
    if (extraCost > 0 && gs.balance < extraCost) { useUIStore.getState().addNotification('Saldo insuficiente para extra', 'info'); return }

    if (extraCost > 0) {
      useGameStore.setState({ balance: gs.balance - extraCost })
      useAuthStore.getState().updateProfile({ balance: gs.balance - extraCost })
      useProgressionStore.getState().awardXP(Math.max(1, Math.floor(extraCost / 50)))
    }
    useProgressionStore.setState({ extraUsed: useProgressionStore.getState().extraUsed + 1 })

    // Draw a random remaining number (weighted toward player cards)
    const { cards } = get()
    const calledSet = new Set(calledNumbers)
    const pool: { num: number; weight: number }[] = []
    for (let n = 1; n <= 90; n++) {
      if (calledSet.has(n)) continue
      let weight = 1
      for (const card of cards)
        for (let c = 0; c < 5; c++)
          for (let r = 0; r < 3; r++)
            if (card.columns[c][r] === n && !card.marked[c][r]) weight = 4
      pool.push({ num: n, weight })
    }
    if (pool.length === 0) return
    const total = pool.reduce((s, i) => s + i.weight, 0)
    let r = Math.random() * total
    let num = pool[0].num
    for (const item of pool) { r -= item.weight; if (r <= 0) { num = item.num; break } }

    get().markNumber(num)
    set({ calledNumbers: [...get().calledNumbers, num] })

    // Check for new patterns
    const { cards: updatedCards } = get()
    const existing = new Set(get().completedPatterns.map(cp => `${cp.cardIndex}-${cp.patternId}`))
    const allPatterns = checkPatterns(updatedCards, betAmount)
    const newPatterns = allPatterns.filter(cp => !existing.has(`${cp.cardIndex}-${cp.patternId}`))
    const newPayout = newPatterns.reduce((s, p) => s + p.payout, 0)

    if (newPayout > 0) soundManager.play('win')
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
        const hl = getMissingHighlights(s.cards)
        const totalX = hl.reduce((sum, cardHl) => sum + cardHl.reduce((a, h) => a + h.payout, 0), 0)
        set({ extraChances: hl.length, extraCost: hl.length > 0 ? Math.max(10, Math.round(totalX * s.betAmount * 0.15 / Math.max(1, hl.length))) : 0, highlights: hl })
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
    soundManager.play('collect')
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
      completedPatterns: [], totalWin: 0, currentWins: 0, pendingWins: 0, claimed: false,
      extraUsed: 0, gameOver: false, extraResult: null, highlights: [],
    })
    get().generatePreview()
  },
}))

// Auto-generate preview cards on load
setTimeout(() => useBingoStore.getState().generatePreview(), 0)
