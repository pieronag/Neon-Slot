import { useEffect, useRef } from 'react'

const COLORS = ['#00e5ff', '#7c3aed', '#ec4899', '#00e5ff', '#a78bfa']

interface Dot {
  x: number; y: number; vx: number; vy: number; size: number; color: string
  alpha: number; pulse: number; pulseSpeed: number
}

export function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', (e) => { mouse.current = { x: e.clientX, y: e.clientY } })

    const dots: Dot[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }))

    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)

      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        d.pulse += d.pulseSpeed

        if (d.x < 0 || d.x > c.width) d.vx *= -1
        if (d.y < 0 || d.y > c.height) d.vy *= -1

        const pulseAlpha = d.alpha * (0.6 + 0.4 * Math.sin(d.pulse))
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.globalAlpha = pulseAlpha
        ctx.fill()

        const dx = d.x - mouse.current.x
        const dy = d.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const t = 1 - dist / 150
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.size + t * 3, 0, Math.PI * 2)
          ctx.fillStyle = '#00e5ff'
          ctx.globalAlpha = t * 0.6
          ctx.fill()
          ctx.shadowColor = '#00e5ff'
          ctx.shadowBlur = 20 * t
        } else {
          ctx.shadowBlur = 0
        }
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const t = 1 - dist / 120
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = dots[i].color
            ctx.globalAlpha = t * 0.15
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
}
