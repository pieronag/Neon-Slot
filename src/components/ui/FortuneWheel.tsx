import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'

const SEGMENTS = [
  { label: '+50', value: 50, color: '#00e5ff' },
  { label: '+100', value: 100, color: '#a855f7' },
  { label: '5 FS', value: 0, color: '#ffd700', isFree: true },
  { label: '+200', value: 200, color: '#10b981' },
  { label: '+50', value: 50, color: '#f97316' },
  { label: '+500', value: 500, color: '#ef4444' },
  { label: 'x2', value: 0, color: '#ffd700', isX2: true },
  { label: '+100', value: 100, color: '#00e5ff' },
  { label: '+300', value: 300, color: '#a855f7' },
  { label: '3 FS', value: 0, color: '#10b981', isFree: true },
  { label: '+75', value: 75, color: '#f97316' },
  { label: '+1000', value: 1000, color: '#ffd700' },
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

      const newBalance = winner.isX2 ? balance * 2 : balance + (winner.value || 0)
      if (winner.isFree) {
        const fs = winner.label === '5 FS' ? 5 : 3
        addFreeSpins(fs)
        useGameStore.setState({ freeSpinsRemaining: useGameStore.getState().freeSpinsRemaining + fs })
      } else {
        useGameStore.setState({ balance: newBalance })
        useAuthStore.getState().updateProfile({ balance: newBalance })
      }
      addNotification(winner.isFree ? `Rueda: ${winner.label === '5 FS' ? 5 : 3} giros gratis!` : winner.isX2 ? 'Rueda: Saldo duplicado!' : `Rueda: +${winner.value} monedas!`, 'win')
    }, 4000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={hideWheel} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Rueda de la fortuna</h2>
          <button onClick={hideWheel} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!done && (
          <p className="text-xs text-white/40 mb-5 text-center">
            {spinning ? 'Girando...' : 'Gira la rueda para ganar premios'}
          </p>
        )}

        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-5">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-8 border-r-8 border-t-[12px] border-l-transparent border-r-transparent border-t-white" />

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.08, 0.82, 0.17, 1] }}
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (360 / SEGMENTS.length) * i
              return (
                <div key={i} className="absolute inset-0" style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan(Math.PI / SEGMENTS.length)}% 0%)`,
                  background: seg.color, opacity: 0.8,
                }}>
                  <span className="absolute font-bold text-white text-[10px] sm:text-xs" style={{
                    top: '18%', left: '50%', transform: 'translateX(-50%)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}>{seg.label}</span>
                </div>
              )
            })}

            <div className="absolute inset-3 rounded-full" style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-full h-full flex items-center justify-center">
                {done && result ? (
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: result.color }}>{result.label}</div>
                    <div className="text-[10px] text-white/40 mt-1">
                      {result.isFree ? `${result.label === '5 FS' ? 5 : 3} giros gratis` : result.isX2 ? 'Saldo x2' : `+${result.value} monedas`}
                    </div>
                  </div>
                ) : (
                  <span className="text-lg text-white/30">?</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {!done && (
          <button onClick={handleSpin} disabled={spinning}
            className="w-full h-11 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {spinning ? 'Girando...' : 'Girar'}
          </button>
        )}

        {done && (
          <button onClick={hideWheel}
            className="w-full h-11 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors">
            Reclamar
          </button>
        )}
      </motion.div>
    </div>
  )
}
