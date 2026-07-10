import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { SymbolIcon } from './SymbolIcon'
import { SYMBOLS } from '../../lib/symbols'

export function GlossaryModal() {
  const { showGlossary, toggleGlossary } = useUIStore()

  return (
    <AnimatePresence>
      {showGlossary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleGlossary} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[1200px] max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:p-8"
            style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Sistema de premios</h2>
              <button onClick={toggleGlossary} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-sm font-semibold text-white mb-3">Fórmula de pago</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    5 líneas de pago. 3+ símbolos iguales de izquierda a derecha = premio.
                  </p>
                  <div className="px-4 py-3 rounded-xl bg-white/[0.04] text-center">
                    <code className="text-sm text-white font-mono">PAGO = VALOR × (APUESTA ÷ 80) × MULTIPLICADOR</code>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-sm font-semibold text-white mb-4">Wild y Scatter</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-1">
                        <SymbolIcon symbolId="wild" size={24} />
                        <span className="text-xs font-semibold text-white">Wild</span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">Reemplaza cualquier símbolo excepto Scatter. Ayuda a completar líneas.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-1">
                        <SymbolIcon symbolId="scatter" size={24} />
                        <span className="text-xs font-semibold text-white">Scatter</span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">Paga en cualquier posición. 3+ activan tiradas gratis.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-sm font-semibold text-white mb-2">Ejemplo</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Apuestas 80, consigues 4 diamantes (valor 400):
                  </p>
                  <div className="mt-2 px-4 py-3 rounded-xl bg-white/[0.04] text-center">
                    <span className="text-base font-bold text-white font-mono">400 × (80 ÷ 80) = 400 monedas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-sm font-semibold text-white mb-4">Valor de símbolos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMBOLS.filter(s => !s.isWild && !s.isScatter).map(s => (
                      <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <SymbolIcon symbolId={s.id} size={32} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold" style={{ color: s.color }}>{s.name}</div>
                          <div className="flex gap-2 mt-0.5">
                            {s.payouts.slice(2).map((p, i) => (
                              <span key={i} className={`text-[11px] font-mono ${p > 0 ? 'text-white/70' : 'text-white/10'}`}>
                                {p > 0 ? `${p}x` : '-'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-4 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl font-bold text-white font-mono">5</div>
                <div className="text-xs text-white/40 mt-1">Líneas de pago</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl font-bold text-white font-mono">5×3</div>
                <div className="text-xs text-white/40 mt-1">Carretes × Filas</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl font-bold text-white font-mono">50,000+</div>
                <div className="text-xs text-white/40 mt-1">Pozo global</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
