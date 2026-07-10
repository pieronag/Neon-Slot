import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export function WinPopup() {
  const { showWinPopup, winPopupAmount, hideWin } = useUIStore()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (showWinPopup && winPopupAmount > 0) {
      setVal(0)
      let i = 0
      const steps = 20
      const iv = setInterval(() => {
        i++
        setVal(Math.min(winPopupAmount, (winPopupAmount / steps) * i))
        if (i >= steps) clearInterval(iv)
      }, 40)
      return () => clearInterval(iv)
    }
  }, [showWinPopup, winPopupAmount])

  useEffect(() => {
    if (showWinPopup) {
      const t = setTimeout(() => hideWin(), 2500)
      return () => clearTimeout(t)
    }
  }, [showWinPopup])

  const isBig = winPopupAmount >= 1000

  return (
    <AnimatePresence>
      {showWinPopup && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: [0.3, 1.15, 1], opacity: 1, rotate: [-10, 5, 0] }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative pointer-events-auto cursor-pointer" onClick={hideWin}
          >
            <div
              className="relative px-10 py-6 sm:px-14 sm:py-8 rounded-2xl overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95), rgba(180,83,9,0.95))',
                boxShadow: '0 0 60px rgba(245,158,11,0.6), 0 0 120px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />

              <motion.div
                initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-yellow-200 mb-2"
              >
                {isBig ? '¡Gran premio!' : '¡Ganaste!'}
              </motion.div>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              >
                +{Math.round(val).toLocaleString('es-CL')}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
