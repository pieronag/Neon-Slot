import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { RefreshCw, Play, Trash2 } from 'lucide-react'
import { useRouletteStore } from '../../store/rouletteStore'
import { RouletteWheel } from './RouletteWheel'
import { RouletteBetGrid } from './RouletteBetGrid'
import { getColor } from '../../lib/rouletteEngine'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')
const COLORS: Record<string, string> = { red: '#dc2626', black: '#1a1a2e', green: '#16a34a' }

const CHIP_STYLES: Record<number, { bg: string; border: string; text: string; edge: string }> = {
  500: { bg: 'radial-gradient(circle at 35% 35%, #ffffff, #e0e0e0)', border: '#999', text: '#333', edge: '#bbb' },
  1000: { bg: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c0392b)', border: '#922b21', text: '#fff', edge: '#e74c3c' },
  5000: { bg: 'radial-gradient(circle at 35% 35%, #5dade2, #2e86c1)', border: '#1a5276', text: '#fff', edge: '#3498db' },
  10000: { bg: 'radial-gradient(circle at 35% 35%, #58d68d, #27ae60)', border: '#1e8449', text: '#fff', edge: '#2ecc71' },
  25000: { bg: 'radial-gradient(circle at 35% 35%, #f5b041, #d4ac0d)', border: '#b7950b', text: '#333', edge: '#f1c40f' },
}

const CHIP_VALUES = [500, 1000, 5000, 10000, 25000]

export function RouletteTable() {
  const { bets, chipValue, spinning, winnerNumber, phase, lastPayout, setChipValue, clearBets, spin, newRound } = useRouletteStore()
  const [stopped, setStopped] = useState(false)
  const totalBet = bets.reduce((s, b) => s + b.amount, 0)
  const canSpin = phase === 'bet' && bets.length > 0 && !spinning

  const showResult = winnerNumber !== null && stopped

  useEffect(() => { if (spinning) setStopped(false) }, [spinning])

  return (
    <div className="h-full flex flex-col sm:flex-row min-h-0"
      style={{ background: 'radial-gradient(ellipse at center, #1a4a2e 0%, #0d2818 50%, #05120b 100%)' }}>
      
      {/* Left: Wheel + Result */}
      <div className="flex-shrink-0 sm:flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 p-2 sm:p-4 gap-2 sm:gap-3">
        <RouletteWheel spinning={spinning} winner={winnerNumber} onStopped={() => { if (winnerNumber !== null) setStopped(true) }} />

        {/* Result card - single card with dividers, centered X/Y */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="flex items-stretch rounded-xl overflow-hidden"
              style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: `${COLORS[getColor(winnerNumber)]}22` }}>
              <div className="flex-1 flex flex-col items-center justify-center py-3 px-2">
                <div className="text-2xl font-bold text-white font-mono">{winnerNumber}</div>
                <div className="text-[10px] text-white/40 mt-1">Número</div>
              </div>
              <div style={{ width: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex-1 flex flex-col items-center justify-center py-3 px-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: COLORS[getColor(winnerNumber)] }} />
                  <span className="text-sm font-bold text-white uppercase">{getColor(winnerNumber)}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1">Color</div>
              </div>
              <div style={{ width: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex-1 flex flex-col items-center justify-center py-3 px-2">
                <div className={`text-lg font-bold font-mono ${lastPayout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {lastPayout > 0 ? '+' : ''}{formatNum(lastPayout || -(bets.reduce((s, b) => s + b.amount, 0)))}
                </div>
                <div className="text-[10px] text-white/40 mt-1">Premio</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right: Panel */}
      <div className="w-full sm:w-[340px] flex-shrink-0 flex-1 sm:flex-none sm:h-full flex flex-col overflow-hidden min-h-0"
        style={{ borderLeft: '0.5px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>
        
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 pb-6 flex flex-col gap-4">
          {/* Bet grid */}
          <div className="overflow-x-auto flex-shrink-0">
            <RouletteBetGrid />
          </div>

          <div className="flex-1 min-h-0" />

          {/* Chips */}
          <div className="flex-shrink-0">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2 text-center">Fichas</div>
          <div className="flex flex-nowrap gap-2 justify-center">
            {CHIP_VALUES.map(v => {
              const style = CHIP_STYLES[v]
              const isSelected = chipValue === v
              return (
                <button key={v} onClick={() => setChipValue(v)}
                  className={`rounded-full font-bold text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col items-center justify-center relative ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                  style={{
                    width: '58px', height: '58px',
                    background: style.bg,
                    border: `3px solid ${style.border}`,
                    boxShadow: isSelected
                      ? `0 0 0 3px rgba(255,255,255,0.4), 0 0 16px ${style.edge}88`
                      : `0 2px 6px rgba(0,0,0,0.4), inset 0 -3px 0 ${style.border}`,
                    color: style.text,
                  }}>
                  {/* Edge ring */}
                  <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                    border: `2px dashed ${style.edge}66`,
                    margin: '3px',
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>{v >= 1000 ? `${v / 1000}K` : v}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 0 6px rgba(255,255,255,0.5)' }}>
                      <span className="text-black text-[8px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions area - fixed height to prevent panel shift */}
        <div className="flex-shrink-0 min-h-[100px] flex items-center justify-center">
          {phase === 'bet' && (
            <div className="space-y-2 w-full">
              <button onClick={clearBets} disabled={bets.length === 0}
                className="w-full h-10 rounded-xl font-medium text-sm bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                <Trash2 className="w-4 h-4" /> Limpiar
              </button>
              <button onClick={spin} disabled={!canSpin}
                className="w-full h-12 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                <Play className="w-5 h-5" /> Girar ({formatNum(totalBet)})
              </button>
            </div>
          )}
          {phase === 'spin' && (
            <div className="flex items-center justify-center gap-2 text-white/50 w-full py-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white" />
              <span className="text-sm">Girando...</span>
            </div>
          )}
          {phase === 'result' && (
            <button onClick={() => { newRound(); setStopped(false) }}
              className="w-full h-12 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <RefreshCw className="w-5 h-5" /> Nueva Apuesta
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
