import { calculateWins } from './winCalculator'
import { getReelCount, getRowCount } from './reels'
import type { SpinResult } from '../types/game'

const POOL = [
  { symbol: 'diamond', weight: 1 },
  { symbol: 'seven', weight: 2 },
  { symbol: 'bell', weight: 3 },
  { symbol: 'star', weight: 8 },
  { symbol: 'heart', weight: 12 },
  { symbol: 'crown', weight: 16 },
  { symbol: 'coin', weight: 22 },
  { symbol: 'wild', weight: 1 },
  { symbol: 'scatter', weight: 2 },
]

function pickWeighted(pool: { symbol: string; weight: number }[]): string {
  const total = pool.reduce((a, b) => a + b.weight, 0)
  let r = Math.random() * total
  for (const p of pool) {
    r -= p.weight
    if (r <= 0) return p.symbol
  }
  return pool[0].symbol
}

export function spin(
  betAmount: number,
  freeSpin: boolean = false,
  multiplier: number = 1,
  streak: number = 0
): SpinResult {
  const boost = Math.min(streak * 0.06, 0.4)
  const reels: string[][] = []

  for (let r = 0; r < getReelCount(); r++) {
    const col: string[] = []
    for (let row = 0; row < getRowCount(); row++) {
      const pool = POOL.map(p => ({
        ...p,
        weight: (p.symbol === 'coin' || p.symbol === 'heart' || p.symbol === 'crown')
          ? p.weight * (1 + boost) : p.weight,
      }))
      col.push(pickWeighted(pool))
    }
    reels.push(col)
  }

  return calculateWins(reels, betAmount, freeSpin || multiplier > 1, multiplier, freeSpin, null, freeSpin)
}
