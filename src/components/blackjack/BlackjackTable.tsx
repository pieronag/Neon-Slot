import { motion } from 'framer-motion'
import { Minus, Plus, Play, RefreshCw } from 'lucide-react'
import { useBlackjackStore } from '../../store/blackjackStore'
import { useGameStore } from '../../store/gameStore'
import { BlackjackCard } from './BlackjackCard'
import { evaluateHand, formatHand, canSplit, canDouble } from '../../lib/blackjackEngine'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function BlackjackTable() {
  const {
    playerHand, dealerHand, splitHands, phase, activeHand, betAmount,
    result, totalPayout, setBetAmount, placeBet, newGame,
    hit, stand, double, split, insurance,
  } = useBlackjackStore()
  const balance = useGameStore(s => s.balance)
  const playerEval = evaluateHand(playerHand)
  const dealerEval = evaluateHand(dealerHand)
  const currCards = splitHands.length > 0 ? splitHands[activeHand].cards : playerHand
  const currBet = splitHands.length > 0 ? splitHands[activeHand].bet : betAmount

  return (
    <div className="h-full flex flex-col min-h-0"
      style={{
        background: 'radial-gradient(ellipse at center, #1a4a2e 0%, #0d2818 50%, #05120b 100%)',
      }}
    >
      {/* Top bar: balance + bet controls */}
      <div className="flex items-center justify-between px-4 py-2 sm:py-3 flex-shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
        <div className="hidden sm:block">
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Créditos</div>
          <div className="text-lg font-bold text-white font-mono">${formatNum(balance)}</div>
        </div>

        {phase === 'bet' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button onClick={() => setBetAmount(Math.max(1000, betAmount - 1000))}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
              <div className="h-8 sm:h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center px-2 sm:px-3">
                <span className="text-sm sm:text-base font-bold text-white font-mono">{betAmount}</span>
              </div>
              <div className="flex gap-1">
                {[1000, 5000, 10000, 25000, 50000].map(a => (
                  <button key={a} onClick={() => setBetAmount(a)}
                    className={`h-7 px-1.5 sm:px-2 rounded-lg text-[7px] sm:text-[9px] font-mono font-medium transition-all cursor-pointer ${betAmount === a ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}
                  >{formatNum(a)}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setBetAmount(Math.min(50000, betAmount + 1000))}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {phase === 'result' && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-white/30">{result}</div>
              <div className={`text-lg font-bold font-mono ${totalPayout >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPayout >= 0 ? '+' : ''}${formatNum(totalPayout)}
              </div>
            </div>
            <button onClick={newGame}
              className="h-9 px-4 rounded-xl font-medium text-sm bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Nueva
            </button>
          </div>
        )}
      </div>

      {/* Game area - fills remaining space with scroll */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-4 p-2 sm:p-4 overflow-y-auto min-h-0">
        {/* Dealers */}
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Dealer</div>
            <div className="flex items-center justify-center gap-3 min-h-[120px] sm:min-h-[140px]">
              {dealerHand.length === 0 && <span className="text-white/20 text-sm">Esperando apuesta...</span>}
            {dealerHand.map((c, i) => (
              <BlackjackCard key={`d-${i}`} card={c} index={i} huge />
            ))}
          </div>
          {dealerHand.length > 0 && (phase === 'dealer_turn' || phase === 'result') && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-white/10">
              <span className="text-white font-mono font-bold text-base">{formatHand(dealerEval)}</span>
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-white/20 text-sm">♠</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Player */}
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Jugador</div>

          {splitHands.length > 0 ? (
            <div className="space-y-4">
              {splitHands.map((hand, i) => {
                const hEval = evaluateHand(hand.cards)
                const isActive = i === activeHand && phase === 'playing'
                return (
                  <div key={i} className={`p-2 sm:p-3 rounded-xl ${isActive ? 'ring-1 ring-yellow-400/30' : ''}`}
                    style={{ background: isActive ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] text-white/30 mb-1">Mano {i + 1} (${hand.bet})</div>
                    <div className="flex items-center justify-center gap-3 min-h-[120px] sm:min-h-[140px]">
                      {hand.cards.map((c, j) => (
                        <BlackjackCard key={`s-${i}-${j}`} card={c} index={j} huge />
                      ))}
                    </div>
                    <div className="mt-1">
                      <span className="text-white font-mono font-bold text-base">{formatHand(hEval)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 min-h-[120px] sm:min-h-[140px]">
                {playerHand.length === 0 && <span className="text-white/20 text-sm">Ajusta tu apuesta y juega</span>}
                {playerHand.map((c, i) => (
                  <BlackjackCard key={`p-${i}`} card={c} index={i} huge />
                ))}
              </div>
              {playerHand.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-white/10">
                  <span className="text-white font-mono font-bold text-base">{formatHand(playerEval)}</span>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions bar at bottom */}
      <div className="flex-shrink-0 px-4 py-2 sm:py-3 pb-4 sm:pb-6" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
        {phase === 'bet' && (
          <button onClick={placeBet} disabled={balance < betAmount}
            className="w-full h-12 rounded-xl font-bold text-base bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
            <Play className="w-5 h-5" /> Jugar ${formatNum(betAmount)}
          </button>
        )}

        {phase === 'insurance' && (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button onClick={() => insurance(true)}
              className="h-12 rounded-xl font-bold text-sm bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-all border border-yellow-400/20 cursor-pointer">
              Seguro (${Math.round(betAmount / 2)})
            </button>
            <button onClick={() => insurance(false)}
              className="h-12 rounded-xl font-bold text-sm bg-white/[0.04] text-white/70 hover:bg-white/[0.06] transition-all border border-white/[0.06] cursor-pointer">
              No Seguro
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="max-w-md mx-auto">
            {splitHands.length > 0 && (
              <div className="text-[10px] text-white/30 text-center mb-2">
                Mano {activeHand + 1} de {splitHands.length}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={hit}
                className="h-14 rounded-xl font-bold text-base bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer">
                Pedir
              </button>
              <button onClick={stand}
                className="h-14 rounded-xl font-bold text-base bg-white/[0.04] text-white/70 hover:bg-white/[0.06] transition-all border border-white/[0.06] cursor-pointer">
                Plantarse
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {canDouble(currCards) && (
                <button onClick={double}
                  className="h-12 rounded-xl font-semibold text-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/20 cursor-pointer">
                  Doblar (${currBet})
                </button>
              )}
              {canSplit(currCards) && (
                <button onClick={split}
                  className="h-12 rounded-xl font-semibold text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20 cursor-pointer">
                  Split
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
