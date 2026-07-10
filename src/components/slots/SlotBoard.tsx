import { useMemo, useRef, useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Reel } from './Reel'
import { getReelCount, getRowCount } from '../../lib/reels'
import { useIsMobile } from '../../hooks/useIsMobile'

export function SlotBoard() {
  const { reelsResult, isSpinning, lastResult, gameMode } = useGameStore()
  const ref = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(72)
  const isMobile = useIsMobile()

  useEffect(() => {
    const calc = () => {
      if (!ref.current) return
      const p = ref.current.parentElement
      if (!p) return
      if (isMobile) {
        const reels = getReelCount()
        const gap = 3
        const labelW = 16
        const padX = 12
        const avail = p.clientWidth - labelW - padX
        const size = Math.floor((avail - gap * (reels - 1)) / reels)
        setCellSize(Math.max(32, Math.min(80, size)))
      } else {
        const rows = getRowCount()
        const gap = 6
        const pad = 24
        const avail = p.clientHeight - pad
        const size = Math.floor((avail - gap * (rows - 1)) / rows)
        setCellSize(Math.max(55, Math.min(150, size)))
      }
    }
    calc()
    const ob = new ResizeObserver(calc)
    const parent = ref.current?.parentElement
    if (parent) ob.observe(parent)
    window.addEventListener('resize', calc)
    return () => { ob.disconnect(); window.removeEventListener('resize', calc) }
  }, [isMobile])

  const displayReels = useMemo(() => {
    if (reelsResult.length > 0) return reelsResult
    return Array.from({ length: getReelCount() }, () => Array.from({ length: getRowCount() }, () => 'coin'))
  }, [reelsResult])

  const { highlightMap } = useMemo(() => {
    const m = new Map<string, boolean>()
    if (lastResult && !isSpinning) {
      for (const win of lastResult.wins) {
        for (const p of win.positions) m.set(`${p.reel}-${p.row}`, true)
      }
    }
    return { highlightMap: m }
  }, [lastResult, isSpinning])

  const reelGap = Math.round(cellSize * 0.07)
  const rowGap = Math.max(3, Math.round(cellSize * 0.05))

  return (
    <div ref={ref} className="relative w-full h-full flex items-center justify-center min-h-0 px-1 sm:px-6 py-0.5 sm:py-2">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center w-full px-0.5 py-0.5 sm:py-2">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute -left-3 sm:-left-5 flex flex-col items-center" style={{ gap: rowGap }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-center justify-center" style={{ height: cellSize }}>
                    <span className="text-[6px] sm:text-[9px] font-mono text-white font-bold">L{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center" style={{ gap: reelGap }}>
                {displayReels.map((col, ri) => (
                  <Reel
                    key={ri}
                    symbols={col}
                    spinning={isSpinning}
                    reelIndex={ri}
                    cellSize={cellSize}
                    turbo={gameMode === 'turbo'}
                    highlight={col.map((_, rowIdx) => highlightMap.get(`${ri}-${rowIdx}`) ?? false)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center mt-0.5 sm:mt-2 pt-0.5 sm:pt-1.5" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-center" style={{ width: cellSize, marginLeft: i > 0 ? reelGap : 0 }}>
                  <span className="text-[6px] sm:text-[8px] text-white font-bold font-mono">L{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
