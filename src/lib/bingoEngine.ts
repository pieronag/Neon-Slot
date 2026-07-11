import type { BingoCard, ExtraOption, CompletedPattern, MissingHighlight } from '../types/bingo'
import { COL_RANGES } from '../types/bingo'
import { PATTERNS, COMBO_BONUSES } from './bingoPatterns'

export function generateCard(id: number): BingoCard {
  const columns: number[][] = []
  const marked: boolean[][] = []
  for (let c = 0; c < 5; c++) {
    const { min, max } = COL_RANGES[c]
    const col: number[] = []
    const used = new Set<number>()
    while (col.length < 3) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min
      if (!used.has(n)) {
        used.add(n)
        col.push(n)
      }
    }
    col.sort((a, b) => a - b)
    columns.push(col)
    marked.push([false, false, false])
  }
  return { id, columns, marked }
}

export function generateCards(count: number): BingoCard[] {
  return Array.from({ length: count }, (_, i) => generateCard(i))
}

export function checkPatterns(cards: BingoCard[], betAmount: number): CompletedPattern[] {
  const completed: CompletedPattern[] = []
  for (let ci = 0; ci < cards.length; ci++) {
    for (const p of PATTERNS) {
      if (p.check(cards[ci].marked)) {
        completed.push({ cardIndex: ci, patternId: p.id, patternName: p.name, payout: p.payout * betAmount })
      }
    }
  }
  // Add combo bonuses per card
  for (let ci = 0; ci < cards.length; ci++) {
    const cardPatternIds = completed.filter(cp => cp.cardIndex === ci).map(cp => cp.patternId)
    for (const combo of COMBO_BONUSES) {
      if (combo.patterns.every(p => cardPatternIds.includes(p))) {
        if (!completed.find(cp => cp.cardIndex === ci && cp.patternId === `combo_${combo.name}`)) {
          completed.push({ cardIndex: ci, patternId: `combo_${combo.name}`, patternName: `✨ ${combo.name}`, payout: combo.bonus * betAmount })
        }
      }
    }
  }
  return completed
}

export function calcExtraOptions(cards: BingoCard[], called: Set<number>, betAmount: number): ExtraOption[] {
  const remaining: number[] = []
  for (let n = 1; n <= 90; n++) {
    if (!called.has(n)) remaining.push(n)
  }

  const options: ExtraOption[] = []
  for (const n of remaining) {
    let potentialWin = 0
    const completedPatterns: { cardIndex: number; patternId: string }[] = []
    for (let ci = 0; ci < cards.length; ci++) {
      const card = cards[ci]
      const pos = findNumberPosition(card, n)
      if (!pos) continue
      const [col, row] = pos
      if (card.marked[col][row]) continue

      const testMarked = card.marked.map((colArr, ci2) => colArr.map((v, ri) => v || (ci2 === col && ri === row)))
      for (const p of PATTERNS) {
        if (!completedPatterns.find(cp => cp.cardIndex === ci && cp.patternId === p.id) && p.check(testMarked)) {
          potentialWin += p.payout * betAmount
          completedPatterns.push({ cardIndex: ci, patternId: p.id })
        }
      }
    }
    if (completedPatterns.length > 0) {
      options.push({
        number: n,
        potentialWin,
        cost: Math.round(potentialWin * 0.4),
        completedPatterns,
      })
    }
  }
  options.sort((a, b) => b.potentialWin - a.potentialWin)
  return options.slice(0, 10)
}

export function pickRandomExtra(options: ExtraOption[]): ExtraOption | null {
  if (options.length === 0) return null
  return options[Math.floor(Math.random() * options.length)]
}

export function countExtraChances(cards: BingoCard[], called: Set<number>): number {
  let chances = 0
  for (let n = 1; n <= 90; n++) {
    if (called.has(n)) continue
    for (const card of cards) {
      const pos = findNumberPosition(card, n)
      if (!pos) continue
      const [col, row] = pos
      if (card.marked[col][row]) continue
      const testMarked = card.marked.map((colArr, ci2) => colArr.map((v, ri) => v || (ci2 === col && ri === row)))
      for (const p of PATTERNS) {
        if (p.check(testMarked)) { chances++; break }
      }
      break
    }
  }
  return chances
}

export function getMissingHighlights(cards: BingoCard[]): MissingHighlight[][] {
  return cards.map(card => {
    const highlightsMap = new Map<string, MissingHighlight>()
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (card.marked[col][row]) continue
        const testMarked = card.marked.map((colArr, ci) => colArr.map((v, ri) => v || (ci === col && ri === row)))
        let totalPayout = 0
        for (const p of PATTERNS) {
          if (p.check(testMarked)) {
            totalPayout += p.payout
          }
        }
        if (totalPayout > 0) {
          const key = `${col}-${row}`
          if (!highlightsMap.has(key)) {
            highlightsMap.set(key, { col, row, number: card.columns[col][row], payout: totalPayout })
          }
        }
      }
    }
    return Array.from(highlightsMap.values())
  })
}

function findNumberPosition(card: BingoCard, num: number): [number, number] | null {
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 3; r++) {
      if (card.columns[c][r] === num) return [c, r]
    }
  }
  return null
}
