import { motion } from 'framer-motion'
import { X, Trophy, DollarSign, TrendingUp, LogOut, Gamepad2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useProgressionStore } from '../../store/progressionStore'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function ProfileModal() {
  const { showProfile, setShowProfile } = useUIStore()
  const { user, profile, logout } = useAuthStore()
  const { level, xp } = useProgressionStore()
  if (!showProfile || !user || !profile) return null

  const totalBets = profile.totalBets || 1
  const nextLevelXP = (level + 1) * (level + 1) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProfile(false)} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Mi perfil</h2>
          <button onClick={() => setShowProfile(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mb-5 p-5 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-bold text-white">{profile.displayName.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-base font-semibold text-white">{profile.displayName}</h2>
          <p className="text-xs text-white/40 mt-1">{user.email}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <div className="px-2 py-2.5 rounded-lg" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-white/40 uppercase">Nivel</div>
              <div className="text-lg font-bold text-white font-mono mt-1">{level}</div>
            </div>
            <div className="px-2 py-2.5 rounded-lg" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-white/40 uppercase">Saldo</div>
              <div className="text-lg font-bold text-white font-mono mt-1">${formatNum(profile.balance)}</div>
            </div>
            <div className="px-2 py-2.5 rounded-lg" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-white/40 uppercase">Giros</div>
              <div className="text-lg font-bold text-white font-mono mt-1">{profile.totalSpins}</div>
            </div>
            <div className="px-2 py-2.5 rounded-lg" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-white/40 uppercase">XP</div>
              <div className="text-lg font-bold text-white font-mono mt-1">{xp}</div>
            </div>
          </div>
          <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.min(100, (xp / Math.max(1, nextLevelXP)) * 100)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400/60" />
              <span className="text-[10px] text-white/40">Total ganado</span>
            </div>
            <div className="text-lg font-bold text-green-400 font-mono">${formatNum(profile.totalWins)}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-red-400/60" />
              <span className="text-[10px] text-white/40">Total apostado</span>
            </div>
            <div className="text-lg font-bold text-red-400 font-mono">${formatNum(totalBets)}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="w-4 h-4 text-green-400/60" />
              <span className="text-[10px] text-white/40">Minijuegos Ganado</span>
            </div>
            <div className="text-lg font-bold text-green-400 font-mono">${formatNum(profile.minigameWins)}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-white/40" />
              <span className="text-[10px] text-white/40">Mayor ganancia</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">${formatNum(profile.biggestWin)}</div>
          </div>
        </div>

        {profile.lastConnection && (
          <div className="mb-4 text-center">
            <span className="text-[10px] text-white/30">
              Última conexión: {new Date(profile.lastConnection).toLocaleString('es-CL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        )}

        <button onClick={() => { logout(); window.location.href = '/login' }}
          className="w-full h-11 rounded-xl text-sm text-red-400 hover:text-red-300 bg-white/[0.03] hover:bg-white/[0.05] transition-all cursor-pointer flex items-center justify-center gap-2 font-medium">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </motion.div>
    </div>
  )
}
