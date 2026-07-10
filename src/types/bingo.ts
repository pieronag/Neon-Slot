export interface BingoCard {
  id: number
  columns: number[][]  // 5 columns x 3 rows, col[0]=B(1-18), col[1]=I(19-36), etc.
  marked: boolean[][]  // same shape, tracks which are daubed
}

export interface BingoPattern {
  id: string
  name: string
  payout: number
  // checks if the card satisfies this pattern
  check: (marked: boolean[][]) => boolean
}

export interface ExtraOption {
  number: number
  potentialWin: number  // total payout × bet if this number is drawn
  cost: number          // potentialWin * 0.4
  completedPatterns: { cardIndex: number; patternId: string }[]
}

export interface CompletedPattern {
  cardIndex: number
  patternId: string
  patternName: string
  payout: number
}

export const COLORS = {
  B: '#3b82f6',
  I: '#ef4444',
  N: '#eab308',
  G: '#22c55e',
  O: '#f97316',
} as const

export const COL_RANGES = [
  { min: 1, max: 18 },   // B
  { min: 19, max: 36 },  // I
  { min: 37, max: 54 },  // N
  { min: 55, max: 72 },  // G
  { min: 73, max: 90 },  // O
]
