import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'

export function LevelUp() {
  const { showLevelUp } = useUIStore()
  const { level } = useProgressionStore()

  return (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div
            className="px-6 py-3 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(181,55,242,0.3))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,240,255,0.4)',
              boxShadow: '0 0 30px rgba(0,240,255,0.4)',
            }}
          >
            <div className="text-[10px] text-[#00f0ff] uppercase tracking-[0.2em] font-bold">Level Up!</div>
            <div className="text-2xl font-black text-white mt-1">Level {level}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
