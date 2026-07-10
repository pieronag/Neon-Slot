import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Trophy, Target, LogOut, ChevronDown, User, TrendingUp } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'
import { useAuthStore } from '../../store/authStore'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const nav = useNavigate()
  const balance = useGameStore(s => s.balance)
  const level = useProgressionStore(s => s.level)
  const { profile, logout, globalJackpot } = useAuthStore()
  const { toggleAchievements, toggleMissions, toggleGlossary, setShowProfile, setMobilePanel } = useUIStore()

  return (
    <header className="w-full px-5 py-3 flex-shrink-0 relative z-30" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)' }}>
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-bold text-white tracking-tight">NEON SLOTS</span>
          <span className="hidden sm:inline text-[10px] text-white/20 uppercase tracking-wider font-medium ml-1">Casino</span>
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] text-[11px] text-white/60 font-mono">
            Nvl {level}
          </span>
        </div>

        <div style={{ border: '0.5px solid rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.04)' }} className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_rgba(255,215,0,0.6)]" />
          <div className="text-center">
            <div className="text-[8px] text-yellow-600/60 uppercase tracking-wider font-semibold">Pozo global</div>
            <div className="text-sm font-bold text-yellow-400 font-mono">{formatNum(globalJackpot)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80 font-mono font-medium">{formatNum(balance)}</span>

          <button onClick={() => setMobilePanel(true)} className="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/60 hover:text-white transition-all cursor-pointer">
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="h-4 w-px bg-white/[0.06]" />
            <button onClick={toggleMissions} className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[11px] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer font-medium">
              <Target className="w-3.5 h-3.5" /> Metas
            </button>
            <button onClick={toggleAchievements} className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[11px] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer font-medium">
              <Trophy className="w-3.5 h-3.5" /> Logros
            </button>
            <button onClick={toggleGlossary} className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[11px] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Premios
            </button>

            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer text-sm text-white/60 hover:text-white">
                <User className="w-4 h-4" />
                {profile?.displayName || 'Cuenta'}
                <ChevronDown className="w-3 h-3 text-white/30" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-10 z-50 w-44 rounded-xl py-1.5 bg-[#0a0a14] border border-white/[0.08] shadow-2xl">
                    <button onClick={() => { setShowProfile(true); setShowMenu(false) }} className="w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] text-left cursor-pointer">Perfil</button>
                    <div className="mx-3 h-px bg-white/[0.06]" />
                    <button onClick={async () => { setShowMenu(false); await logout(); nav('/login') }} className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] text-left cursor-pointer flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
