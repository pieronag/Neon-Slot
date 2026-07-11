import { create } from 'zustand'
import type { Card, SplitHand, GamePhase } from '../types/blackjack'
import { createDeck, shuffle, dealCard, evaluateHand } from '../lib/blackjackEngine'
import { useGameStore } from './gameStore'
import { useUIStore } from './uiStore'
import { useAuthStore } from './authStore'
import { useProgressionStore } from './progressionStore'
import { soundManager } from '../lib/soundManager'

interface BlackjackState {
  deck: Card[]
  playerHand: Card[]
  dealerHand: Card[]
  splitHands: SplitHand[]
  activeHand: number
  betAmount: number
  insuranceBet: number
  phase: GamePhase
  result: string
  totalPayout: number
  handCount: number

  setBetAmount: (n: number) => void
  placeBet: () => void
  hit: () => void
  stand: () => void
  double: () => void
  split: () => void
  insurance: (take: boolean) => void
  dealerPlay: () => void
  resolve: () => void
  newGame: () => void
}

export const useBlackjackStore = create<BlackjackState>((set, get) => ({
  deck: [], playerHand: [], dealerHand: [], splitHands: [],
  activeHand: 0, betAmount: 100, insuranceBet: 0,
  phase: 'bet' as GamePhase, result: '', totalPayout: 0, handCount: 0,

  setBetAmount: (n) => set({ betAmount: Math.max(1000, Math.min(50000, n)) }),

  placeBet: () => {
    const { betAmount } = get()
    const gs = useGameStore.getState()
    if (gs.balance < betAmount) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }

    let deck = shuffle(createDeck())
    let c1: Card, c2: Card, dc1: Card, dc2: Card
    ;({ card: c1, deck } = dealCard(deck))
    ;({ card: c2, deck } = dealCard(deck))
    ;({ card: dc1, deck } = dealCard(deck))
    ;({ card: dc2, deck } = dealCard(deck, true))

    useGameStore.setState({ balance: gs.balance - betAmount })
    useAuthStore.getState().updateProfile({ balance: gs.balance - betAmount })
    useAuthStore.getState().addToJackpot('blackjack', Math.round(betAmount * 0.05))

    const pHand = [c1, c2]
    const dHand = [dc1, dc2]
    const pEval = evaluateHand(pHand)

    let phase: GamePhase = dHand[0].rank === 'A' ? 'insurance' : 'playing'

    set({ deck, playerHand: pHand, dealerHand: dHand, splitHands: [], activeHand: 0, insuranceBet: 0, phase, result: '', totalPayout: 0, handCount: get().handCount + 1 })

    if (pEval.isBlackjack && phase !== 'insurance') setTimeout(() => get().stand(), 400)
  },

  hit: () => {
    const { deck, playerHand, splitHands, activeHand } = get()
    let d = [...deck]
    const { card, deck: newDeck } = dealCard(d)
    d = newDeck

    if (splitHands.length > 0) {
      const hand = { ...splitHands[activeHand] }
      hand.cards.push(card)
      const evalu = evaluateHand(hand.cards)
      if (evalu.isBusted || hand.cards.length >= 5) { hand.done = true; hand.result = 'bust' }
      const newHands = [...splitHands]
      newHands[activeHand] = hand
      set({ deck: d, splitHands: newHands })
      if (hand.done) get().stand()
    } else {
      const newHand = [...playerHand, card]
      set({ deck: d, playerHand: newHand })
      const evalu = evaluateHand(newHand)
      if (evalu.isBusted || newHand.length >= 5) setTimeout(() => get().stand(), 300)
    }
  },

  stand: () => {
    const { splitHands, activeHand } = get()
    if (splitHands.length > 0) {
      const nextIdx = splitHands.findIndex((h, i) => i > activeHand && !h.done)
      if (nextIdx >= 0) { set({ activeHand: nextIdx }); return }
    }
    get().dealerPlay()
  },

  double: () => {
    const { deck, playerHand, betAmount, splitHands, activeHand } = get()
    const gs = useGameStore.getState()
    const cost = splitHands.length > 0 ? splitHands[activeHand].bet : betAmount
    if (gs.balance < cost) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }

    useGameStore.setState({ balance: gs.balance - cost })
    let d = [...deck]
    const { card, deck: newDeck } = dealCard(d)
    d = newDeck

    if (splitHands.length > 0) {
      const hand = { ...splitHands[activeHand] }
      hand.cards.push(card); hand.bet += cost; hand.done = true
      const newHands = [...splitHands]
      newHands[activeHand] = hand
      set({ deck: d, splitHands: newHands })
      get().stand()
    } else {
      const newHand = [...playerHand, card]
      set({ deck: d, playerHand: newHand, betAmount: betAmount + cost })
      setTimeout(() => get().stand(), 300)
    }
  },

  split: () => {
    const { deck, playerHand, betAmount } = get()
    const gs = useGameStore.getState()
    if (gs.balance < betAmount) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }

    useGameStore.setState({ balance: gs.balance - betAmount })
    let d = [...deck]
    const { card: c1, deck: d1 } = dealCard(d)
    const { card: c2, deck: d2 } = dealCard(d1)
    d = d2

    set({
      deck: d, playerHand: [],
      splitHands: [
        { cards: [playerHand[0], c1], bet: betAmount, done: false, result: null, payout: 0 },
        { cards: [playerHand[1], c2], bet: betAmount, done: false, result: null, payout: 0 },
      ],
      activeHand: 0,
    })
  },

  insurance: (take) => {
    const { betAmount } = get()
    if (take) {
      const cost = Math.round(betAmount / 2)
      const gs = useGameStore.getState()
      if (gs.balance < cost) { useUIStore.getState().addNotification('Saldo insuficiente', 'info'); return }
      useGameStore.setState({ balance: gs.balance - cost })
      set({ insuranceBet: cost, phase: 'playing' })
    } else {
      set({ phase: 'playing' })
    }

    const { dealerHand, playerHand } = get()
    const dEval = evaluateHand([dealerHand[0], { ...dealerHand[1], hidden: false }])
    if (dEval.isBlackjack) {
      set({ dealerHand: dealerHand.map(c => ({ ...c, hidden: false })) })
      get().resolve()
      return
    }

    const pEval = evaluateHand(playerHand)
    if (pEval.isBlackjack) setTimeout(() => get().stand(), 400)
  },

  dealerPlay: () => {
    set({ phase: 'dealer_turn' })
    const { dealerHand } = get()
    let cards = dealerHand.map(c => ({ ...c, hidden: false }))
    let evalu = evaluateHand(cards)

    while (evalu.value < 17) {
      const { card, deck: newDeck } = dealCard(get().deck)
      cards.push(card)
      set({ deck: newDeck })
      evalu = evaluateHand(cards)
    }

    set({ dealerHand: cards, phase: 'result' })
    setTimeout(() => get().resolve(), 500)
  },

  resolve: () => {
    const { playerHand, dealerHand, betAmount, insuranceBet, splitHands } = get()
    const gs = useGameStore.getState()
    const pEval = evaluateHand(playerHand)
    const dEval = evaluateHand(dealerHand)
    let totalPayout = 0
    let lines: string[] = []

    if (insuranceBet > 0) {
      if (dEval.isBlackjack) { totalPayout += insuranceBet * 2; lines.push(`Seguro: +$${insuranceBet * 2}`) }
      else { lines.push(`Seguro: -$${insuranceBet}`) }
    }

    if (splitHands.length > 0) {
      for (let i = 0; i < splitHands.length; i++) {
        const hand = splitHands[i]
        const hEval = evaluateHand(hand.cards)
        let pay = 0
        if (hEval.isBusted) { pay = -hand.bet; lines.push(`Mano ${i + 1}: Perdió -$${hand.bet}`) }
        else if (dEval.isBusted) { pay = hand.bet; lines.push(`Mano ${i + 1}: Ganó +$${hand.bet}`) }
        else if (hEval.value > dEval.value) { pay = hand.bet; lines.push(`Mano ${i + 1}: Ganó +$${hand.bet}`) }
        else if (hEval.value === dEval.value) { lines.push(`Mano ${i + 1}: Empuje $0`) }
        else { pay = -hand.bet; lines.push(`Mano ${i + 1}: Perdió -$${hand.bet}`) }
        totalPayout += pay
      }
    } else {
      if (pEval.isBusted) { totalPayout -= betAmount; lines.push(`Perdió -$${betAmount}`) }
      else if (dEval.isBusted) { const pay = pEval.isBlackjack ? Math.round(betAmount * 1.5) : betAmount; totalPayout += pay; lines.push(`Ganó +$${pay}`) }
      else if (pEval.isBlackjack && !dEval.isBlackjack) { const pay = Math.round(betAmount * 1.5); totalPayout += pay; lines.push(`Blackjack! +$${pay}`) }
      else if (dEval.isBlackjack && !pEval.isBlackjack) { totalPayout -= betAmount; lines.push(`Perdió -$${betAmount}`) }
      else if (pEval.value > dEval.value) { totalPayout += betAmount; lines.push(`Ganó +$${betAmount}`) }
      else if (pEval.value === dEval.value) { lines.push(`Empuje $0`) }
      else { totalPayout -= betAmount; lines.push(`Perdió -$${betAmount}`) }
    }

    if (totalPayout > 0) {
      useGameStore.setState({ balance: gs.balance + totalPayout })
      useAuthStore.getState().updateProfile({ balance: gs.balance + totalPayout })
      soundManager.play('win')
      useProgressionStore.getState().awardXP(Math.max(5, Math.floor(totalPayout / 20)))
      useProgressionStore.getState().checkAchievements()
    } else if (totalPayout < 0) {
      soundManager.play('click')
    }

    // Update blackjack missions
    useProgressionStore.getState().dailyMissions.forEach(m => {
      if (m.id.startsWith('blackjack') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
      if (m.id.startsWith('win') && totalPayout > 0 && !m.completed) useProgressionStore.getState().updateMission(m.id, totalPayout)
      if (m.id.startsWith('spin') && !m.completed) useProgressionStore.getState().updateMission(m.id, 1)
    })

    set({ phase: 'result', totalPayout, result: lines.join(' · ') })
  },

  newGame: () => {
    set({ deck: [], playerHand: [], dealerHand: [], splitHands: [], activeHand: 0, insuranceBet: 0, phase: 'bet', result: '', totalPayout: 0 })
  },
}))
