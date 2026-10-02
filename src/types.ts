export type CardType = 'Вовк' | 'Вівця' | 'Кущі' | 'Ліс' | 'Пилка' | 'Сокира';

export interface Card {
  id: string;
  type: CardType;
}

export interface TablePair {
  id: string;
  attacker: Card;
  defender: Card | null;
}

export type PlayerId = 'player' | 'bot-1' | 'bot-2' | 'bot-3' | 'bot-4';

export interface BotPlayer {
  id: PlayerId;
  name: string;
  emoji: string;
  role: string;
  avatarBg: string;
  accentColor: string;
  hand: Card[];
  hasDrawnThisDefense: boolean;
  rank?: number; // 1, 2, 3... when finished
}

export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameMode = 'classic' | 'tournament';

export type TournamentStage = 'quarter' | 'semi' | 'final';

export interface TournamentMatch {
  stage: TournamentStage;
  stageName: string;
  opponentName: string;
  opponentEmoji: string;
  opponentTitle: string;
  opponentAvatarBg: string;
  difficulty: Difficulty;
  isCompleted: boolean;
  isWon?: boolean;
}

export interface TournamentState {
  currentStageIndex: number; // 0 = Quarter, 1 = Semi, 2 = Final
  isChampion: boolean;
  isEliminated: boolean;
  matches: TournamentMatch[];
}

export interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  streak: number;
  bestStreak: number;
  tournamentWins: number;
}

export interface BattleLogItem {
  id: string;
  text: string;
  type: 'attack' | 'defend' | 'take' | 'win' | 'loss' | 'system';
  timestamp: string;
}

