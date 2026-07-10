import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SymbolIcon } from '../ui/SymbolIcon'

interface ReelProps {
  symbols: string[]; spinning: boolean; reelIndex: number
  cellSize: number; highlight?: boolean[]; turbo?: boolean
}

const POOL = ['diamond','seven','bell','star','heart','crown','coin','wild','scatter',
  'diamond','seven','bell','star','heart','crown','coin']

export function Reel({ symbols, spinning, reelIndex, cellSize, highlight, turbo }: ReelProps) {
  const [displayed, setDisplayed] = useState(symbols)
  const [phase, setPhase] = useState<'idle'|'spin'|'stop'>('idle')
  const [tick, setTick] = useState(0)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const mounted = useRef(true)

  const stopDelay = useMemo(() => turbo ? 100 + reelIndex * 120 : 600 + reelIndex * 450, [reelIndex, turbo])
  const iconSize = Math.round(cellSize * 0.65)
  const gap = Math.max(3, Math.round(cellSize * 0.05))

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  useEffect(() => {
    ivRef.current && clearInterval(ivRef.current)
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (!spinning) {
      setDisplayed(symbols)
      setPhase('idle')
      return
    }

    setPhase('spin')
    ivRef.current = setInterval(() => {
      if (!mounted.current) return
      setDisplayed(prev => prev.map(() => POOL[Math.floor(Math.random() * POOL.length)]))
      setTick(t => t + 1)
    }, turbo ? 35 : 55)

    const t1 = setTimeout(() => {
      if (!mounted.current) return
      ivRef.current && clearInterval(ivRef.current)
      setDisplayed(symbols)
      setPhase('stop')

      const t2 = setTimeout(() => {
        if (mounted.current) setPhase('idle')
      }, 500)
      timers.current.push(t2)
    }, stopDelay)
    timers.current.push(t1)

    return () => {
      ivRef.current && clearInterval(ivRef.current)
      timers.current.forEach(clearTimeout)
    }
  }, [spinning])

  const showHL = !spinning && phase === 'idle'

  return (
    <div className="flex flex-col relative" style={{ gap }}>
      {displayed.map((sid, idx) => {
        const hl = showHL && highlight?.[idx]
        return (
          <motion.div
            key={phase === 'spin' ? `r${reelIndex}-${idx}-${tick}` : `${reelIndex}-${idx}`}
            className="relative overflow-hidden flex items-center justify-center"
            style={{
              width: cellSize, height: cellSize,
              borderRadius: Math.round(cellSize * 0.12),
              background: hl ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: hl ? '0.5px solid rgba(255,255,255,0.5)' : '0.5px solid rgba(255,255,255,0.06)',
            }}
            initial={false}
            animate={phase === 'stop' ? {
              scale: [1.4, 1.1, 0.96, 1.01, 1],
              opacity: [0.4, 0.7, 0.95, 1, 1],
              rotateX: [35, 12, 0, -2, 0],
              y: [-4, -1, 1, -1, 0],
              filter: ['blur(3px) brightness(0.6)', 'blur(1px) brightness(0.85)', 'blur(0px) brightness(1)', 'blur(0px) brightness(1)', 'blur(0px) brightness(1)'],
            } : hl ? {
              scale: [1, 1.08, 1],
            } : {
              scale: 1, opacity: 1, rotateX: 0, y: 0, filter: 'blur(0px) brightness(1)',
            }}
            transition={phase === 'stop' ? {
              duration: 0.45,
              delay: idx * 0.05,
              ease: [0.12, 0.75, 0.25, 1.05],
            } : hl ? { duration: 0.7, repeat: Infinity } : { duration: 0.15 }}
          >
            <div className="relative z-10">
              <SymbolIcon symbolId={sid} size={iconSize} animated={hl} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
