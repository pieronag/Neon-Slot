import type { SpinResult } from '../types/game'
import { WILD_ID, SCATTER_ID, getSymbol, SYMBOLS } from './symbols'
import { getPaylines } from './paylines'
import { getReelCount, getRowCount } from './reels'

const POOL_AVALANCHE = SYMBOLS
  .filter(s => !s.isWild && !s.isScatter)
  .flatMap(s => Array(s.id === 'diamond' ? 1 : s.id === 'seven' ? 2 : s.id === 'bell' ? 3 : s.id === 'star' ? 5 : s.id === 'heart' ? 7 : s.id === 'crown' ? 9 : 12).fill(s.id))

function randSymbol() {
  return POOL_AVALANCHE[Math.floor(Math.random() * POOL_AVALANCHE.length)]
}

function calcWinsOnReels(
  reels: string[][],
  betAmount: number,
  multiplier: number,
  expandingWild: string | null
): { wins: SpinResult['wins']; totalPayout: number; scatterCount: number; winningPositions: Set<string>; bonusTriggered: boolean; bonusMultiplier: number } {
  const paylines = getPaylines()
  const wins: SpinResult['wins'] = []
  let totalPayout = 0
  let scatterCount = 0
  const winningPositions = new Set<string>()

  const workingReels = expandingWild
    ? reels.map(col => col.map(s => s === expandingWild ? WILD_ID : s))
    : reels.map(col => [...col])

  for (let row = 0; row < getRowCount(); row++) {
    for (let reel = 0; reel < getReelCount(); reel++) {
      if (workingReels[reel]?.[row] === SCATTER_ID) scatterCount++
    }
  }

  for (const line of paylines) {
    const syms = line.positions.map(p => workingReels[p.reel]?.[p.row] ?? '')
    const nonWild = syms.filter(s => s !== WILD_ID)
    if (nonWild.length === 0) continue

    const firstReal = nonWild[0]
    let count = 0
    for (const s of syms) {
      if (s === WILD_ID || s === firstReal) count++
      else break
    }

    if (count >= 3) {
      const symbol = getSymbol(firstReal)
      if (!symbol.isScatter) {
        const idx = Math.min(count - 1, symbol.payouts.length - 1)
        let payout = (symbol.payouts[idx] ?? 0) * (betAmount / 80) * multiplier
        if (payout > 0) {
          const positions = line.positions.slice(0, count)
          wins.push({ paylineId: line.id, symbolId: firstReal, count, payout, positions })
          totalPayout += payout
          positions.forEach(p => winningPositions.add(`${p.reel}-${p.row}`))
        }
      }
    }
  }

  let bonusTriggered = false
  let bonusMultiplier = 1

  if (scatterCount >= 3) {
    const s = getSymbol(SCATTER_ID)
    const idx = Math.min(scatterCount - 1, s.payouts.length - 1)
    const payout = (s.payouts[idx] ?? 0) * (betAmount / 80) * multiplier
    totalPayout += payout
    wins.push({ paylineId: -1, symbolId: SCATTER_ID, count: scatterCount, payout, positions: [] })
    bonusTriggered = true
    bonusMultiplier = scatterCount >= 5 ? 10 : scatterCount >= 4 ? 5 : 2
  }

  return { wins, totalPayout, scatterCount, winningPositions, bonusTriggered, bonusMultiplier }
}

function applyAvalanche(reels: string[][]): string[][] {
  const newReels: string[][] = []
  for (let c = 0; c < getReelCount(); c++) {
    const col = reels[c].filter(s => s !== null && s !== 'REMOVED')
    const removedCount = getRowCount() - col.length
    const newSymbols = Array.from({ length: removedCount }, () => randSymbol())
    newReels.push([...newSymbols, ...col])
  }
  return newReels
}

export function calculateWins(
  reelsResult: string[][],
  betAmount: number,
  useMultiplier: boolean = false,
  multiplierValue: number = 1,
  isFreeSpin: boolean = false,
  expandingWild: string | null = null,
  enableAvalanche: boolean = false
): SpinResult {
  const mult = useMultiplier ? multiplierValue : 1

  let wild = expandingWild
  if (isFreeSpin && !wild) {
    const symbols = SYMBOLS.filter(s => !s.isWild && !s.isScatter && s.id !== 'coin')
    wild = symbols[Math.floor(Math.random() * symbols.length)].id
  }

  let currentReels = reelsResult.map(col => [...col])
  const allWins: SpinResult['wins'] = []
  let totalPayout = 0
  let avalancheCount = 0
  let bonusTriggered = false
  let bonusMultiplier = 1
  let scatterTotal = 0

  while (true) {
    const result = calcWinsOnReels(currentReels, betAmount, mult, wild)

    if (result.wins.length > 0) {
      allWins.push(...result.wins)
      totalPayout += result.totalPayout
      scatterTotal += result.scatterCount
      if (result.bonusTriggered) { bonusTriggered = true; bonusMultiplier = result.bonusMultiplier }
    }

    if (enableAvalanche && result.winningPositions.size > 0) {
      const newReels = currentReels.map(col => [...col])
      let anyRemoved = false
      for (const key of result.winningPositions) {
        const [r, row] = key.split('-').map(Number)
        if (newReels[r] && newReels[r][row] !== WILD_ID) {
          newReels[r][row] = null as any
          anyRemoved = true
        }
      }
      if (anyRemoved) {
        currentReels = applyAvalanche(newReels)
        avalancheCount++
        continue
      }
    }
    break
  }

  const finalPayout = bonusTriggered ? Math.round(totalPayout * bonusMultiplier) : Math.round(totalPayout)

  return {
    reels: currentReels,
    wins: allWins,
    totalPayout: finalPayout,
    bonusTriggered,
    scatterCount: scatterTotal,
    bonusMultiplier: bonusTriggered ? bonusMultiplier : 1,
    multiplier: mult,
    expandingWild: wild,
    avalancheCount,
    avalancheWins: [],
  }
}
