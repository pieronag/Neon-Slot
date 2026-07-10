import { useEffect, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useBingoStore } from '../../store/bingoStore'
import { BingoCard } from './BingoCard'
import { BingoBallDisplay } from './BingoBallDisplay'
import { BingoPanel } from './BingoPanel'
import { useIsMobile } from '../../hooks/useIsMobile'

export function BingoBoard() {
  const { cards, isPlaying, roundOver, isTurbo, regenerateCard } = useBingoStore()
  const intervalRef = useRef<number | null>(null)
  const isMobile = useIsMobile()

  const doCallNext = useCallback(() => {
    const done = useBingoStore.getState().callNext()
    if (done) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      useBingoStore.getState().endRound()
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !roundOver) {
      const delay = isTurbo ? 50 : 2000
      intervalRef.current = window.setInterval(doCallNext, delay)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, roundOver, isTurbo, doCallNext])

  useEffect(() => {
    if (roundOver) {
      useBingoStore.getState().calcExtras()
    }
  }, [roundOver])

  const isPreview = !isPlaying && !roundOver && cards.length > 0
  const compact = isMobile || cards.length > 4

  if (isMobile) {
    return (
      <div className="h-full flex flex-col min-h-0">
        {/* Ball display at top */}
        <div className="flex-shrink-0 px-2 pt-2">
          <BingoBallDisplay />
        </div>

        {/* Cards scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-2">
          {cards.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {cards.map((c, i) => (
                <div key={c.id} className="relative">
                  <BingoCard card={c} compact={true} />
                  {isPreview && (
                    <button onClick={() => regenerateCard(i)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 z-10"
                      style={{ background: '#f59e0b', border: '0.5px solid rgba(255,255,255,0.2)', boxShadow: '0 0 6px rgba(245,158,11,0.4)' }}>
                      <RefreshCw className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel fixed at bottom */}
        <div className="flex-shrink-0 max-h-[35vh] overflow-y-auto" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
          <BingoPanel />
        </div>
      </div>
    )
  }

  /* Desktop layout */
  return (
    <div className="h-full flex flex-row min-h-0">
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto p-4 gap-3">
        {cards.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c, i) => (
              <div key={c.id} className="relative">
                <BingoCard card={c} compact={compact} />
                {isPreview && (
                  <button onClick={() => regenerateCard(i)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 z-10"
                    style={{ background: '#f59e0b', border: '0.5px solid rgba(255,255,255,0.2)', boxShadow: '0 0 6px rgba(245,158,11,0.4)' }}>
                    <RefreshCw className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <BingoBallDisplay />
      </div>

      <BingoPanel />
    </div>
  )
}
