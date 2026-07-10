import { useEffect, useRef } from 'react'

export function SpaceBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3, speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }))

    const orbs = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 300, color: 'rgba(0,229,255' },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, r: 250, color: 'rgba(181,55,242' },
    ]

    let timer = 0
    let frame: number

    const draw = () => {
      timer++
      ctx.fillStyle = '#12121f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const o of orbs) {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        g.addColorStop(0, `${o.color}, 0.04)`)
        g.addColorStop(0.5, `${o.color}, 0.02)`)
        g.addColorStop(1, `${o.color}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill()
      }

      for (const star of stars) {
        const t = Math.sin(timer * star.speed + star.phase)
        ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * t})`
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
}
