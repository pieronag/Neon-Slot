import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'

const MULTIPLIERS = [1.5, 2, 3, 5]

export function CardFlip() {
  const { showCardFlip, hideCard, addNotification } = useUIStore()
  const [state, setState] = useState<'pick' | 'reveal'>('pick')
  const [multiplier, setMultiplier] = useState(0)

  useEffect(() => { if (showCardFlip) setState('pick') }, [showCardFlip])

  const handlePick = () => {
    const m = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]
    setMultiplier(m)
    setState('reveal')
  }

  const handleClaim = () => {
    const bs = useGameStore.getState().betAmount
    const gain = Math.round(bs * multiplier)
    const newBalance = useGameStore.getState().balance + gain
    useGameStore.setState({ balance: newBalance })
    useAuthStore.getState().addMinigameResult('win', gain, newBalance)
    addNotification(`Carta: ${multiplier}x = +${gain.toLocaleString('es-CL')} monedas!`, 'win')
    hideCard()
  }

  const formatCoin = (m: number) => Math.round(useGameStore.getState().betAmount * m).toLocaleString('es-CL')

  return (
    <AnimatePresence>
      {showCardFlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full"
            style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Carta de la Suerte</h3>
            </div>
            <p className="text-sm text-white/40 mb-5">Elige una carta para multiplicar tu apuesta</p>

            {state === 'pick' ? (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[0, 1, 2, 3].map(i => (
                  <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handlePick}
                    className="h-28 rounded-xl flex items-center justify-center cursor-pointer transition-all relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))',
                      border: '0.5px solid rgba(59,130,246,0.15)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.8) 0%, transparent 50%), repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(59,130,246,0.1) 8px, rgba(59,130,246,0.1) 9px)',
                      }}
                    />
                    <div className="relative flex flex-col items-center gap-1">
                      <span className="text-2xl font-bold" style={{ color: 'rgba(59,130,246,0.25)' }}>?</span>
                      <span className="text-[9px] text-blue-500/20 font-semibold uppercase tracking-wider">Elegir</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                  className="py-4"
                >
                  <div className="w-24 h-32 mx-auto rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.04))',
                      border: '0.5px solid rgba(59,130,246,0.2)',
                      boxShadow: '0 0 30px rgba(59,130,246,0.1)',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                      <div className="text-3xl font-bold text-blue-400 font-mono">{multiplier}x</div>
                    </motion.div>
                  </div>
                </motion.div>
                <div className="mb-4 text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '10px 16px' }}>
                  <div className="text-sm font-semibold text-blue-400">{multiplier}x multiplicador</div>
                  <div className="text-[11px] text-white/40 mt-0.5">+{formatCoin(multiplier)} monedas</div>
                </div>
                <button onClick={handleClaim}
                  className="w-full h-11 rounded-xl font-medium text-sm transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
                  Reclamar
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
