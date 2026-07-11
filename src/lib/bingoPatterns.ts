import type { BingoPattern } from '../types/bingo'

const c = (m: boolean[][], col: number, row: number) => m[col][row]

function rowFull(m: boolean[][], row: number) {
  return c(m, 0, row) && c(m, 1, row) && c(m, 2, row) && c(m, 3, row) && c(m, 4, row)
}

export const PATTERNS: BingoPattern[] = [
  { id: 'one_row', name: '1 Fila', payout: 3, check: (m) => rowFull(m, 0) || rowFull(m, 1) || rowFull(m, 2) },
  { id: 'two_rows', name: '2 Filas', payout: 8, check: (m) => [rowFull(m, 0), rowFull(m, 1), rowFull(m, 2)].filter(Boolean).length >= 2 },
  { id: 'four_corners', name: '4 Esquinas', payout: 6, check: (m) => c(m, 0, 0) && c(m, 4, 0) && c(m, 0, 2) && c(m, 4, 2) },
  { id: 'x_diag', name: 'X', payout: 10, check: (m) => c(m, 1, 0) && c(m, 3, 0) && c(m, 2, 1) && c(m, 1, 2) && c(m, 3, 2) },
  { id: 'diamond', name: 'Diamante', payout: 14, check: (m) => c(m, 1, 0) && c(m, 3, 0) && c(m, 0, 1) && c(m, 4, 1) && c(m, 1, 2) && c(m, 3, 2) },
  { id: 'v_shape', name: 'V', payout: 12, check: (m) => c(m, 0, 0) && c(m, 2, 0) && c(m, 1, 1) && c(m, 3, 1) && c(m, 2, 2) },
  { id: 't_shape', name: 'T', payout: 14, check: (m) => c(m, 0, 0) && c(m, 1, 0) && c(m, 2, 0) && c(m, 3, 0) && c(m, 4, 0) && c(m, 2, 1) && c(m, 2, 2) },
  { id: 'snake', name: 'Serpiente', payout: 14, check: (m) => c(m, 0, 0) && c(m, 1, 1) && c(m, 2, 1) && c(m, 3, 1) && c(m, 4, 2) },
  { id: 'triangle', name: 'Triángulo', payout: 16, check: (m) => c(m, 2, 0) && c(m, 1, 1) && c(m, 3, 1) && c(m, 0, 2) && c(m, 1, 2) && c(m, 2, 2) && c(m, 3, 2) && c(m, 4, 2) },
  { id: 'bowtie', name: 'Corbata', payout: 16, check: (m) => c(m, 0, 0) && c(m, 2, 0) && c(m, 4, 0) && c(m, 0, 1) && c(m, 1, 1) && c(m, 3, 1) && c(m, 4, 1) && c(m, 0, 2) && c(m, 2, 2) && c(m, 4, 2) },
  { id: 'w_shape', name: 'W', payout: 18, check: (m) => c(m, 0, 0) && c(m, 4, 0) && c(m, 0, 1) && c(m, 2, 1) && c(m, 4, 1) && c(m, 0, 2) && c(m, 1, 2) && c(m, 3, 2) && c(m, 4, 2) },
  { id: 'hourglass', name: 'Reloj Arena', payout: 18, check: (m) => c(m, 2, 0) && c(m, 1, 1) && c(m, 2, 1) && c(m, 3, 1) && c(m, 2, 2) },
  { id: 'cross', name: 'Cruz', payout: 20, check: (m) => c(m, 2, 0) && c(m, 0, 1) && c(m, 1, 1) && c(m, 2, 1) && c(m, 3, 1) && c(m, 4, 1) && c(m, 2, 2) },
  { id: 'm_shape', name: 'M', payout: 22, check: (m) => c(m, 0, 0) && c(m, 4, 0) && c(m, 0, 1) && c(m, 1, 1) && c(m, 3, 1) && c(m, 4, 1) && c(m, 0, 2) && c(m, 2, 2) && c(m, 4, 2) },
  { id: 'frame', name: 'Marco', payout: 25, check: (m) => rowFull(m, 0) && rowFull(m, 2) && c(m, 0, 1) && c(m, 4, 1) },
  { id: 'full_card', name: 'Cartón Lleno', payout: 50, check: (m) => { for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) if (!m[c][r]) return false; return true } },
]

export const COMBO_BONUSES: { name: string; patterns: string[]; bonus: number }[] = [
  { name: 'Doble Fila', patterns: ['one_row', 'two_rows'], bonus: 3 },
  { name: 'Triple Fila', patterns: ['one_row', 'two_rows', 't_shape'], bonus: 10 },
  { name: 'Equis Completa', patterns: ['x_diag', 'cross'], bonus: 6 },
  { name: 'Marco + Centro', patterns: ['frame', 'diamond'], bonus: 10 },
  { name: 'Gran V', patterns: ['v_shape', 'triangle'], bonus: 6 },
  { name: 'Bingo Total', patterns: ['full_card', 'frame', 'two_rows'], bonus: 30 },
]
