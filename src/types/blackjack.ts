export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type GamePhase = 'bet' | 'playing' | 'insurance' | 'dealer_turn' | 'result'

export interface Card {
  suit: Suit
  rank: string
  value: number
  hidden: boolean
}

export interface HandResult {
  cards: Card[]
  value: number
  isBlackjack: boolean
  isBusted: boolean
  isSoft: boolean
}

export interface SplitHand {
  cards: Card[]
  bet: number
  done: boolean
  result: 'win' | 'loss' | 'push' | 'blackjack' | 'bust' | null
  payout: number
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
}
