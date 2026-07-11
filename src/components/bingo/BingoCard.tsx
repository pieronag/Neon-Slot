import { COLORS } from '../../types/bingo'
import type { BingoCard as BingoCardType, MissingHighlight } from '../../types/bingo'

const COLS = ['B', 'I', 'N', 'G', 'O']

// Pattern line definitions: each segment connects cells that form a continuous line
// Segments are drawn as SVG paths connecting cell centers
const PATTERN_LINES: Record<string, { col: number; row: number }[][]> = {
  // 1 Fila: handled dynamically in PatternLines — only draws rows that are full
  one_row: [],
  two_rows: [],
  four_corners: [
    [{ col: 0, row: 0 }, { col: 4, row: 0 }, { col: 4, row: 2 }, { col: 0, row: 2 }, { col: 0, row: 0 }],
  ],
  x_diag: [
    [{ col: 1, row: 0 }, { col: 2, row: 1 }, { col: 3, row: 2 }],
    [{ col: 3, row: 0 }, { col: 2, row: 1 }, { col: 1, row: 2 }],
  ],
  diamond: [
    [{ col: 1, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 2 }],
    [{ col: 3, row: 0 }, { col: 4, row: 1 }, { col: 3, row: 2 }],
  ],
  v_shape: [
    [{ col: 0, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 2 }],
    [{ col: 2, row: 2 }, { col: 3, row: 1 }, { col: 2, row: 0 }],
  ],
  t_shape: [
    [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 }],
    [{ col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 }],
  ],
  snake: [
    [{ col: 0, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 2 }],
  ],
  triangle: [
    [{ col: 2, row: 0 }, { col: 1, row: 1 }, { col: 0, row: 2 }],
    [{ col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 }],
    [{ col: 4, row: 2 }, { col: 3, row: 1 }, { col: 2, row: 0 }],
  ],
  bowtie: [
    [{ col: 0, row: 0 }, { col: 2, row: 0 }, { col: 4, row: 0 }],
    [{ col: 4, row: 1 }, { col: 3, row: 1 }, { col: 1, row: 1 }, { col: 0, row: 1 }],
    [{ col: 0, row: 2 }, { col: 2, row: 2 }, { col: 4, row: 2 }],
  ],
  m_shape: [
    [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }],
    [{ col: 1, row: 1 }, { col: 2, row: 2 }, { col: 3, row: 1 }],
    [{ col: 3, row: 1 }, { col: 4, row: 1 }, { col: 4, row: 0 }],
    [{ col: 0, row: 2 }, { col: 2, row: 2 }, { col: 4, row: 2 }],
  ],
  frame: [
    [{ col: 0, row: 0 }, { col: 4, row: 0 }, { col: 4, row: 2 }, { col: 0, row: 2 }, { col: 0, row: 0 }],
    [{ col: 0, row: 1 }, { col: 4, row: 1 }],
  ],
  hourglass: [
    [{ col: 2, row: 0 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 2, row: 2 }],
  ],
  w_shape: [
    [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 2 }],
    [{ col: 1, row: 2 }, { col: 2, row: 1 }, { col: 3, row: 2 }],
    [{ col: 3, row: 2 }, { col: 4, row: 1 }, { col: 4, row: 0 }],
    [{ col: 0, row: 1 }, { col: 2, row: 1 }, { col: 4, row: 1 }],
  ],
  full_card: [
    [{ col: 0, row: 0 }, { col: 4, row: 0 }, { col: 4, row: 2 }, { col: 0, row: 2 }, { col: 0, row: 0 }],
  ],
}

