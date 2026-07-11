import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ROULETTE_NUMBERS, getColor } from '../../lib/rouletteEngine'

const COLORS: Record<string, string> = { red: '#e74c3c', black: '#1a1a2e', green: '#27ae60' }
const FLIP_NUMS = new Set([9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34])

export function RouletteWheel({ spinning, winner, onStopped }: { spinning: boolean; winner: number | null; onStopped?: () => void }) {
  const segAngle = 360 / ROULETTE_NUMBERS.length
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'decel' | 'done'>('idle')
  const [targetRotation, setTargetRotation] = useState(0)
  const spinRef = useRef<number>(360 - 0.5 * segAngle)
  const prevSpin = useRef(false)
  const rafRef = useRef<number | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const cx = 250, cy = 250, r = 240

  // Cleanup rAF on unmount
  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }, [])

  // Spin logic + deceleration (combined to avoid race conditions with prevSpin)
  useEffect(() => {
    if (spinning && !prevSpin.current) {
      // Start spinning
      setPhase('spinning')
      spinRef.current += 360 * 3 // jump 3 turns immediately
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${spinRef.current}deg)`

      const SPIN_SPEED = segAngle * 5 * 10 // ~486.5°/s
      let prevTime = 0
      const frame = (time: number) => {
        if (prevTime === 0) prevTime = time
        const dt = (time - prevTime) / 1000
        prevTime = time
        spinRef.current += SPIN_SPEED * dt
        if (wheelRef.current) wheelRef.current.style.transform = `rotate(${spinRef.current}deg)`
        rafRef.current = requestAnimationFrame(frame)
      }
      rafRef.current = requestAnimationFrame(frame)
    } else if (!spinning && prevSpin.current && winner !== null) {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }

      const winIdx = ROULETTE_NUMBERS.indexOf(winner)
      const desiredMod = 360 - (winIdx + 0.5) * segAngle
      const currentMod = ((spinRef.current % 360) + 360) % 360
      let delta = desiredMod - currentMod
      if (delta < 0) delta += 360
      delta += 6 * 360
      const target = spinRef.current + delta
      setTargetRotation(target)
      setPhase('decel')
    }
    prevSpin.current = spinning
  }, [spinning, winner])

  const handleComplete = () => {
    spinRef.current = targetRotation
    if (wheelRef.current) wheelRef.current.style.transform = `rotate(${spinRef.current}deg)`
    setPhase('done')
    onStopped?.()
  }

  const segments = ROULETTE_NUMBERS.map((n, i) => {
    const a1 = ((i * segAngle - 90) * Math.PI) / 180
    const a2 = (((i + 1) * segAngle - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2)
    const y2 = cy + r * Math.sin(a2)
    const midAngle = ((i + 0.5) * segAngle - 90) * Math.PI / 180
    const labelR = 200
    const lx = cx + labelR * Math.cos(midAngle)
    const ly = cy + labelR * Math.sin(midAngle)
    const color = getColor(n)
    const largeArc = segAngle > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { n, d, color, lx, ly, midAngle: (i + 0.5) * segAngle, isWinner: n === winner && phase === 'done' }
  })

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[500px] aspect-square mx-auto my-1">
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={phase !== 'done' ? { scale: [1, 1.04, 1], opacity: [0.3, 0.5, 0.3] } : { scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.1) 30%, transparent 70%)', filter: 'blur(20px)' }}
      />

      {ROULETTE_NUMBERS.map((_, i) => {
        const angle = segAngle * i + segAngle * 0.25
        const rPct = 248 / 500 * 100 // 49.6% of container
        return (
          <div key={i} className="absolute rounded-full z-10" style={{
            width: '8px', height: '8px',
            background: 'radial-gradient(circle, #fff, #ffd700)',
            left: `calc(50% + ${rPct * Math.cos((angle * Math.PI) / 180)}%)`,
            top: `calc(50% + ${rPct * Math.sin((angle * Math.PI) / 180)}%)`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 4px rgba(255,215,0,0.5)',
          }} />
        )
      })}

      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ marginTop: '-6px' }}
        animate={phase === 'spinning' ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: phase === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}>
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]" />
        </div>
      </motion.div>

      {/* Spinning: Direct CSS transform */}
      <div ref={wheelRef} className="w-full h-full relative z-5"
        style={{ transform: `rotate(${spinRef.current}deg)` }}>
        <svg viewBox="0 0 500 500" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.4))' }}>
          <circle cx="250" cy="250" r="248" fill="none" stroke="url(#goldGrad)" strokeWidth="6" />
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B6914" /><stop offset="50%" stopColor="#ffd700" /><stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
          </defs>
          {segments.map((seg, i) => {
            const needFlip = FLIP_NUMS.has(seg.n)
            const baseRot = seg.midAngle > 90 && seg.midAngle < 270 ? seg.midAngle + 180 : seg.midAngle
            const rot = needFlip ? baseRot + 180 : baseRot
            return (
              <g key={i}>
                <path d={seg.d} fill={COLORS[seg.color]} opacity="0.95"
                  stroke={seg.isWinner ? 'rgba(255,215,0,0.9)' : 'rgba(0,0,0,0.15)'}
                  strokeWidth={seg.isWinner ? 2.5 : 0.5}
                  style={seg.isWinner ? { filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' } : {}}
                />
                <text x={seg.lx} y={seg.ly} fill="#fff" fontSize="14" fontWeight="bold"
                  textAnchor="middle" dominantBaseline="central"
                  transform={`rotate(${rot}, ${seg.lx}, ${seg.ly})`}
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{seg.n}</text>
              </g>
            )
          })}
          <circle cx="250" cy="250" r="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="85" fill="url(#hubGrad)" stroke="rgba(255,215,0,0.15)" strokeWidth="1" />
          <defs>
            <radialGradient id="hubGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#2a2a4a" /><stop offset="70%" stopColor="#0d0d1a" /><stop offset="100%" stopColor="#050508" />
            </radialGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ width: '170px', margin: 'auto', top: 0, bottom: 0, left: 0, right: 0 }}>
          <motion.div
            animate={phase === 'spinning' || phase === 'decel' ? { rotate: 360 } : { scale: [1, 1.12, 1] }}
            transition={(phase === 'spinning' || phase === 'decel') ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 1.5, repeat: Infinity }}>
            <span className="text-2xl" style={{ color: 'rgba(255,215,0,0.3)' }}>✦</span>
          </motion.div>
        </div>
      </div>

      {/* Deceleration overlay: framer-motion animated */}
      {phase === 'decel' && (
        <motion.div
          className="absolute inset-0 z-10"
          initial={{ rotate: spinRef.current }}
          animate={{ rotate: targetRotation }}
          transition={{ duration: 7, ease: [0.1, 0.5, 0.05, 1] }}
          onAnimationComplete={handleComplete}
        >
          <svg viewBox="0 0 500 500" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.4))' }}>
            <circle cx="250" cy="250" r="248" fill="none" stroke="url(#goldGrad)" strokeWidth="6" />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B6914" /><stop offset="50%" stopColor="#ffd700" /><stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
            </defs>
            {segments.map((seg, i) => {
              const needFlip = FLIP_NUMS.has(seg.n)
              const baseRot = seg.midAngle > 90 && seg.midAngle < 270 ? seg.midAngle + 180 : seg.midAngle
              const rot = needFlip ? baseRot + 180 : baseRot
              return (
                <g key={i}>
                  <path d={seg.d} fill={COLORS[seg.color]} opacity="0.95"
                    stroke={seg.isWinner ? 'rgba(255,215,0,0.9)' : 'rgba(0,0,0,0.15)'}
                    strokeWidth={seg.isWinner ? 2.5 : 0.5}
                    style={seg.isWinner ? { filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' } : {}}
                  />
                  <text x={seg.lx} y={seg.ly} fill="#fff" fontSize="14" fontWeight="bold"
                    textAnchor="middle" dominantBaseline="central"
                    transform={`rotate(${rot}, ${seg.lx}, ${seg.ly})`}
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{seg.n}</text>
                </g>
              )
            })}
            <circle cx="250" cy="250" r="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="85" fill="url(#hubGrad)" stroke="rgba(255,215,0,0.15)" strokeWidth="1" />
            <defs>
              <radialGradient id="hubGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#2a2a4a" /><stop offset="70%" stopColor="#0d0d1a" /><stop offset="100%" stopColor="#050508" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      )}
    </div>
  )
}
