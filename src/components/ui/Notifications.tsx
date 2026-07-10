import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export function Notifications() {
  const notifications = useUIStore(s => s.notifications)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="w-full px-4 py-2.5 rounded-xl border backdrop-blur-sm text-xs font-bold flex items-center gap-2.5"
            style={{
              background: n.type === 'win' ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.1))' : 'rgba(26,26,46,0.9)',
              borderColor: n.type === 'win' ? 'rgba(255,215,0,0.4)' : '#34344f',
              color: n.type === 'win' ? '#ffd700' : '#e5e7eb',
            }}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
