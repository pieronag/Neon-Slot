import { useBingoStore } from '../../store/bingoStore'
import { COLORS } from '../../types/bingo'
import { useIsMobile } from '../../hooks/useIsMobile'

const COLS = ['B', 'I', 'N', 'G', 'O']

export function BingoBallDisplay() {
  const calledNumbers = useBingoStore(s => s.calledNumbers)
  const last = calledNumbers[calledNumbers.length - 1]
  const isMobile = useIsMobile()

  const getColIndex = (n: number) => {
    if (n <= 18) return 0
    if (n <= 36) return 1
    if (n <= 54) return 2
    if (n <= 72) return 3
    return 4
  }

  if (isMobile) {
    return (
      <div className="rounded-xl p-2" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm font-mono text-white"
            style={{
              background: COLORS[COLS[getColIndex(last)] as keyof typeof COLORS],
              border: `1.5px solid ${COLORS[COLS[getColIndex(last)] as keyof typeof COLORS]}cc`,
              boxShadow: `0 0 8px ${COLORS[COLS[getColIndex(last)] as keyof typeof COLORS]}55`,
            }}>
            {last}
          </div>
          <div>
            <div className="text-[9px] text-white/40">Último</div>
            <div className="text-sm font-bold text-white font-mono">{COLS[getColIndex(last)]}-{last}</div>
          </div>
          <div className="ml-auto text-[9px] text-white/30">{calledNumbers.length}/90</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {calledNumbers.map((n, i) => {
            const ci = getColIndex(n)
            const isRecent = i >= calledNumbers.length - 5
            return (
              <div key={n}
                className={`rounded-full flex items-center justify-center font-bold font-mono text-white transition-all ${isRecent ? 'scale-110' : ''}`}
                style={{
                  width: '22px',
                  height: '22px',
                  background: COLORS[COLS[ci] as keyof typeof COLORS],
                  fontSize: '9px',
                  boxShadow: isRecent ? `0 0 6px ${COLORS[COLS[ci] as keyof typeof COLORS]}66` : 'none',
                }}
              >
                {n}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-4" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl font-mono text-white"
          style={{
            background: COLORS[COLS[getColIndex(last)] as keyof typeof COLORS],
            border: `2px solid ${COLORS[COLS[getColIndex(last)] as keyof typeof COLORS]}cc`,
            boxShadow: `0 0 12px ${COLORS[COLS[getColIndex(last)] as keyof typeof COLORS]}55`,
          }}>
          {last}
        </div>
        <div>
          <div className="text-xs text-white/40">Último número</div>
          <div className="text-xl font-bold text-white font-mono">{COLS[getColIndex(last)]}-{last}</div>
        </div>
        <div className="ml-auto text-[11px] text-white/30">{calledNumbers.length}/90</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {calledNumbers.map((n, i) => {
          const ci = getColIndex(n)
          const isRecent = i >= calledNumbers.length - 5
          return (
            <div key={n}
              className={`rounded-full flex items-center justify-center font-bold font-mono text-white transition-all ${isRecent ? 'scale-110' : ''}`}
              style={{
                width: '30px',
                height: '30px',
                background: COLORS[COLS[ci] as keyof typeof COLORS],
                fontSize: '12px',
                boxShadow: isRecent ? `0 0 8px ${COLORS[COLS[ci] as keyof typeof COLORS]}66` : 'none',
              }}
            >
              {n}
            </div>
          )
        })}
      </div>
    </div>
  )
}
