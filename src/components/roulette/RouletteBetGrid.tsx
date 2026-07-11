import { useRouletteStore } from '../../store/rouletteStore'
import { getColor, DOZEN_LABELS } from '../../lib/rouletteEngine'
import type { BetType } from '../../lib/rouletteEngine'

const COLORS: Record<string, string> = { red: '#dc2626', black: '#1a1a2e', green: '#16a34a' }

const formatBetShort = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}K`
  return String(n)
}

const betBadge = (amount: number) => (
  <span className="absolute -bottom-1 -right-1 text-[9px] font-bold text-yellow-400 bg-gray-950/90 px-1.5 rounded-full border border-yellow-500/40 leading-[16px] shadow-sm z-10 pointer-events-none">
    ${formatBetShort(amount)}
  </span>
)

export function RouletteBetGrid() {
  const phase = useRouletteStore(s => s.phase)
  const bets = useRouletteStore(s => s.bets)

  const getBet = (type: string, numbers: number[]) =>
    bets.find(b => b.type === type && JSON.stringify(b.numbers) === JSON.stringify(numbers))

  const doBet = (type: BetType, numbers: number[], label: string) => {
    if (phase !== 'bet') return
    useRouletteStore.getState().placeBet(type, numbers, label)
  }

  return (
    <div className="inline-flex flex-col items-center w-full">
      {/* Row 0: 0 spanning all columns */}
      <div className="w-full mb-0.5">
        {(() => {
          const active = getBet('straight', [0])
          return (
            <button onClick={() => doBet('straight', [0], '0')}
              className="w-full h-8 sm:h-10 rounded-sm flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-all relative"
              style={{
                background: COLORS.green,
                border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
              }}>
              0
              {active && betBadge(active.amount)}
            </button>
          )
        })()}
      </div>

      {/* Numbers 1-36 in 3 columns × 12 rows */}
      <div className="grid grid-cols-3 gap-0.5 w-full">
        {Array.from({ length: 12 }, (_, row) => (
          [row * 3 + 1, row * 3 + 2, row * 3 + 3].map(n => {
            const color = getColor(n)
            const active = getBet('straight', [n])
            return (
              <button key={n} onClick={() => doBet('straight', [n], `${n}`)}
                className="h-6 sm:h-7 rounded-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:opacity-80 transition-all relative"
                style={{
                  background: COLORS[color],
                  border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
                }}>
                {n}
                {active && betBadge(active.amount)}
              </button>
            )
          })
        ))}
      </div>

      {/* Dozen bets */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5 w-full">
        {[0, 1, 2].map(d => {
          const start = d * 12 + 1
          const end = (d + 1) * 12
          const nums = Array.from({ length: 12 }, (_, i) => start + i)
          const active = getBet('dozen', nums)
          return (
            <button key={d} onClick={() => doBet('dozen', nums, `${start}-${end}`)}
              className="h-6 sm:h-7 rounded-sm flex items-center justify-center text-[9px] font-bold text-white cursor-pointer hover:opacity-80 transition-all relative"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
              }}>
              {DOZEN_LABELS[d]}
              {active && betBadge(active.amount)}
            </button>
          )
        })}
      </div>

      {/* Outside bets */}
      <div className="w-full mt-0.5 space-y-0.5">
        <div className="grid grid-cols-2 gap-0.5">
          {[
            { type: 'red' as BetType, label: 'Rojo', color: '#dc2626' },
            { type: 'black' as BetType, label: 'Negro', color: '#1a1a2e' },
          ].map(b => {
            const active = getBet(b.type, [])
            return (
              <button key={b.type} onClick={() => doBet(b.type, [], b.label)}
                className="h-7 sm:h-8 rounded-sm flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80 transition-all relative"
                style={{
                  background: b.color ? `${b.color}66` : 'rgba(255,255,255,0.06)',
                  border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
                }}>
                {b.label}
                {active && betBadge(active.amount)}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {[
            { type: 'even' as BetType, label: 'Par', color: '#1a1a2e' },
            { type: 'odd' as BetType, label: 'Impar', color: '#dc2626' },
          ].map(b => {
            const active = getBet(b.type, [])
            return (
              <button key={b.type} onClick={() => doBet(b.type, [], b.label)}
                className="h-7 sm:h-8 rounded-sm flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80 transition-all relative"
                style={{
                  background: b.color ? `${b.color}66` : 'rgba(255,255,255,0.06)',
                  border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
                }}>
                {b.label}
                {active && betBadge(active.amount)}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {[
            { type: 'low' as BetType, label: '1-18' },
            { type: 'high' as BetType, label: '19-36' },
          ].map(b => {
            const active = getBet(b.type, [])
            return (
              <button key={b.type} onClick={() => doBet(b.type, [], b.label)}
                className="h-7 sm:h-8 rounded-sm flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80 transition-all relative"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: active ? '2px solid #fff' : '0.5px solid rgba(255,255,255,0.1)',
                }}>
                {b.label}
                {active && betBadge(active.amount)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}