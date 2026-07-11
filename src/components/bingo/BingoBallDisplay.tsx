import { useMemo } from 'react'
import { useBingoStore } from '../../store/bingoStore'
import { COLORS } from '../../types/bingo'
import { useIsMobile } from '../../hooks/useIsMobile'

const COLS = ['B', 'I', 'N', 'G', 'O']

export function BingoBallDisplay() {
  const calledNumbers = useBingoStore(s => s.calledNumbers)
  const cards = useBingoStore(s => s.cards)
  const last = calledNumbers[calledNumbers.length - 1]
  const isMobile = useIsMobile()

  const getColIndex = (n: number) => {
    if (n <= 18) return 0; if (n <= 36) return 1; if (n <= 54) return 2; if (n <= 72) return 3; return 4
  }

  const cardCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const card of cards)
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 3; r++)
          counts.set(card.columns[c][r], (counts.get(card.columns[c][r]) || 0) + 1)
    return counts
  }, [cards])

  const ball = (n: number, size: number, fontSize: string, recent: boolean) => {
    const ci = getColIndex(n)
    const count = cardCounts.get(n) || 0
    const inCard = count > 0
    const bg = inCard ? COLORS[COLS[ci] as keyof typeof COLORS] : '#555'
    const shadow = inCard && recent ? `0 0 ${size === 30 ? '8px' : '6px'} ${COLORS[COLS[ci] as keyof typeof COLORS]}66` : 'none'
    return (
      <div key={n} className="relative inline-flex flex-shrink-0" style={{ width: `${size}px`, height: `${size}px`, margin: '2px' }}>
        <div className={`rounded-full flex items-center justify-center font-bold font-mono text-white transition-all ${recent ? 'scale-110' : ''}`}
          style={{ width: '100%', height: '100%', background: bg, fontSize, boxShadow: shadow }}>
          {n}
        </div>
        {count > 1 && (
          <span className="absolute -right-1 -bottom-0.5 bg-yellow-400 text-black text-[7px] font-bold font-mono rounded-full flex items-center justify-center z-10"
            style={{ width: '12px', height: '12px', lineHeight: '12px' }}>
            {count}
          </span>
        )}
      </div>
    )
  }

  const lastSection = (compact: boolean) => {
    const ci = getColIndex(last)
    const circleSize = compact ? 30 : 48
    const fontSize = compact ? '11px' : '16px'
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="rounded-full flex items-center justify-center font-bold font-mono text-white flex-shrink-0"
          style={{
            width: `${circleSize}px`, height: `${circleSize}px`, fontSize,
            background: COLORS[COLS[ci] as keyof typeof COLORS],
            border: `2px solid ${COLORS[COLS[ci] as keyof typeof COLORS]}cc`,
            boxShadow: `0 0 10px ${COLORS[COLS[ci] as keyof typeof COLORS]}44`,
          }}>
          {last}
        </div>
        <div className="flex-shrink-0">
          <div className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-white/40 leading-tight`}>Último</div>
          <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-white font-mono leading-tight`}>{COLS[ci]}-{last}</div>
        </div>
        <div className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-white/30 flex-shrink-0 ml-1`}>{calledNumbers.length}/90</div>
      </div>
    )
  }

  // Mobile layout stays as is
  if (isMobile) {
    return (
      <div className="rounded-xl p-2" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        {lastSection(true)}
        <div className="flex flex-wrap mt-2">
          {calledNumbers.map((n, i) => ball(n, 22, '9px', i >= calledNumbers.length - 5))}
        </div>
      </div>
    )
  }

  // Desktop: last number + balls in a single horizontal row
  return (
    <div className="rounded-xl p-3" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-3">
        {lastSection(false)}
        <div className="flex-1 flex flex-wrap min-w-0">
          {calledNumbers.map((n, i) => ball(n, 26, '10px', i >= calledNumbers.length - 5))}
        </div>
      </div>
    </div>
  )
}
