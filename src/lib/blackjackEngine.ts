import { SUITS, RANKS, type Card, type HandResult } from '../types/blackjack'

const DECKS = 6

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (let d = 0; d < DECKS; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, value: cardValue(rank), hidden: false })
      }
    }
  }
  return deck
}

export function shuffle(deck: Card[]): Card[] {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

export function dealCard(deck: Card[], hidden = false): { card: Card; deck: Card[] } {
  const d = [...deck]
  const card = { ...d.pop()!, hidden }
  return { card, deck: d }
}

function cardValue(rank: string): number {
  if (rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(rank)) return 10
  return parseInt(rank)
}

export function evaluateHand(cards: Card[]): HandResult {
  let value = cards.reduce((s, c) => s + (c.hidden ? 0 : c.value), 0)
  let aces = cards.filter(c => c.rank === 'A' && !c.hidden).length
  let soft = aces > 0 && value <= 21
  while (value > 21 && aces > 0) { value -= 10; aces-- }
  const nonHidden = cards.filter(c => !c.hidden)
  return {
    cards,
    value,
    isBlackjack: nonHidden.length === 2 && value === 21,
    isBusted: value > 21,
    isSoft: soft && value <= 21,
  }
}

export function canSplit(cards: Card[]): boolean {
  return cards.length === 2 && cards[0].rank === cards[1].rank
}

export function canDouble(cards: Card[]): boolean {
  return cards.length === 2
}

export function formatHand(hand: HandResult): string {
  if (hand.isBlackjack) return 'Blackjack!'
  if (hand.isBusted) return `Pasado (${hand.value})`
  if (hand.isSoft) return `${hand.value - 10} / ${hand.value}`
  return hand.value.toString()
}
