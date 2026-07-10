import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useProgressionStore } from '../../store/progressionStore'
import { Button } from '../ui/Button'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">{children}</span>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  )
}

export function SidePanel() {
  const { spin, isSpinning, balance, betAmount, freeSpinsRemaining, currentMultiplier, gameMode, autoSpinCount, lossStreak, winStreak, setBet, setGameMode } = useGameStore()
  const { toggleAchievements, toggleMissions } = useUIStore()

  const { achievements, dailyMissions, level, xp } = useProgressionStore()
  const canSpin = !isSpinning && (balance >= betAmount || freeSpinsRemaining > 0)
  const handleSpin = () => { spin() }
  const nextLevelXP = (level + 1) * (level + 1) * 100

  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto px-6 py-5 gap-5" style={{ borderLeft: '0.5px solid rgba(255,255,255,0.04)' }}>

      <div>
        <SectionTitle>Apuesta</SectionTitle>
        <div className="flex items-center gap-2.5 mb-3">
          <Button variant="secondary" size="sm" disabled={betAmount <= 10 || isSpinning}
            onClick={() => setBet(Math.max(10, betAmount > 100 ? betAmount - 100 : betAmount - 10))}><Minus className="w-3.5 h-3.5" /></Button>
          <div className="flex-1 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <span className="text-xl font-bold text-white font-mono tracking-tight">{betAmount}</span>
          </div>
          <Button variant="secondary" size="sm" disabled={betAmount >= 5000 || isSpinning}
            onClick={() => setBet(Math.min(5000, betAmount >= 100 ? betAmount + 100 : betAmount + 10))}><Plus className="w-3.5 h-3.5" /></Button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[10, 100, 500, 1000, 5000].map(a => (
            <button key={a} onClick={() => setBet(a)} disabled={isSpinning}
              className={`h-9 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer ${betAmount === a ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}
            >{formatNum(a)}</button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Modo</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ id: 'normal' as const, label: 'Normal' }, { id: 'turbo' as const, label: 'Turbo' }, { id: 'auto' as const, label: gameMode === 'auto' ? `Auto ${autoSpinCount}` : 'Auto' }]
            .map(m => {
              const active = gameMode === m.id
              return <button key={m.id} onClick={() => setGameMode(m.id)} disabled={isSpinning && m.id !== 'auto'}
                className={`h-9 rounded-lg text-[10px] font-medium tracking-wide transition-all cursor-pointer ${active ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}>{m.label}</button>
            })}
        </div>
        {gameMode === 'auto' && (
          <div className="mt-2">
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 100, 0].map(n => (
                <button key={n} onClick={() => {
                  if (n === 0) { useGameStore.setState({ gameMode: 'normal', autoSpinCount: 0 }) }
                  else { useGameStore.setState({ autoSpinCount: n }) }
                }}
                  className={`h-8 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer ${n === 0 ? 'bg-white/[0.03] text-red-400 border border-red-400/30 hover:bg-red-400/10' : autoSpinCount === n ? 'bg-white text-black' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}>
                  {n === 0 ? 'Detener' : n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Progreso</SectionTitle>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button onClick={toggleAchievements} className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-[10px] font-medium cursor-pointer">{achievements.length} logros</button>
          <button onClick={toggleMissions} className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-[10px] font-medium cursor-pointer">{dailyMissions.filter(m => m.completed).length}/{dailyMissions.length} metas</button>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5">
            <span>Nivel {level}</span>
            <span className="font-mono">{xp}/{nextLevelXP} XP</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.min(100, (xp / Math.max(1, nextLevelXP)) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Jugar</SectionTitle>
        <motion.div whileHover={canSpin ? { scale: 1.01 } : {}} whileTap={canSpin ? { scale: 0.98 } : {}}>
          <button onClick={handleSpin} disabled={!canSpin}
            className={`w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${canSpin ? 'cursor-pointer bg-white text-black' : 'opacity-30 cursor-not-allowed bg-white/[0.03] text-white/60'}`}>
            {isSpinning ? 'Girando…' : freeSpinsRemaining > 0 ? `${freeSpinsRemaining} Gratis` : 'Girar'}
          </button>
        </motion.div>
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          <Button variant="secondary" size="sm" disabled={!canSpin} onClick={() => setBet(Math.min(5000, betAmount * 2))}>x2</Button>
          <Button variant="secondary" size="sm" disabled={!canSpin} onClick={() => setBet(Math.max(10, Math.floor(betAmount / 2)))}>/2</Button>
          <Button variant="secondary" size="sm" disabled={!canSpin} onClick={() => setBet(5000)}>Máx</Button>
          <Button variant="secondary" size="sm" disabled={balance <= 0} onClick={() => useGameStore.setState({ balance: 10000 })}>Reset</Button>
        </div>
      </div>

      <div className="mt-auto space-y-1.5">
        {freeSpinsRemaining > 0 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-white/40">Giros gratis</span>
            <span className="text-xs text-white font-mono font-medium">{freeSpinsRemaining}</span>
          </div>
        )}
        {currentMultiplier > 1 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-white/40">Multiplicador</span>
            <span className="text-xs text-white font-mono font-medium">{currentMultiplier}x</span>
          </div>
        )}
        {lossStreak >= 5 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-white/40">Racha perdida</span>
            <span className="text-xs text-white font-mono font-medium">{lossStreak}</span>
          </div>
        )}
        {winStreak >= 2 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-white/40">Racha ganada</span>
            <span className="text-xs text-white font-mono font-medium">{winStreak}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
