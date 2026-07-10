import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'

const MULTIPLIERS = [0.5, 1, 2, 3, 5, 10]

export function MysteryBox() {
  const { showMysteryBox, hideMystery, addNotification } = useUIStore()
  const [revealed, setRevealed] = useState(false)
  const [prize, setPrize] = useState(0)

  useEffect(() => { if (showMysteryBox) { setRevealed(false); setPrize(0) } }, [showMysteryBox])

  const handlePick = () => {
    const bet = useGameStore.getState().betAmount
    const m = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]
    const p = Math.round(bet * m)
    setPrize(p)
    setRevealed(true)
  }

  const handleClaim = () => {
    const newBalance = useGameStore.getState().balance + prize
    useGameStore.setState({ balance: newBalance })
    useAuthStore.getState().addMinigameResult('win', prize, newBalance)
    addNotification(`Caja Misteriosa: +${prize.toLocaleString('es-CL')} monedas!`, 'win')
    hideMystery()
  }

  return (
    <AnimatePresence>
      {showMysteryBox && (
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
            <Gift className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Caja Misteriosa</h3>
            <p className="text-sm text-white/40 mb-6">Elige una caja para revelar tu premio</p>

            {!revealed ? (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[0, 1, 2].map(i => (
                  <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handlePick}
                    className="h-24 rounded-xl flex items-center justify-center cursor-pointer transition-all bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-500/40"
                  >
                    <Gift className="w-8 h-8 text-white/30" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  className="py-6"
                >
                  <div className="text-4xl font-bold text-purple-400 font-mono">+{prize.toLocaleString('es-CL')}</div>
                </motion.div>
                <div className="mb-4 text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '10px 16px' }}>
                  <div className="text-sm text-white/50">Monedas Ganadas!</div>
                </div>
                <button onClick={handleClaim}
                  className="w-full h-11 rounded-xl font-medium text-sm transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }}>
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
