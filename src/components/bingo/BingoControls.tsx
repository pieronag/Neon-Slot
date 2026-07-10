import { Minus, Plus, Zap, Play } from 'lucide-react'
import { useBingoStore } from '../../store/bingoStore'
import { useGameStore } from '../../store/gameStore'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function BingoControls() {
  const {
    cardCount, betAmount, isPlaying, isTurbo, roundOver,
    setCardCount, setBetAmount, setTurbo, startGame,
  } = useBingoStore()
  const balance = useGameStore(s => s.balance)
  const totalCost = cardCount * betAmount

  return (
    <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
      {!isPlaying && !roundOver ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
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
            </div>
            <div className="flex-1">
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
            <Play className="w-4 h-4" /> Jugar ({cardCount} cartones)
          </button>
        </div>
      ) : isPlaying ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">
            {isTurbo ? 'Procesando...' : `Número ${useBingoStore.getState().calledNumbers.length}/30`}
          </span>
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${isTurbo ? 'bg-zap-400/20 text-zap-400' : 'bg-white/[0.04] text-white/50'}`}>
            {isTurbo ? 'Turbo' : 'Normal'}
          </div>
        </div>
      ) : null}
    </div>
  )
}
