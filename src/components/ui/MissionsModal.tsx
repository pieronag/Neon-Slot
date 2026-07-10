import { motion, AnimatePresence } from 'framer-motion'
import { Target, Trophy, Zap, X, Grid3X3 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'

const MISSION_ICONS: Record<string, typeof Target> = {
  spin: Zap,
  win: Target,
  bonus: Trophy,
  bingo: Grid3X3,
}

export function MissionsModal() {
  const { showMissions, toggleMissions } = useUIStore()
  const { dailyMissions } = useProgressionStore()
  const location = useLocation()
  const isBingo = location.pathname === '/bingo'

  return (
    <AnimatePresence>
      {showMissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleMissions} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Metas Diarias {isBingo ? '- Bingo' : ''}</h2>
              <button onClick={toggleMissions} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {dailyMissions.filter(m => {
                if (isBingo) return m.id.startsWith('bingo') || m.id.startsWith('win') || m.id.startsWith('bonus')
                return m.id.startsWith('spin') || m.id.startsWith('win') || m.id.startsWith('bonus')
              }).map(m => {
                const iconId = m.id.startsWith('spin') ? 'spin' : m.id.startsWith('win') ? 'win' : m.id.startsWith('bingo') ? 'bingo' : 'bonus'
                const Icon = MISSION_ICONS[iconId] || Target
                return (
                  <div key={m.id} className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-5 h-5 text-white/40 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white">{m.name}</div>
                          <div className="text-xs text-white/40 mt-0.5">{m.description}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-xs font-bold text-white font-mono">{m.reward}</div>
                        <div className="text-[9px] text-white/30">Monedas</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-white transition-all duration-300"
                          style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }} />
                      </div>
                      <span className={`text-xs font-mono font-medium ${m.completed ? 'text-white' : 'text-white/40'}`}>
                        {Math.min(m.progress, m.target)}/{m.target}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
