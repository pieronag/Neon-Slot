export interface Bet {
  id: string
  type: BetType
  numbers: number[]
  amount: number
  label: string
  payout: number
}

export type BetType =
  | 'straight' | 'split' | 'street' | 'corner' | 'line'
  | 'dozen' | 'column'
  | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high'

export const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

export const DOZEN_LABELS = ['1-12', '13-24', '25-36']
export const COLUMN_LABELS = ['2-35', '1-34', '3-36']

export function getColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green'
  return REDS.includes(n) ? 'red' : 'black'
}

export const BET_PAYOUTS: Record<BetType, number> = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  line: 5,
  dozen: 2,
  column: 2,
  red: 1,
  black: 1,
  even: 1,
  odd: 1,
  low: 1,
  high: 1,
}

export function calcWin(bets: Bet[], winner: number): { totalPayout: number; wonBets: Bet[] } {
  let totalPayout = 0
  const wonBets: Bet[] = []
  const color = getColor(winner)
  const isEven = winner !== 0 && winner % 2 === 0
  const isOdd = winner !== 0 && winner % 2 !== 0
  const isLow = winner >= 1 && winner <= 18
  const isHigh = winner >= 19 && winner <= 36
  const isRed = color === 'red'
  const isBlack = color === 'black'

  for (const bet of bets) {
    let win = false
    switch (bet.type) {
      case 'straight': win = bet.numbers.includes(winner); break
      case 'split': win = bet.numbers.includes(winner); break
      case 'street': win = bet.numbers.includes(winner); break
      case 'corner': win = bet.numbers.includes(winner); break
      case 'line': win = bet.numbers.includes(winner); break
      case 'dozen': win = bet.numbers.includes(winner); break
      case 'column': win = bet.numbers.includes(winner); break
      case 'red': win = isRed; break
      case 'black': win = isBlack; break
      case 'even': win = isEven; break
      case 'odd': win = isOdd; break
      case 'low': win = isLow; break
      case 'high': win = isHigh; break
    }
    if (win) {
      const payout = bet.amount + bet.amount * BET_PAYOUTS[bet.type]
      totalPayout += payout
      wonBets.push({ ...bet, payout })
    }
  }
  return { totalPayout, wonBets }
}
