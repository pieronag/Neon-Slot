import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CircleDollarSign } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ui/Button'

export function DoubleOrNothing() {
  const { showDouble, doubleAmount, hideDouble, addNotification } = useUIStore()
  const [state, setState] = useState<'choose' | 'flipping' | 'result'>('choose')
  const [won, setWon] = useState(false)
  const [choice, setChoice] = useState<'C' | 'X'>('C')

  const handleChoice = (c: 'C' | 'X') => {
    if (state !== 'choose') return
    setChoice(c)
    setState('flipping')
    const result = Math.random() > 0.5
    const win = (c === 'C' && result) || (c === 'X' && !result)

    setTimeout(() => {
      setWon(win)
      setState('result')
      if (win) {
        useGameStore.setState({ balance: useGameStore.getState().balance + doubleAmount })
        addNotification(`Doble o nada: Ganaste +${Math.round(doubleAmount).toLocaleString('es-CL')}`, 'win')
      } else {
        useGameStore.setState({ balance: useGameStore.getState().balance - doubleAmount })
        addNotification(`Doble o nada: Perdiste ${Math.round(doubleAmount).toLocaleString('es-CL')}`, 'info')
      }
    }, 1800)
  }

  const handleClose = () => {
    setState('choose')
    setWon(false)
    hideDouble()
  }

  if (!showDouble) return null

  const coinResult = state === 'result' ? (won ? choice : (choice === 'C' ? 'X' : 'C')) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Doble o nada</h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-xs text-white/40 mb-2">Apuesta tu ganancia</div>
          <div className="text-3xl font-bold text-white font-mono">{Math.round(doubleAmount).toLocaleString('es-CL')}</div>
        </div>

        <div className="flex justify-center mb-6 perspective-500">
          <motion.div
            className="w-32 h-32 rounded-full flex items-center justify-center cursor-default"
            style={{
              background: state === 'result'
                ? (won ? 'linear-gradient(135deg, #ffd700, #f59e0b)' : 'linear-gradient(135deg, #666, #444)')
                : 'linear-gradient(135deg, #ffd700, #f59e0b)',
              border: state === 'result' && !won ? '3px solid #555' : '3px solid rgba(255,215,0,0.6)',
              boxShadow: won
                ? '0 0 40px rgba(255,215,0,0.5), inset 0 -3px 8px rgba(0,0,0,0.2)'
                : state === 'result'
                  ? '0 0 20px rgba(100,100,100,0.3), inset 0 -3px 8px rgba(0,0,0,0.3)'
                  : '0 0 30px rgba(255,215,0,0.3), inset 0 -3px 8px rgba(0,0,0,0.15)',
            }}
            animate={state === 'flipping' ? {
              rotateY: [0, 180, 360, 540, 720, 900, 1080, 1260, 1440],
              scale: [1, 1.1, 0.9, 1.05, 0.95, 1],
            } : state === 'result' ? { rotateY: 0, scale: 1 } : {}}
            transition={state === 'flipping' ? { duration: 1.8, ease: 'easeInOut' } : { duration: 0.4 }}
          >
            <div className="text-center">
              {state === 'flipping' ? (
                <>
                  <div className="text-lg font-black text-[#8B6914]">$</div>
                  <div className="text-[8px] text-[#8B6914] font-bold mt-0.5">NEON</div>
                </>
              ) : state === 'result' ? (
                <>
                  <div className={`text-3xl font-black ${won ? 'text-[#8B6914]' : 'text-[#333]'}`}>
                    {coinResult === 'C' ? 'C' : 'X'}
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${won ? 'text-[#8B6914]' : 'text-[#333]'}`}>
                    {won ? 'GANASTE' : 'PERDISTE'}
                  </div>
                </>
              ) : (
                <>
                  <CircleDollarSign className="w-8 h-8 mx-auto text-[#8B6914]" />
                  <div className="text-[8px] text-[#8B6914] font-bold mt-0.5">NEON</div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {state === 'choose' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleChoice('C')}
                className="h-13 rounded-xl font-bold text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:bg-white/[0.08] transition-all cursor-pointer">
                Cara
              </button>
              <button onClick={() => handleChoice('X')}
                className="h-13 rounded-xl font-bold text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:bg-white/[0.08] transition-all cursor-pointer">
                Cruz
              </button>
            </div>
            <button onClick={handleClose}
              className="w-full h-10 rounded-xl text-xs text-white/30 hover:text-white/60 transition-all cursor-pointer">
              Rechazar y cobrar
            </button>
          </div>
        )}

        {state === 'result' && (
          <div className="text-center space-y-3 mt-2">
            <div className={`text-sm font-semibold ${won ? 'text-yellow-400' : 'text-white/50'}`}>
              {won ? `+${Math.round(doubleAmount).toLocaleString('es-CL')}` : `-${Math.round(doubleAmount).toLocaleString('es-CL')}`}
            </div>
            <Button variant={won ? 'primary' : 'secondary'} size="md" fullWidth onClick={handleClose} className="h-11">
              {won ? 'Reclamar' : 'Cerrar'}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
