import { IPLPlayer, Rarity } from '../data/players';

export type GamePhase = 'lobby' | 'auction' | 'team-review' | 'battle' | 'gameover';
export type WinMode = 'rounds' | 'points' | 'lastcard';
export type Category = 
  | 'runs' | 'battingAverage' | 'strikeRate' | 'sixes' | 'fours'
  | 'wickets' | 'economy' | 'dotBalls'
  | 'catches' | 'runOuts'
  | 'fantasyPoints';

export interface GamePlayer {
  id: string;
  name: string;
  budget: number;
  team: IPLPlayer[];
  roundWins: number;
  totalPoints: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  captain?: string;
  viceCaptain?: string;
}

export interface AuctionState {
  currentPlayerIndex: number;
  currentBid: number;
  currentBidder: string | null;
  timer: number;
  isActive: boolean;
  bids: { playerId: string; bidderId: string; amount: number; timestamp: number }[];
  soldPlayers: { playerId: string; buyerId: string; price: number }[];
  playerQueue: string[];
}

export interface BattleRound {
  roundNumber: number;
  activePlayerId: string;
  selectedCategory: Category | null;
  playedCards: { playerId: string; cardId: string }[];
  revealed: boolean;
  winner: string | null;
  isTie: boolean;
  tiedPlayers: string[];
  scores: { playerId: string; value: number }[];
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: GamePlayer[];
  auctionState: AuctionState;
  currentRound: BattleRound | null;
  roundHistory: BattleRound[];
  settings: GameSettings;
  winner: string | null;
  totalRounds: number;
}

export interface GameSettings {
  budget: number;
  teamSize: number;
  roundTimer: number;
  auctionTimer: number;
  winMode: WinMode;
  maxPlayers: number;
  captainBonus: boolean;
  specialCards: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  budget: 1000,
  teamSize: 11,
  roundTimer: 30,
  auctionTimer: 20,
  winMode: 'rounds',
  maxPlayers: 6,
  captainBonus: true,
  specialCards: true,
};

export const CATEGORY_LABELS: Record<Category, { label: string; icon: string; type: string; higherIsBetter: boolean }> = {
  runs: { label: 'Runs', icon: '🏏', type: 'Batting', higherIsBetter: true },
  battingAverage: { label: 'Batting Avg', icon: '📊', type: 'Batting', higherIsBetter: true },
  strikeRate: { label: 'Strike Rate', icon: '⚡', type: 'Batting', higherIsBetter: true },
  sixes: { label: 'Sixes', icon: '6️⃣', type: 'Batting', higherIsBetter: true },
  fours: { label: 'Fours', icon: '4️⃣', type: 'Batting', higherIsBetter: true },
  wickets: { label: 'Wickets', icon: '🎯', type: 'Bowling', higherIsBetter: true },
  economy: { label: 'Economy', icon: '💰', type: 'Bowling', higherIsBetter: false },
  dotBalls: { label: 'Dot Balls', icon: '⭕', type: 'Bowling', higherIsBetter: true },
  catches: { label: 'Catches', icon: '🤲', type: 'Fielding', higherIsBetter: true },
  runOuts: { label: 'Run Outs', icon: '🏃', type: 'Fielding', higherIsBetter: true },
  fantasyPoints: { label: 'Fantasy Pts', icon: '⭐', type: 'Fantasy', higherIsBetter: true },
};
