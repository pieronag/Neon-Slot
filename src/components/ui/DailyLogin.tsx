import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Star, Zap, Crown, Flame } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'

const DAILY_REWARDS = [200, 400, 600, 800, 1000, 1500, 3000]
const STREAK_BONUS = [0, 0, 50, 100, 200, 300, 500, 1000]
const DAY_ICONS = [Gift, Star, Zap, Gift, Star, Zap, Crown]

export function DailyLogin() {
  const { showDailyLogin } = useUIStore()
  const { dailyLoginDay, dailyLoginClaimed, claimDailyLogin } = useProgressionStore()

  if (!showDailyLogin) return null

  const dayReward = DAILY_REWARDS[Math.min(dailyLoginDay - 1, DAILY_REWARDS.length - 1)]
  const streakBonus = STREAK_BONUS[Math.min(dailyLoginDay, STREAK_BONUS.length - 1)]
  const total = dayReward + streakBonus

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => useUIStore.setState({ showDailyLogin: false })} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md rounded-2xl p-6"
          style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
              <Gift className="w-5 h-5 text-white/60" />
            </div>
            <h2 className="text-base font-semibold text-white">Recompensa diaria</h2>
            <p className="text-xs text-white/40 mt-1">Día {dailyLoginDay} de 7</p>
            {dailyLoginDay >= 2 && (
              <p className="text-[10px] text-yellow-400/60 mt-0.5 flex items-center justify-center gap-1"><Flame className="w-3 h-3" /> Racha de {dailyLoginDay} días</p>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {DAILY_REWARDS.map((reward, i) => {
              const isToday = i === dailyLoginDay - 1
              const isPast = i < dailyLoginDay - 1
              const Icon = DAY_ICONS[i]
              return (
                <div key={i}
                  className={`rounded-lg p-2 text-center transition-all ${
                    isToday ? 'bg-white/[0.06] border border-white/20' : isPast ? 'border border-white/[0.06] opacity-40' : 'border border-white/[0.06] opacity-25'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${isToday ? 'text-white' : 'text-white/40'}`} />
                  <div className="text-[10px] font-bold text-white font-mono">{reward}</div>
                  {isPast && <div className="text-[8px] text-white/40 mt-0.5">✓</div>}
                  {isToday && !dailyLoginClaimed && <div className="w-1 h-1 rounded-full bg-white mx-auto mt-1" />}
                </div>
              )
            })}
          </div>

          {dailyLoginDay >= 3 && (
            <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-400/5 border border-yellow-400/10">
              <span className="text-[10px] text-yellow-400/80 flex items-center gap-1"><Flame className="w-3 h-3" /> Bono racha: +{streakBonus}</span>
            </div>
          )}

          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-white font-mono">+{total}</span>
            <span className="text-xs text-white/40 ml-2">monedas</span>
          </div>

          <button
            disabled={dailyLoginClaimed}
            onClick={() => { claimDailyLogin(); useUIStore.setState({ showDailyLogin: false }) }}
            className="w-full h-11 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {dailyLoginClaimed ? 'Reclamado' : 'Reclamar'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
