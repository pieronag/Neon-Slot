import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, DollarSign, Star, TrendingUp, ArrowUp, ArrowDown, LogOut, ChevronLeft, BarChart3, Wallet } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'

const formatNum = (n: number) => Math.round(n).toLocaleString('es-CL')

export function ProfilePage() {
  const nav = useNavigate()
  const { user, profile, logout, transactions, loadTransactions } = useAuthStore()
  const { achievements, level } = useProgressionStore()
  const [tab, setTab] = useState<'stats' | 'history'>('stats')
  const p = profile

  useEffect(() => { loadTransactions(100) }, [])

  if (!user || !p) return null

  const totalBets = p.totalBets || 1
  const winRate = ((p.totalWins / totalBets) * 100).toFixed(1)
  const netProfit = p.totalWins - totalBets
  const totalWins = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0)
  const totalLosses = Math.abs(transactions.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0))

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: '#050505' }}>
      <header className="w-full px-5 py-3 flex-shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => nav('/')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-sm font-semibold text-white">Perfil</h1>
          <button onClick={async () => { await logout(); nav('/login') }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">{p.displayName.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="text-lg font-semibold text-white">{p.displayName}</h2>
            <p className="text-xs text-white/40 mt-1">{user.email}</p>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Nivel</div>
                <div className="text-lg font-bold text-white font-mono mt-1">{level}</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Saldo</div>
                <div className="text-lg font-bold text-white font-mono mt-1">{formatNum(p.balance)}</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Giros</div>
                <div className="text-lg font-bold text-white font-mono mt-1">{p.totalSpins}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-white/30" />
                <span className="text-[10px] text-white/40">Total ganado</span>
              </div>
              <div className="text-lg font-bold text-green-400 font-mono">{formatNum(p.totalWins)}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/30" />
                <span className="text-[10px] text-white/40">Total apostado</span>
              </div>
              <div className="text-lg font-bold text-red-400 font-mono">{formatNum(totalBets)}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-white/30" />
                <span className="text-[10px] text-white/40">Ganancia neta</span>
              </div>
              <div className={`text-lg font-bold font-mono ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}{formatNum(netProfit)}
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-white/30" />
                <span className="text-[10px] text-white/40">Win rate</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">{winRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-green-400/60 uppercase tracking-wider">Ganancias</div>
              <div className="text-sm font-bold text-green-400 font-mono mt-1">{formatNum(totalWins)}</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-red-400/60 uppercase tracking-wider">Pérdidas</div>
              <div className="text-sm font-bold text-red-400 font-mono mt-1">{formatNum(totalLosses)}</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Logros</div>
              <div className="text-sm font-bold text-white font-mono mt-1">{achievements.length}</div>
            </div>
          </div>

          <div className="rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex">
              <button onClick={() => setTab('stats')}
                className={`flex-1 py-3 text-xs font-medium transition-all cursor-pointer ${tab === 'stats' ? 'bg-white/[0.04] text-white' : 'text-white/40 hover:text-white'}`}>
                Estadísticas
              </button>
              <button onClick={() => setTab('history')}
                className={`flex-1 py-3 text-xs font-medium transition-all cursor-pointer ${tab === 'history' ? 'bg-white/[0.04] text-white' : 'text-white/40 hover:text-white'}`}>
                Historial
              </button>
            </div>
          </div>

          {tab === 'stats' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Giros totales', value: formatNum(p.totalSpins), icon: Zap },
                { label: 'Mayor ganancia', value: formatNum(p.biggestWin), icon: Trophy },
                { label: 'Saldo actual', value: formatNum(p.balance), icon: DollarSign },
                { label: 'Logros', value: achievements.length.toString(), icon: Star },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl flex items-center gap-3" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <s.icon className="w-5 h-5 text-white/30 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-white/40 truncate">{s.label}</div>
                    <div className="text-sm font-medium text-white font-mono mt-0.5">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'history' && (
            <div className="rounded-xl" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-white/40">Últimos movimientos</span>
                <span className="text-[10px] text-white/30">{transactions.length} registros</span>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
                {transactions.length === 0 && (
                  <div className="p-6 text-center text-xs text-white/30">Sin movimientos aún</div>
                )}
                {transactions.slice(0, 80).map(tx => {
                  const isUp = tx.amount > 0
                  return (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isUp ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {isUp ? <ArrowUp className="w-3.5 h-3.5 text-green-400" /> : <ArrowDown className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-white/70 truncate max-w-[180px]">{tx.description}</div>
                          <div className="text-[9px] text-white/30 mt-0.5">
                            {new Date(tx.createdAt).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-medium flex-shrink-0 ml-3 ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatNum(tx.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
