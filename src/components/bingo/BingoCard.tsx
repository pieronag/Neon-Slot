import { COLORS } from '../../types/bingo'
import type { BingoCard as BingoCardType } from '../../types/bingo'

const COLS = ['B', 'I', 'N', 'G', 'O']

export function BingoCard({ card, compact }: {
  card: BingoCardType
  compact?: boolean
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

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
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
          return (
            <div key={i} className="flex items-center justify-center"
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
              ) : (
                <span className="font-mono font-semibold" style={{ color: '#1a1a2e', fontSize: numSize }}>{cell.num}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
