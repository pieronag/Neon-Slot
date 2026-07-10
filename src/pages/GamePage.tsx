import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { useProgressionStore } from '../store/progressionStore'
import { musicManager } from '../lib/musicManager'
import { SpaceBackground } from '../components/ui/SpaceBackground'
import { Header } from '../components/casino/Header'
import { SlotBoard } from '../components/slots/SlotBoard'
import { SidePanel } from '../components/casino/SidePanel'
import { WinPopup } from '../components/ui/WinPopup'
import { FortuneWheel } from '../components/ui/FortuneWheel'
import { DoubleOrNothing } from '../components/ui/DoubleOrNothing'
import { DailyLogin } from '../components/ui/DailyLogin'
import { LevelUp } from '../components/ui/LevelUp'
import { MissionsModal } from '../components/ui/MissionsModal'
import { AchievementsModal } from '../components/ui/AchievementsModal'
import { GlossaryModal } from '../components/ui/GlossaryModal'
import { ProfileModal } from '../components/ui/ProfileModal'
import { Notifications } from '../components/ui/Notifications'
import { useIsMobile } from '../hooks/useIsMobile'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Target, TrendingUp, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function GamePage() {
  const isMobile = useIsMobile()
  const nav = useNavigate()
  const { logout } = useAuthStore()
  const showMobileMenu = useUIStore(s => s.mobilePanelOpen)
  const setShowMobileMenu = useUIStore(s => s.setMobilePanel)
  const { toggleAchievements, toggleMissions, toggleGlossary, setShowProfile } = useUIStore()

  useEffect(() => {
    musicManager.setEnabled(true)
    musicManager.start()
    const show = useProgressionStore.getState().checkDailyLogin()
    if (show) useUIStore.setState({ showDailyLogin: true })
    const seen = localStorage.getItem('ns_tut')
    if (!seen) useUIStore.setState({ showTutorial: true })
    return () => musicManager.stop()
  }, [])

  const mobileMenuItems = [
    { label: 'Metas', icon: Target, action: () => { toggleMissions(); setShowMobileMenu(false) } },
    { label: 'Logros', icon: Trophy, action: () => { toggleAchievements(); setShowMobileMenu(false) } },
    { label: 'Premios', icon: TrendingUp, action: () => { toggleGlossary(); setShowMobileMenu(false) } },
    { label: 'Perfil', icon: User, action: () => { setShowProfile(true); setShowMobileMenu(false) } },
    { label: 'Cerrar sesión', icon: LogOut, action: async () => { await logout(); nav('/login') }, danger: true },
  ]

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{ background: '#050505' }}>
      <SpaceBackground />
      <Header />

      {isMobile ? (
        <div className="flex-1 flex flex-col min-h-0 relative z-10">
          <div className="flex-shrink-0 min-h-0" style={{ flex: '0 0 45%' }}>
            <SlotBoard />
          </div>
          <div className="flex-shrink-0 overflow-y-auto border-t border-white/[0.04]" style={{ flex: '0 0 55%' }}>
            <SidePanel />
          </div>

          <AnimatePresence>
            {showMobileMenu && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 z-40" onClick={() => setShowMobileMenu(false)} />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute right-0 top-0 bottom-0 z-50 w-[280px]"
                  style={{ background: '#050505', borderLeft: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <span className="text-sm font-semibold text-white">Menú</span>
                    <button onClick={() => setShowMobileMenu(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    {mobileMenuItems.map(item => (
                      <button key={item.label} onClick={item.action}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-white/70 hover:text-white'} hover:bg-white/[0.04]`}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <main className="flex-1 flex flex-row min-h-0 w-full px-4 py-3 gap-4 relative z-10">
          <div className="flex-1 min-w-0 h-full"><SlotBoard /></div>
          <div className="w-[340px] lg:w-[380px] flex-shrink-0 h-full"><SidePanel /></div>
        </main>
      )}

      <WinPopup />
      <FortuneWheel />
      <DoubleOrNothing />
      <DailyLogin />
      <LevelUp />
      <MissionsModal />
      <AchievementsModal />
      <GlossaryModal />
      <ProfileModal />
      <Notifications />
    </div>
  )
}
