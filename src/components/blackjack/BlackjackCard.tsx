import { motion } from 'framer-motion'
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types/blackjack'
import type { Card } from '../../types/blackjack'

export function BlackjackCard({ card, index = 0, huge = false }: { card: Card; index?: number; huge?: boolean }) {
  const color = SUIT_COLORS[card.suit]
  const symbol = SUIT_SYMBOLS[card.suit]
  const w = huge ? 90 : 60
  const h = huge ? 126 : 84
  const rankSize = huge ? 20 : 13
  const symbolSize = huge ? 16 : 11
  const centerSize = huge ? 30 : 20

  if (card.hidden) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
        className="rounded-xl flex items-center justify-center"
        style={{
          width: `${w}px`, height: `${h}px`,
          background: 'linear-gradient(135deg, #1a237e, #283593)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
        }}
      >
        <div className="text-center">
          <div style={{ color: 'rgba(255,215,0,0.6)', fontSize: huge ? 24 : 18, fontWeight: 'bold' }}>✦</div>
          <div style={{ color: 'rgba(255,215,0,0.3)', fontSize: huge ? 10 : 8, letterSpacing: '1px' }}>ORION</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotateY: 180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 200, damping: 15 }}
      className="rounded-xl flex flex-col items-center justify-between relative"
      style={{
        width: `${w}px`, height: `${h}px`,
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '5px 6px',
      }}
    >
      <div className="self-start" style={{ color, fontSize: `${rankSize}px`, lineHeight: 1, fontWeight: 'bold' }}>
        {card.rank}<br /><span style={{ fontSize: `${symbolSize}px` }}>{symbol}</span>
      </div>
      <div style={{ color, fontSize: `${centerSize}px`, lineHeight: 1 }}>{symbol}</div>
      <div className="self-end rotate-180" style={{ color, fontSize: `${rankSize}px`, lineHeight: 1, fontWeight: 'bold' }}>
        {card.rank}<br /><span style={{ fontSize: `${symbolSize}px` }}>{symbol}</span>
      </div>
    </motion.div>
  )
}
