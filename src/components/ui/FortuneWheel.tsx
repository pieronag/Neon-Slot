import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'

const freeSpinsCount = () => Math.max(2, Math.min(25, Math.round(1000 / Math.max(10, useGameStore.getState().betAmount))))

const SEGMENTS = [
  { label: '+1x', value: 1, color: '#00e5ff', isMultiplier: true },
  { label: '+2x', value: 2, color: '#a855f7', isMultiplier: true },
  { label: 'Gratis', value: 0, color: '#ffd700', isFree: true },
  { label: '+3x', value: 3, color: '#10b981', isMultiplier: true },
  { label: '+1x', value: 1, color: '#f97316', isMultiplier: true },
  { label: '+5x', value: 5, color: '#ef4444', isMultiplier: true },
  { label: 'x2', value: 0, color: '#ffd700', isX2: true },
  { label: '+2x', value: 2, color: '#00e5ff', isMultiplier: true },
  { label: '+4x', value: 4, color: '#a855f7', isMultiplier: true },
  { label: 'Gratis', value: 0, color: '#10b981', isFree: true },
  { label: '+1x', value: 1, color: '#f97316', isMultiplier: true },
  { label: '+10x', value: 10, color: '#ffd700', isMultiplier: true },
]

export function FortuneWheel() {
  const { showWheel, hideWheel, addNotification } = useUIStore()
  const { addFreeSpins, balance } = useGameStore()
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (showWheel) { setSpinning(false); setResult(null); setDone(false); setRotation(0) }
  }, [showWheel])

  if (!showWheel) return null

  const handleSpin = () => {
    if (spinning) return
    setSpinning(true); setResult(null); setDone(false)

    const winner = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)]
    const segAngle = 360 / SEGMENTS.length
    const winIdx = SEGMENTS.indexOf(winner)
    const targetAngle = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2)
    const startAngle = rotation % 360
    const finalRotation = rotation + (targetAngle - startAngle + Math.random() * 20)

    setRotation(finalRotation)

    setTimeout(() => {
      setResult(winner)
      setDone(true)
      setSpinning(false)

      const bet = useGameStore.getState().betAmount
      if (winner.isFree) {
        const fs = freeSpinsCount()
        addFreeSpins(fs)
        useAuthStore.getState().addMinigameResult('win', 0, useGameStore.getState().balance)
      } else if (winner.isX2) {
        const nb = balance * 2
        useGameStore.setState({ balance: nb })
        useAuthStore.getState().addMinigameResult('win', nb - balance, nb)
      } else {
        const coins = Math.round(bet * winner.value)
        const nb = balance + coins
        useGameStore.setState({ balance: nb })
        useAuthStore.getState().addMinigameResult('win', coins, nb)
      }
      const fsCount = winner.isFree ? freeSpinsCount() : 0
      addNotification(
        winner.isFree ? `Rueda: +${fsCount} Giros Gratis!` : winner.isX2 ? 'Rueda: Saldo Duplicado!' : 'Rueda: +' + Math.round(bet * winner.value).toLocaleString('es-CL') + ' monedas!',
        'win'
      )
    }, 4000)
  }

  const segAngle = 360 / SEGMENTS.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md rounded-2xl p-5 sm:p-6"
        style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">Rueda de la Fortuna</h2>
        </div>

        {!done && (
          <p className="text-[10px] text-white/40 mb-3 text-center">
            {spinning ? 'Girando...' : 'Toca para girar la rueda'}
          </p>
        )}

        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-4">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ marginTop: '-2px' }}>
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full" style={{
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: spinning
              ? '0 0 40px rgba(255,215,0,0.1), inset 0 0 20px rgba(255,215,0,0.03)'
              : '0 0 15px rgba(255,255,255,0.02)',
          }} />

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.08, 0.82, 0.17, 1] }}
            className="w-full h-full rounded-full relative overflow-hidden"
          >
            {SEGMENTS.map((seg, i) => {
              const angle = segAngle * i
              return (
                <div key={i} className="absolute inset-0" style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((segAngle / 2) * Math.PI / 180)}% 0%)`,
                  background: `linear-gradient(135deg, ${seg.color}cc, ${seg.color}88)`,
                }} />
              )
            })}

            {/* Center hub */}
            <div className="absolute inset-[18%] rounded-full" style={{
              background: 'radial-gradient(circle, #111120 0%, #050508 100%)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)',
            }}>
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={spinning ? { rotate: 360 } : { scale: [1, 1.15, 1] }}
                  transition={spinning ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className={`w-5 h-5 ${spinning ? 'text-yellow-400' : 'text-yellow-400/40'}`} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {done && result && (
          <div className="mb-4 text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px 16px' }}>
            <div className="text-lg font-bold" style={{ color: result.color }}>{result.label}</div>
            <div className="text-[11px] text-white/40 mt-0.5">
              {result.isFree ? `${freeSpinsCount()} Giros Gratis!` : result.isX2 ? 'Saldo Duplicado!' : `+${Math.round(useGameStore.getState().betAmount * result.value).toLocaleString('es-CL')} monedas`}
            </div>
          </div>
        )}

        {!done && (
          <button onClick={handleSpin} disabled={spinning}
            className="w-full h-11 rounded-xl font-medium text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: spinning ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ffd700, #f59e0b)', color: spinning ? 'rgba(255,255,255,0.3)' : '#000' }}>
            {spinning ? 'Girando...' : 'Girar'}
          </button>
        )}

        {done && (
          <button onClick={hideWheel}
            className="w-full h-11 rounded-xl font-medium text-sm transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#000' }}>
            Reclamar
          </button>
        )}
      </motion.div>
    </div>
  )
}
