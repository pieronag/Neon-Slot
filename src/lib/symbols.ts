import type { SymbolType } from '../types/game'

export const SYMBOLS: SymbolType[] = [
  { id: 'diamond', name: 'Diamond', icon: 'diamond', color: '#00e5ff', payouts: [0, 0, 80, 400, 2500] },
  { id: 'seven', name: 'Seven', icon: 'seven', color: '#b537f2', payouts: [0, 0, 50, 250, 1200] },
  { id: 'bell', name: 'Bell', icon: 'bell', color: '#ffd700', payouts: [0, 0, 35, 150, 600] },
  { id: 'star', name: 'Star', icon: 'star', color: '#ff6b35', payouts: [0, 0, 25, 100, 400] },
  { id: 'heart', name: 'Heart', icon: 'heart', color: '#ff3366', payouts: [0, 0, 18, 70, 250] },
  { id: 'crown', name: 'Crown', icon: 'crown', color: '#ffd700', payouts: [0, 0, 12, 45, 150] },
  { id: 'coin', name: 'Coin', icon: 'coin', color: '#00ff88', payouts: [0, 0, 8, 30, 100] },
  { id: 'wild', name: 'Wild', icon: 'wild', color: '#ffffff', payouts: [0, 0, 0, 0, 0], isWild: true },
  { id: 'scatter', name: 'Scatter', icon: 'scatter', color: '#ff6b35', payouts: [0, 0, 15, 60, 250], isScatter: true },
]

export const WILD_ID = 'wild'
export const SCATTER_ID = 'scatter'

export function getSymbol(id: string): SymbolType {
  return SYMBOLS.find(s => s.id === id) ?? SYMBOLS[0]
}
