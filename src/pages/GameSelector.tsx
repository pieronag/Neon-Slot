import { useNavigate } from 'react-router-dom'
import { SpaceBackground } from '../components/ui/SpaceBackground'

export function GameSelector() {
  const nav = useNavigate()

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050505' }}>
      <SpaceBackground />
      <div className="relative z-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">ORION MACHINE</h1>
        <p className="text-sm text-white/30 mb-8">Casino Premium · Elige tu juego</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto px-4">
          <button onClick={() => nav('/slots')}
            className="p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.1), 0 0 60px rgba(255,215,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            <div className="mb-3 w-12 h-12 mx-auto"><img src="/slots.png" alt="Slots" className="w-full h-full object-contain" /></div>
            <h2 className="text-base font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Slots Clásicos</h2>
            <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
              <li>5 rodillos, 3 filas, 5 líneas de pago con Wilds y Scatters.</li>
              <li>Bonificación ×2 a ×10 por 25 giros al conseguir 3+ Scatters.</li>
              <li>Avalanchas, minijuegos interactivos y pozo global progresivo.</li>
            </ul>
          </button>
          <button onClick={() => nav('/bingo')}
            className="p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.1), 0 0 60px rgba(255,215,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            <div className="mb-3 w-12 h-12 mx-auto"><img src="/bingo.png" alt="Bingo" className="w-full h-full object-contain" /></div>
            <h2 className="text-base font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Bingo 3×5</h2>
            <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
              <li>Cartones de 3×5 con números del 1 al 90 y colores por columna.</li>
              <li>1 a 4 cartones por ronda, 30 números sorteados, 12 patrones distintos.</li>
              <li>Números extra post-ronda y cobro manual de ganancias.</li>
            </ul>
          </button>
          <button onClick={() => nav('/blackjack')}
            className="p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            style={{ border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.1), 0 0 60px rgba(255,215,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            <div className="mb-3 w-12 h-12 mx-auto"><img src="/blackjack.png" alt="Blackjack" className="w-full h-full object-contain" /></div>
            <h2 className="text-base font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Blackjack</h2>
            <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
              <li>Blackjack americano con 6 barajas, Split y Seguro.</li>
              <li>Paga 3:2 en blackjack natural. Dealer planta en 17.</li>
              <li>Double Down, hasta 4 splits, animaciones reales.</li>
            </ul>
          </button>
        </div>
      </div>
    </div>
  )
}
