import { useState } from 'react'
import { Minus, Plus, Zap, Play, RefreshCw, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { useBingoStore } from '../../store/bingoStore'
import { useGameStore } from '../../store/gameStore'
import { PATTERNS } from '../../lib/bingoPatterns'
import { useIsMobile } from '../../hooks/useIsMobile'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

const PATTERN_VISUALS: Record<string, string[][]> = {
  one_row: [
    ['·', '·', '·', '·', '·'],
    ['■', '■', '■', '■', '■'],
    ['·', '·', '·', '·', '·'],
  ],
  two_rows: [
    ['■', '■', '■', '■', '■'],
    ['·', '·', '·', '·', '·'],
    ['■', '■', '■', '■', '■'],
  ],
  v_shape: [
    ['■', '·', '·', '·', '■'],
    ['·', '■', '·', '■', '·'],
    ['·', '·', '■', '·', '·'],
  ],
  triangle: [
    ['·', '·', '■', '·', '·'],
    ['·', '■', '·', '■', '·'],
    ['■', '■', '■', '■', '■'],
  ],
  cross: [
    ['·', '·', '■', '·', '·'],
    ['■', '■', '■', '■', '■'],
    ['·', '·', '■', '·', '·'],
  ],
  bowtie: [
    ['■', '·', '■', '·', '■'],
    ['■', '■', '·', '■', '■'],
    ['■', '·', '■', '·', '■'],
  ],
  m_shape: [
    ['■', '·', '·', '·', '■'],
    ['■', '■', '·', '■', '■'],
    ['■', '·', '■', '·', '■'],
  ],
  x_diag: [
    ['·', '■', '·', '■', '·'],
    ['·', '·', '■', '·', '·'],
    ['·', '■', '·', '■', '·'],
  ],
  four_corners: [
    ['■', '·', '·', '·', '■'],
    ['·', '·', '·', '·', '·'],
    ['■', '·', '·', '·', '■'],
  ],
  frame: [
    ['■', '■', '■', '■', '■'],
    ['■', '·', '·', '·', '■'],
    ['■', '■', '■', '■', '■'],
  ],
  x2_pattern: [
    ['■', '·', '■', '·', '■'],
    ['·', '■', '·', '■', '·'],
    ['■', '·', '■', '·', '■'],
  ],
  full_card: [
    ['■', '■', '■', '■', '■'],
    ['■', '■', '■', '■', '■'],
    ['■', '■', '■', '■', '■'],
  ],
}

function PatternMini({ grid }: { grid: string[][] }) {
  return (
    <div className="grid grid-cols-5 gap-[1px] w-[45px]">
      {grid.flat().map((c, i) => (
        <div key={i} className={`w-[7px] h-[7px] rounded-[1px] ${c === '■' ? 'bg-white/60' : 'bg-white/[0.06]'}`} />
      ))}
    </div>
  )
}

export function BingoPanel() {
  const [showPatterns, setShowPatterns] = useState(true)
  const isMobile = useIsMobile()
  const {
    cardCount, betAmount, isPlaying, isTurbo, roundOver,
    calledNumbers, completedPatterns, totalWin, currentWins,
    extraOptions, gameOver, pendingWins, claimed,
    setCardCount, setBetAmount, setTurbo,
    startGame, buyRandomExtra, resetGame, randomizeCards, claimWinnings,
  } = useBingoStore()
  const balance = useGameStore(s => s.balance)
  const totalCost = cardCount * betAmount

  const extraCost = extraOptions.length > 0
    ? Math.round(extraOptions.reduce((s, o) => s + o.cost, 0) / extraOptions.length)
    : 0

  return (
    <div className="w-full sm:w-[360px] flex-shrink-0 h-full flex flex-col overflow-y-auto px-4 py-4 gap-4"
      style={{ borderLeft: '0.5px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>

      {!isMobile && (
        <div className="p-3 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Créditos</div>
          <div className="text-xl font-bold text-white font-mono">${formatNum(balance)}</div>
        </div>
      )}

      {isPlaying && (
        <div className="p-3 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40">Ronda</span>
            <span className="text-xs text-white font-mono">{calledNumbers.length}/{30}</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(calledNumbers.length / 30) * 100}%` }} />
          </div>
          {currentWins > 0 && (
            <div className="mt-2 text-[10px] text-green-400">+{formatNum(currentWins)} ganados</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium ${isTurbo ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/[0.04] text-white/40'}`}>
              {isTurbo ? '⚡ Turbo' : 'Normal'}
            </div>
          </div>
        </div>
      )}

      {!isPlaying && !roundOver && !gameOver ? (
        <div className="space-y-3">
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Apuesta x Cartón</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <div className="flex-1 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <span className="text-base font-bold text-white font-mono">{betAmount}</span>
              </div>
              <button onClick={() => setBetAmount(Math.min(5000, betAmount + 10))}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {[10, 100, 500, 1000, 5000].map(a => (
                <button key={a} onClick={() => setBetAmount(a)}
                  className={`h-7 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer ${betAmount === a ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}
                >{formatNum(a)}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Cartones</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCardCount(cardCount - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <div className="flex-1 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <span className="text-base font-bold text-white font-mono">{cardCount}</span>
              </div>
              <button onClick={() => setCardCount(cardCount + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all ${isTurbo ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 border border-white/[0.06]'}`}
                onClick={() => setTurbo(!isTurbo)}>
                <Zap className="w-3 h-3 inline mr-1" />Turbo
              </div>
            </div>
            <div className="text-[10px] text-white/40">
              <span className="font-mono font-bold text-white">{formatNum(totalCost)}</span> total
            </div>
          </div>

          <button onClick={startGame}
            disabled={balance < totalCost}
            className="w-full h-11 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Jugar {cardCount} Cartones
          </button>
          <button onClick={randomizeCards}
            className="w-full h-9 rounded-xl font-medium text-[11px] bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.06] transition-all cursor-pointer flex items-center justify-center gap-2">
            <RefreshCw className="w-3 h-3" /> Cambiar Cartones
          </button>
        </div>
      ) : null}

      {/* Combinaciones - siempre visible */}
      <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setShowPatterns(!showPatterns)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] text-white/50 hover:text-white transition-all cursor-pointer">
          <span>Combinaciones ({PATTERNS.length})</span>
          {showPatterns ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showPatterns && (
          <div className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {PATTERNS.map(p => {
                const visual = PATTERN_VISUALS[p.id]
                return (
                  <div key={p.id} className="flex items-center gap-2 py-1">
                    <PatternMini grid={visual} />
                    <span className="text-[10px] text-white/70 flex-1 leading-tight">{p.name}</span>
                    <span className="text-[10px] text-yellow-400/80 font-mono font-medium">{p.payout}×</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {roundOver && !gameOver && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Resultados</div>
            {completedPatterns.length > 0 ? (
              <div className="space-y-1.5">
                {completedPatterns.map((cp, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60">Cartón {cp.cardIndex + 1} · {cp.patternName}</span>
                    <span className="text-green-400 font-mono font-medium">+{formatNum(cp.payout)}</span>
                  </div>
                ))}
                <div className="pt-1.5 mt-1.5 flex items-center justify-between text-xs font-semibold"
                  style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-white">Total</span>
                  <span className="text-green-400 font-mono">+{formatNum(totalWin)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Sin patrones completados</p>
            )}
          </div>

          <button onClick={buyRandomExtra}
            className="w-full h-10 rounded-xl font-medium text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'rgba(234,179,8,0.1)', border: '0.5px solid rgba(234,179,8,0.2)', color: '#eab308' }}>
            <Sparkles className="w-3.5 h-3.5" /> Pedir Extra ({extraOptions.length > 0 ? `$${formatNum(extraCost)}` : 'Gratis'})
          </button>

          {!claimed && pendingWins > 0 && (
            <button onClick={claimWinnings}
              className="w-full h-11 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
              Cobrar ${formatNum(pendingWins)}
            </button>
          )}

          <button onClick={resetGame}
            className="w-full h-11 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Nueva Partida
          </button>
        </div>
      )}

      {gameOver && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">Juego Terminado</div>
            <div className="text-[10px] text-white/40 mt-1">Total ganado: <span className="text-green-400 font-mono font-medium">+{formatNum(totalWin)}</span></div>
          </div>
          <button onClick={resetGame}
            className="w-full h-11 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Nueva Partida
          </button>
        </div>
      )}
    </div>
  )
}
