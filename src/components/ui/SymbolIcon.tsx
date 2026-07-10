import { getSymbol } from '../../lib/symbols'

interface SymbolIconProps { symbolId: string; size?: number; animated?: boolean }

export function SymbolIcon({ symbolId, size = 40, animated = false }: SymbolIconProps) {
  const s = getSymbol(symbolId)
  const c = s.color
  const filter = animated ? { filter: `drop-shadow(0 0 ${size*0.2}px ${c}) brightness(1.3)` } : { filter: `drop-shadow(0 0 ${size*0.08}px ${c})` }

  const S = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={filter}>{children}</svg>
  )

  switch (symbolId) {
    case 'diamond': return S(<><polygon points="50,5 95,50 50,95 5,50" fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round"/><polygon points="50,18 82,50 50,82 18,50" fill={c+'22'} stroke={c} strokeWidth="2" strokeLinejoin="round"/></>)
    case 'seven': return S(<text x="50" y="76" textAnchor="middle" fill={c} fontSize="72" fontWeight="bold" fontFamily="monospace">7</text>)
    case 'bell': return S(<><path d="M50,10 C35,10 25,25 25,40 C25,55 20,65 15,72 L85,72 C80,65 75,55 75,40 C75,25 65,10 50,10Z" fill="none" stroke={c} strokeWidth="3"/><circle cx="50" cy="82" r="10" fill="none" stroke={c} strokeWidth="3"/><line x1="50" y1="82" x2="50" y2="92" stroke={c} strokeWidth="3"/></>)
    case 'star': return S(<polygon points="50,5 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/>)
    case 'heart': return S(<path d="M50,88 C25,65 5,50 5,35 C5,20 15,10 30,10 C40,10 48,18 50,25 C52,18 60,10 70,10 C85,10 95,20 95,35 C95,50 75,65 50,88Z" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/>)
    case 'crown': return S(<><polygon points="10,75 5,30 25,45 50,15 75,45 95,30 90,75" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/><line x1="10" y1="75" x2="90" y2="75" stroke={c} strokeWidth="3"/></>)
    case 'coin': return S(<><circle cx="50" cy="50" r="42" fill="none" stroke={c} strokeWidth="4"/><circle cx="50" cy="50" r="35" fill={c+'15'} stroke={c} strokeWidth="2"/><text x="50" y="62" textAnchor="middle" fill={c} fontSize="42" fontWeight="bold" fontFamily="monospace">$</text></>)
    case 'wild': return S(<><circle cx="50" cy="50" r="42" fill="none" stroke={c} strokeWidth="3" strokeDasharray="6,4"/><text x="50" y="62" textAnchor="middle" fill={c} fontSize="42" fontWeight="bold" fontFamily="monospace">W</text></>)
    case 'scatter': return S(<><polygon points="50,5 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/><circle cx="50" cy="50" r="14" fill="none" stroke={c} strokeWidth="2"/><text x="50" y="55" textAnchor="middle" fill={c} fontSize="18" fontWeight="bold" fontFamily="monospace">S</text></>)
    default: return S(<text x="50" y="65" textAnchor="middle" fill={c} fontSize="40">?</text>)
  }
}
