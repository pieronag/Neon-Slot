import type { BingoPattern } from '../types/bingo'

// Helper: check positions marked on a 5x3 grid (marked[col][row])
const c = (m: boolean[][], col: number, row: number) => m[col][row]

function rowFull(m: boolean[][], row: number) {
  return c(m, 0, row) && c(m, 1, row) && c(m, 2, row) && c(m, 3, row) && c(m, 4, row)
}

export const PATTERNS: BingoPattern[] = [
  {
    id: 'one_row',
    name: '1 Fila',
    payout: 2,
    check: (m) => rowFull(m, 0) || rowFull(m, 1) || rowFull(m, 2),
  },
  {
    id: 'two_rows',
    name: '2 Filas',
    payout: 5,
    check: (m) => [rowFull(m, 0), rowFull(m, 1), rowFull(m, 2)].filter(Boolean).length >= 2,
  },
  {
    id: 'v_shape',
    name: 'V',
    payout: 10,
    check: (m) => c(m, 0, 0) && c(m, 2, 0) && c(m, 1, 1) && c(m, 3, 1) && c(m, 2, 2),
  },
  {
    id: 'triangle',
    name: 'Triángulo',
    payout: 12,
    check: (m) => c(m, 2, 0) && c(m, 1, 1) && c(m, 3, 1) &&
      c(m, 0, 2) && c(m, 1, 2) && c(m, 2, 2) && c(m, 3, 2) && c(m, 4, 2),
  },
  {
    id: 'cross',
    name: 'Cruz',
    payout: 15,
    check: (m) => c(m, 2, 0) && c(m, 0, 1) && c(m, 1, 1) && c(m, 2, 1) && c(m, 3, 1) && c(m, 4, 1) && c(m, 2, 2),
  },
  {
    id: 'bowtie',
    name: 'Corbata',
    payout: 12,
    check: (m) => c(m, 0, 0) && c(m, 2, 0) && c(m, 4, 0) &&
      c(m, 0, 1) && c(m, 1, 1) && c(m, 3, 1) && c(m, 4, 1) &&
      c(m, 0, 2) && c(m, 2, 2) && c(m, 4, 2),
  },
  {
    id: 'm_shape',
    name: 'M',
    payout: 18,
    check: (m) => c(m, 0, 0) && c(m, 4, 0) && c(m, 0, 1) && c(m, 1, 1) && c(m, 3, 1) && c(m, 4, 1) && c(m, 0, 2) && c(m, 2, 2) && c(m, 4, 2),
  },
  {
    id: 'x_diag',
    name: 'X',
    payout: 8,
    check: (m) => c(m, 1, 0) && c(m, 3, 0) && c(m, 2, 1) && c(m, 1, 2) && c(m, 3, 2),
  },
  {
    id: 'four_corners',
    name: '4 Esquinas',
    payout: 5,
    check: (m) => c(m, 0, 0) && c(m, 4, 0) && c(m, 0, 2) && c(m, 4, 2),
  },
  {
    id: 'frame',
    name: 'Marco',
    payout: 20,
    check: (m) => rowFull(m, 0) && rowFull(m, 2) && c(m, 0, 1) && c(m, 4, 1),
  },
  {
    id: 'x2_pattern',
    name: '2X',
    payout: 25,
    check: (m) => c(m, 0, 0) && c(m, 2, 0) && c(m, 4, 0) &&
      c(m, 1, 1) && c(m, 3, 1) &&
      c(m, 0, 2) && c(m, 2, 2) && c(m, 4, 2),
  },
  {
    id: 'full_card',
    name: 'Cartón Lleno',
    payout: 50,
    check: (m) => {
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 3; r++)
          if (!m[c][r]) return false
      return true
    },
  },
]
