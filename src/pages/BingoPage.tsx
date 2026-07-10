import { useEffect } from 'react'
import { SpaceBackground } from '../components/ui/SpaceBackground'
import { Header } from '../components/casino/Header'
import { BingoBoard } from '../components/bingo/BingoBoard'
import { DailyLogin } from '../components/ui/DailyLogin'
import { LevelUp } from '../components/ui/LevelUp'
import { MissionsModal } from '../components/ui/MissionsModal'
import { AchievementsModal } from '../components/ui/AchievementsModal'
import { GlossaryModal } from '../components/ui/GlossaryModal'
import { ProfileModal } from '../components/ui/ProfileModal'
import { Notifications } from '../components/ui/Notifications'
import { useProgressionStore } from '../store/progressionStore'
import { useUIStore } from '../store/uiStore'

export function BingoPage() {
  useEffect(() => {
    const show = useProgressionStore.getState().checkDailyLogin()
    if (show) useUIStore.setState({ showDailyLogin: true })
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{ background: '#050505' }}>
      <SpaceBackground />
      <Header />
      <main className="flex-1 min-h-0 relative z-10">
        <BingoBoard />
      </main>
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