function PatternLines({ completedPatterns, marked }: { completedPatterns: string[]; marked: boolean[][] }) {
  if (completedPatterns.length === 0) return null

  const rowFull = (row: number) => marked[0][row] && marked[1][row] && marked[2][row] && marked[3][row] && marked[4][row]

  const segments: { d: string; color: string }[] = []

  completedPatterns.forEach(pid => {
    // Row-based patterns: only draw completed rows
    if (pid === 'one_row' || pid === 'two_rows') {
      for (let r = 0; r < 3; r++) {
        if (rowFull(r)) {
          const x0 = 10, x1 = 90, y = 25 + (r + 0.5) * 25
          segments.push({ d: `M${x0} ${y}L${x1} ${y}`, color: COLORS[COLS[0] as keyof typeof COLORS] })
        }
      }
      return
    }

    const segs = PATTERN_LINES[pid]
    if (!segs) return
    const color = COLORS[COLS[segs[0][0].col] as keyof typeof COLORS]

    segs.forEach(pts => {
      if (pts.length < 2) return
      const d = pts.map((p, i) => {
        const x = (p.col + 0.5) / 5 * 100
        const y = 25 + (p.row + 0.5) * 25
        return `${i === 0 ? 'M' : 'L'}${x} ${y}`
      }).join(' ')
      segments.push({ d, color })
    })
  })

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      {segments.map((s, i) => (
        <path key={i} d={s.d} stroke={s.color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.15))' }} />
      ))}
    </svg>
  )
}

export function BingoCard({ card, compact, highlights = [], completedPatterns = [] }: {
  card: BingoCardType
  compact?: boolean
  highlights?: MissingHighlight[]
  completedPatterns?: string[]
}) {
  const rows: { num: number; col: number; row: number; marked: boolean }[][] = []
  for (let r = 0; r < 3; r++) {
    const row: { num: number; col: number; row: number; marked: boolean }[] = []
    for (let c = 0; c < 5; c++) {
      row.push({ num: card.columns[c][r], col: c, row: r, marked: card.marked[c][r] })
    }
    rows.push(row)
  }

  const cellH = compact ? 30 : 40
  const numSize = compact ? '13px' : '17px'

  const isHighlighted = (col: number, row: number) => highlights.some(h => h.col === col && h.row === row)

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
      <div className="grid grid-cols-5">
        {COLS.map((l) => (
          <div key={l} className="text-center font-bold py-2"
            style={{
              background: COLORS[l as keyof typeof COLORS],
              color: '#fff',
              fontSize: compact ? '12px' : '15px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}>{l}</div>
        ))}
        {rows.flat().map((cell, i) => {
          const color = COLORS[COLS[cell.col] as keyof typeof COLORS]
          const hl = isHighlighted(cell.col, cell.row)
          return (
            <div key={i} className="flex items-center justify-center relative"
              style={{
                border: '0.5px solid rgba(0,0,0,0.04)',
                background: '#fff',
                height: `${cellH}px`,
              }}
            >
              {cell.marked ? (
                <div className="flex items-center justify-center rounded-full"
                  style={{
                    width: `${compact ? 24 : 32}px`,
                    height: `${compact ? 24 : 32}px`,
                    background: color,
                    boxShadow: `0 0 6px ${color}55`,
                  }}
                >
                  <span className="font-bold font-mono" style={{ color: '#fff', fontSize: numSize }}>{cell.num}</span>
                </div>
              ) : hl ? (
                <div className="w-full h-full flex items-center justify-center relative"
                  style={{
                    background: `${color}22`,
                    boxShadow: `inset 0 0 14px ${color}55, 0 0 10px ${color}33`,
                    border: `2px solid ${color}`,
                    borderRadius: '4px',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}
                >
                  <span className="font-mono font-bold" style={{ color: '#000', fontSize: numSize }}>{cell.num}</span>
                  <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-[8px] font-bold font-mono rounded-sm px-0.5 leading-tight"
                    style={{ zIndex: 5 }}>
                    {highlights.find(h => h.col === cell.col && h.row === cell.row)?.payout || ''}×
                  </span>
                </div>
              ) : (
                <span className="font-mono font-semibold" style={{ color: '#1a1a2e', fontSize: numSize }}>{cell.num}</span>
              )}
            </div>
          )
        })}
      </div>
      <PatternLines completedPatterns={completedPatterns} marked={card.marked} />
    </div>
  )
}
