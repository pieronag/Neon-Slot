import { Minus, Plus, Play, RefreshCw } from 'lucide-react'
import { useBlackjackStore } from '../../store/blackjackStore'
import { useGameStore } from '../../store/gameStore'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function BlackjackPanel() {
  const { betAmount, phase, result, totalPayout, setBetAmount, placeBet, newGame } = useBlackjackStore()
  const balance = useGameStore(s => s.balance)

  return (
    <div className="w-full sm:w-[360px] flex-shrink-0 h-full flex flex-col overflow-y-auto px-4 py-4 gap-4"
      style={{ borderLeft: '0.5px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>

      {/* Balance */}
      <div className="p-3 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Créditos</div>
        <div className="text-xl font-bold text-white font-mono">${formatNum(balance)}</div>
      </div>

      {/* Bet phase */}
      {phase === 'bet' && (
        <div className="space-y-3">
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Apuesta</div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <div className="flex-1 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <span className="text-base font-bold text-white font-mono">{betAmount}</span>
              </div>
              <button onClick={() => setBetAmount(Math.min(5000, betAmount + 10))}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 100, 500, 1000, 5000].map(a => (
                <button key={a} onClick={() => setBetAmount(a)}
                  className={`h-7 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer ${betAmount === a ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}
                >{formatNum(a)}</button>
              ))}
            </div>
          </div>
          <button onClick={placeBet} disabled={balance < betAmount}
            className="w-full h-11 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Jugar
          </button>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-[10px] text-white/30 mb-1">Resultado</div>
            <div className="text-sm font-bold text-white mb-1">{result}</div>
            <div className={`text-lg font-bold font-mono ${totalPayout >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPayout >= 0 ? '+' : ''}${formatNum(totalPayout)}
            </div>
          </div>
          <button onClick={newGame}
            className="w-full h-11 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Nueva Mano
          </button>
        </div>
      )}
    </div>
  )
}
