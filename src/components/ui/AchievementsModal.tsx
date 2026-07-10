import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Target, Zap, Star, Crown, DollarSign, TrendingUp, X, Flame, Calendar, CheckCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'

const ACHIEVEMENTS = [
  { id: 'first_spin', name: 'Primer Giro', desc: 'Gira una Vez', icon: Target, check: (_s: number, _w: number, _l: number) => true },
  { id: 'spin_25', name: '25 Giros', desc: 'Gira 25 Veces', icon: Zap, check: (s: number) => s >= 25 },
  { id: 'spin_100', name: '100 Giros', desc: 'Gira 100 Veces', icon: Zap, check: (s: number) => s >= 100 },
  { id: 'spin_500', name: '500 Giros', desc: 'Gira 500 Veces', icon: Zap, check: (s: number) => s >= 500 },
  { id: 'spin_1000', name: '1000 Giros', desc: 'Gira 1000 Veces', icon: Flame, check: (s: number) => s >= 1000 },
  { id: 'win_10', name: '+10 Ganado', desc: 'Gana 10 Monedas', icon: DollarSign, check: (_s: number, w: number) => w >= 10 },
  { id: 'win_100', name: '+100 Ganado', desc: 'Gana 100 Monedas', icon: DollarSign, check: (_s: number, w: number) => w >= 100 },
  { id: 'win_1000', name: '+1000 Ganado', desc: 'Gana 1000 Monedas', icon: TrendingUp, check: (_s: number, w: number) => w >= 1000 },
  { id: 'win_5000', name: '+5000 Ganado', desc: 'Gana 5000 Monedas', icon: Crown, check: (_s: number, w: number) => w >= 5000 },
  { id: 'win_10000', name: '+10000 Ganado', desc: 'Gana 10000 Monedas', icon: Crown, check: (_s: number, w: number) => w >= 10000 },
  { id: 'jackpot_win', name: 'Jackpot', desc: 'Gana el Pozo Global', icon: Star, check: () => false },
  { id: 'level_5', name: 'Nivel 5', desc: 'Alcanza Nivel 5', icon: Trophy, check: (_s: number, _w: number, l: number) => l >= 5 },
  { id: 'level_10', name: 'Nivel 10', desc: 'Alcanza Nivel 10', icon: Trophy, check: (_s: number, _w: number, l: number) => l >= 10 },
  { id: 'level_25', name: 'Nivel 25', desc: 'Alcanza Nivel 25', icon: Crown, check: (_s: number, _w: number, l: number) => l >= 25 },
  { id: 'login_3', name: '3 Días', desc: 'Inicia Sesión 3 Días Seguidos', icon: Calendar, check: () => false },
  { id: 'login_7', name: '7 Días', desc: 'Inicia Sesión 7 Días Seguidos', icon: Flame, check: () => false },
  { id: 'mission_1', name: 'Cumplidor', desc: 'Completa 1 Meta', icon: CheckCircle, check: () => false },
  { id: 'mission_5', name: 'Entusiasta', desc: 'Completa 5 Metas', icon: Star, check: () => false },
]

export function AchievementsModal() {
  const { showAchievements, toggleAchievements } = useUIStore()
  const { achievements, level, xp, sessionSpins, sessionWins } = useProgressionStore()
  const nextXP = (level + 1) * (level + 1) * 100

  return (
    <AnimatePresence>
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleAchievements} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[1200px] max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:p-8"
            style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Logros</h2>
              <button onClick={toggleAchievements} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Nivel {level}</span>
                <span className="text-xs text-white/40 font-mono">{xp} / {nextXP} XP</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.min(100, (xp / Math.max(1, nextXP)) * 100)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ACHIEVEMENTS.map(a => {
                const unlocked = achievements.includes(a.id) || a.check(sessionSpins, sessionWins, level)
                const Icon = a.icon
                return (
                  <div key={a.id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${unlocked ? '' : 'opacity-40'}`}
                    style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${unlocked ? 'text-white/60' : 'text-white/20'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-white/40'}`}>{a.name}</div>
                      <div className="text-xs text-white/30 mt-0.5">{a.desc}</div>
                    </div>
                    {unlocked && <span className="text-white/40 text-xs">✓</span>}
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
