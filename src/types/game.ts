export interface SymbolType {
  id: string; name: string; icon: string; color: string;
  payouts: number[]; isWild?: boolean; isScatter?: boolean;
}
export interface Payline { id: number; positions: { reel: number; row: number }[]; }
export interface WinResult {
  paylineId: number; symbolId: string; count: number;
  payout: number; positions: { reel: number; row: number }[];
}
export interface SpinResult {
  reels: string[][]; wins: WinResult[]; totalPayout: number;
  bonusTriggered: boolean; scatterCount: number; bonusMultiplier: number;
  multiplier: number; expandingWild: string | null;
  avalancheCount: number; avalancheWins: WinResult[][];
}
export interface Achievement {
  id: string; name: string; description: string;
  condition: (s: { totalSpins: number; biggestWin: number; totalWins: number; totalBets: number }) => boolean;
  reward: number;
}
export type GameMode = 'normal' | 'turbo' | 'auto';

export interface WheelSegment {
  label: string; value: number; color: string; icon: string;
}
