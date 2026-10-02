/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  RefreshCw,
  Trophy,
  Swords,
  Layers,
  Trash2,
  Flame,
  Info,
  Sliders,
  CheckCircle2,
  PlusCircle,
  Users,
  Shield,
  Award,
  Crown,
  ChevronRight,
  Sparkles,
  Axe,
  Zap,
  Settings,
} from 'lucide-react';

import {
  Card,
  CardType,
  TablePair,
  PlayerId,
  BotPlayer,
  Difficulty,
  GameMode,
  GameStats,
  BattleLogItem,
  TournamentState,
} from './types';
import {
  DECK_TEMPLATE,
  BEATS,
  CARD_CONFIGS,
  INITIAL_HAND_SIZE,
  BOT_PROFILES,
  TOURNAMENT_STAGES_CONFIG,
} from './constants';
import { soundManager } from './sound';
import { CardView } from './components/CardView';
import { Ambient } from './components/Ambient';
import { CycleWheel } from './components/CycleWheel';
import { RulesModal } from './components/RulesModal';
import { DiscardModal } from './components/DiscardModal';
import { GameLog } from './components/GameLog';
import { TournamentModal } from './components/TournamentModal';
import { ChainAnimationModal } from './components/ChainAnimationModal';
import { CrossedAxes } from './components/CrossedAxes';
import { VictoryStars } from './components/VictoryStars';
import { SettingsModal } from './components/SettingsModal';

// Helper to create and shuffle deck of 54 cards
const createShuffledDeck = (): Card[] => {
  const cards: Card[] = [];
  let idCounter = 1;

  for (const [typeStr, count] of Object.entries(DECK_TEMPLATE)) {
    const type = typeStr as CardType;
    for (let i = 0; i < count; i++) {
      cards.push({
        id: `${type}-${idCounter++}`,
        type,
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

// Check if defendingCard can beat attackingCard
const canBeat = (defendingCardType: CardType, attackingCardType: CardType): boolean => {
  if (defendingCardType === 'Сокира') return true;
  return BEATS[defendingCardType]?.includes(attackingCardType) || false;
};

// Get set of all card types currently visible on the table (attackers and defenders)
const getTableCardTypes = (pairs: TablePair[]): Set<CardType> => {
  const types = new Set<CardType>();
  pairs.forEach((p) => {
    types.add(p.attacker.type);
    if (p.defender) {
      types.add(p.defender.type);
    }
  });
  return types;
};

interface FinishedRanking {
  id: PlayerId;
  name: string;
  emoji: string;
  rank: number;
}

export default function App() {
  // --- Game Settings ---
  const [botCount, setBotCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_bot_count');
      const val = saved ? parseInt(saved, 10) : 1;
      return [1, 2, 3, 4].includes(val) ? val : 1;
    } catch {
      return 1;
    }
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_difficulty');
      return (saved === 'easy' || saved === 'normal' || saved === 'hard') ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    try {
      localStorage.setItem('survival_chain_difficulty', newDiff);
    } catch {}
    const diffNames: Record<Difficulty, string> = {
      easy: '🟢 Легкий',
      normal: '🟡 Середній',
      hard: '🔴 Важкий',
    };
    addLog(`Рівень складності бота змінено на: ${diffNames[newDiff]}`, 'system');
    setMessage(`Рівень складності: ${diffNames[newDiff]}`);
  };
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.isEnabled());

  // --- Rule Modifiers (Шестерня) ---
  const [noTossing, setNoTossing] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_no_tossing');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const noTossingRef = useRef<boolean>(noTossing);

  const [refillHandTo4, setRefillHandTo4] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_refill_to_4');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const refillHandTo4Ref = useRef<boolean>(refillHandTo4);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const handleToggleNoTossing = (val: boolean) => {
    setNoTossing(val);
    noTossingRef.current = val;
    try {
      localStorage.setItem('survival_chain_no_tossing', String(val));
    } catch {}
    addLog(
      val
        ? '⚙️ Правило змінено: «Без підкидання» УВІМКНЕНО (атака рівно 1 картою).'
        : '⚙️ Правило змінено: «Без підкидання» ВИМКНЕНО (класичне підкидання карт).',
      'system'
    );
  };

  const handleToggleRefillHandTo4 = (val: boolean) => {
    setRefillHandTo4(val);
    refillHandTo4Ref.current = val;
    try {
      localStorage.setItem('survival_chain_refill_to_4', String(val));
    } catch {}
    addLog(
      val
        ? '⚙️ Правило змінено: «З добором (до 4 карт)» УВІМКНЕНО.'
        : '⚙️ Правило змінено: «З добором (до 4 карт)» ВИМКНЕНО.',
      'system'
    );
  };

  // --- Tournament State ---
  const [showTournamentModal, setShowTournamentModal] = useState<boolean>(false);
  const [tournamentState, setTournamentState] = useState<TournamentState>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_tournament');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      currentStageIndex: 0,
      isChampion: false,
      isEliminated: false,
      matches: TOURNAMENT_STAGES_CONFIG.map((c) => ({
        stage: c.stage,
        stageName: c.stageName,
        opponentName: c.opponentName,
        opponentEmoji: c.opponentEmoji,
        opponentTitle: c.opponentTitle,
        opponentAvatarBg: c.opponentAvatarBg,
        difficulty: c.difficulty,
        isCompleted: false,
      })),
    };
  });

  // --- Game State ---
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bots, setBots] = useState<BotPlayer[]>([]);
  const [tablePairs, setTablePairs] = useState<TablePair[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);

  // Turn management in multi-player ring
  const [attackerId, setAttackerId] = useState<PlayerId>('player');
  const [defenderId, setDefenderId] = useState<PlayerId>('bot-1');
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('player');
  const [isOpponentTaking, setIsOpponentTaking] = useState<boolean>(false);
  const [playerHasDrawnThisDefense, setPlayerHasDrawnThisDefense] = useState<boolean>(false);

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Вітаємо у грі «Лісовий патруль»! Натисніть «Почати гру».');
  const [winner, setWinner] = useState<'player' | 'ai' | 'draw' | null>(null);
  const [isGameOverPending, setIsGameOverPending] = useState<boolean>(false);
  const isGameOverPendingRef = useRef<boolean>(false);
  const [finishedRankings, setFinishedRankings] = useState<FinishedRanking[]>([]);

  // UI Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showDiscard, setShowDiscard] = useState<boolean>(false);
  const [showCycleGuide, setShowCycleGuide] = useState<boolean>(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);
  const [showChainAnimation, setShowChainAnimation] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [logCollapsed, setLogCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [battleLogs, setBattleLogs] = useState<BattleLogItem[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('survival_chain_stats');
      return saved ? JSON.parse(saved) : { wins: 0, losses: 0, totalGames: 0, streak: 0, bestStreak: 0, tournamentWins: 0 };
    } catch {
      return { wins: 0, losses: 0, totalGames: 0, streak: 0, bestStreak: 0, tournamentWins: 0 };
    }
  });

  // Active state refs for timers & async callbacks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deckRef = useRef<Card[]>([]);
  const playerHandRef = useRef<Card[]>([]);
  const botsRef = useRef<BotPlayer[]>([]);
  const finishedRankingsRef = useRef<FinishedRanking[]>([]);
  const tablePairsRef = useRef<TablePair[]>([]);
  const attackerIdRef = useRef<PlayerId>('player');
  const defenderIdRef = useRef<PlayerId>('bot-1');
  const gameModeRef = useRef<GameMode>('classic');
  const tournamentStateRef = useRef<TournamentState>(tournamentState);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    playerHandRef.current = playerHand;
  }, [playerHand]);

  useEffect(() => {
    botsRef.current = bots;
  }, [bots]);

  useEffect(() => {
    finishedRankingsRef.current = finishedRankings;
  }, [finishedRankings]);

  useEffect(() => {
    tablePairsRef.current = tablePairs;
  }, [tablePairs]);

  useEffect(() => {
    attackerIdRef.current = attackerId;
  }, [attackerId]);

  useEffect(() => {
    defenderIdRef.current = defenderId;
  }, [defenderId]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    tournamentStateRef.current = tournamentState;
    try {
      localStorage.setItem('survival_chain_tournament', JSON.stringify(tournamentState));
    } catch {}
  }, [tournamentState]);

  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPendingTimeout();
  }, []);

  // Save bot count to localStorage
  const handleBotCountChange = (count: number) => {
    setBotCount(count);
    try {
      localStorage.setItem('survival_chain_bot_count', count.toString());
    } catch {}
    startGame(gameMode, count);
  };

  // Start initial game on mount
  useEffect(() => {
    startGame(gameMode, botCount);
  }, []);

  const handleToggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  // Дзвіночок, коли настає хід гравця
  useEffect(() => {
    if (gameStarted && currentTurn === 'player' && !winner) {
      soundManager.playTurnSound();
    }
  }, [currentTurn, gameStarted]);

  const addLog = (text: string, type: BattleLogItem['type'] = 'system') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setBattleLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        text,
        type,
        timestamp: time,
      },
      ...prev,
    ]);
  };

  const recordGameResult = (result: 'player' | 'ai') => {
    setStats((prev) => {
      const isWin = result === 'player';
      const streak = isWin ? prev.streak + 1 : 0;
      const bestStreak = Math.max(streak, prev.bestStreak);
      const updated: GameStats = {
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: !isWin ? prev.losses + 1 : prev.losses,
        totalGames: prev.totalGames + 1,
        streak,
        bestStreak,
        tournamentWins: prev.tournamentWins || 0,
      };
      localStorage.setItem('survival_chain_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const recordTournamentCupWin = () => {
    setStats((prev) => {
      const updated: GameStats = {
        ...prev,
        tournamentWins: (prev.tournamentWins || 0) + 1,
      };
      localStorage.setItem('survival_chain_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper: Name & Emoji lookup
  const getPlayerInfo = (id: PlayerId) => {
    if (id === 'player') {
      return { name: 'Ви', emoji: '👤', role: 'Гравець' };
    }
    const currentBot = botsRef.current.find((b) => b.id === id);
    if (currentBot) {
      return { name: currentBot.name, emoji: currentBot.emoji, role: currentBot.role };
    }
    const profile = BOT_PROFILES.find((b) => b.id === id);
    return profile || { name: 'Бот', emoji: '🤖', role: 'Супротивник' };
  };

  // Helper: Ring of active players (clockwise order)
  const getActivePlayerRing = (
    currPlayerHand: Card[],
    currBots: BotPlayer[],
    currRankings: FinishedRanking[]
  ): PlayerId[] => {
    const activeIds: PlayerId[] = [];
    const finishedSet = new Set(currRankings.map((r) => r.id));

    if (currPlayerHand.length > 0 && !finishedSet.has('player')) {
      activeIds.push('player');
    }
    currBots.forEach((bot) => {
      if (bot.hand.length > 0 && !finishedSet.has(bot.id)) {
        activeIds.push(bot.id);
      }
    });
    return activeIds;
  };

  // Helper: Next active player clockwise
  const getNextActivePlayer = (
    fromId: PlayerId,
    activeRing: PlayerId[]
  ): PlayerId | null => {
    if (activeRing.length <= 1) return null;
    const currentIndex = activeRing.indexOf(fromId);
    if (currentIndex === -1) {
      return activeRing[0];
    }
    return activeRing[(currentIndex + 1) % activeRing.length];
  };

  // --- START NEW GAME ---
  const startGame = (modeOverride?: GameMode | React.MouseEvent, countOverride?: number) => {
    clearPendingTimeout();
    const currentMode = (typeof modeOverride === 'string' ? modeOverride : undefined) || gameMode;
    const isTournament = currentMode === 'tournament';
    const currentBotCount = isTournament ? 1 : (countOverride || botCount);
    const fullDeck = createShuffledDeck();

    // Deal 6 cards to player
    const pHand = fullDeck.splice(0, INITIAL_HAND_SIZE);

    let activeBots: BotPlayer[] = [];

    if (isTournament) {
      // Tournament mode: Single boss opponent per stage
      const stageIdx = tournamentStateRef.current.currentStageIndex;
      const stageConf = TOURNAMENT_STAGES_CONFIG[stageIdx];
      setDifficulty(stageConf.difficulty);

      activeBots = [
        {
          id: 'bot-1',
          name: stageConf.opponentName,
          emoji: stageConf.opponentEmoji,
          role: stageConf.opponentTitle,
          avatarBg: stageConf.opponentAvatarBg,
          accentColor: 'text-amber-300',
          hand: fullDeck.splice(0, INITIAL_HAND_SIZE),
          hasDrawnThisDefense: false,
        },
      ];
    } else {
      // Standard or Blitz mode with chosen number of bots
      activeBots = BOT_PROFILES.slice(0, currentBotCount).map((profile) => ({
        id: profile.id,
        name: profile.name,
        emoji: profile.emoji,
        role: profile.role,
        avatarBg: profile.avatarBg,
        accentColor: profile.accentColor,
        hand: fullDeck.splice(0, INITIAL_HAND_SIZE),
        hasDrawnThisDefense: false,
      }));
    }

    const newDeck = fullDeck;
    const allParticipants: PlayerId[] = ['player', ...activeBots.map((b) => b.id)];
    // Random starter among all participants (Player or Bots)
    const randomStarter: PlayerId = allParticipants[Math.floor(Math.random() * allParticipants.length)];
    const activeRing = allParticipants;
    const firstDefender: PlayerId = getNextActivePlayer(randomStarter, activeRing) || activeRing[0];

    deckRef.current = newDeck;
    playerHandRef.current = pHand;
    botsRef.current = activeBots;
    finishedRankingsRef.current = [];
    attackerIdRef.current = randomStarter;
    defenderIdRef.current = firstDefender;

    setDeck(newDeck);
    setPlayerHand(pHand);
    setBots(activeBots);
    setFinishedRankings([]);
    setTablePairs([]);
    setDiscardPile([]);
    setIsOpponentTaking(false);
    setPlayerHasDrawnThisDefense(false);
    setAttackerId(randomStarter);
    setDefenderId(firstDefender);
    setCurrentTurn(randomStarter);
    setWinner(null);
    setIsGameOverPending(false);
    isGameOverPendingRef.current = false;
    setIsAiThinking(false);
    setGameStarted(true);

    const starterInfo = getPlayerInfo(randomStarter);
    const defInfo = getPlayerInfo(firstDefender);

    setBattleLogs([]);
    addLog(
      isTournament
        ? `🏆 ТУРНІРНИЙ БІЙ: ${TOURNAMENT_STAGES_CONFIG[tournamentStateRef.current.currentStageIndex].stageName} проти ${activeBots[0].name}.`
        : `Бій розпочато! Учасників: ${1 + currentBotCount} (Ви + ${currentBotCount} бот). У колоді ${newDeck.length} карт.`,
      'system'
    );
    addLog(`🎲 Жереб першого ходу: ${starterInfo.name} (${starterInfo.emoji}) розпочинає атаку на ${defInfo.name}!`, 'system');

    if (randomStarter === 'player') {
      setMessage(`Жереб обрав вас! Ваш перший хід — атакуйте ${defInfo.name} (${defInfo.emoji}).`);
    } else {
      setMessage(`Жереб обрав ${starterInfo.name}! Він атакує ${defInfo.name}...`);
      setIsAiThinking(true);
      timeoutRef.current = setTimeout(() => {
        executeBotAttack(randomStarter, firstDefender, pHand, activeBots);
      }, 1000);
    }

    soundManager.playDealSound();
  };

  // --- TOURNAMENT RESET ---
  const handleResetTournament = () => {
    const freshTournament: TournamentState = {
      currentStageIndex: 0,
      isChampion: false,
      isEliminated: false,
      matches: TOURNAMENT_STAGES_CONFIG.map((c) => ({
        stage: c.stage,
        stageName: c.stageName,
        opponentName: c.opponentName,
        opponentEmoji: c.opponentEmoji,
        opponentTitle: c.opponentTitle,
        opponentAvatarBg: c.opponentAvatarBg,
        difficulty: c.difficulty,
        isCompleted: false,
      })),
    };
    setTournamentState(freshTournament);
    setShowTournamentModal(false);
    setGameMode('tournament');
    startGame('tournament');
  };

  const handleVictory = () => {
    if (isGameOverPendingRef.current || winner) return;
    isGameOverPendingRef.current = true;
    setIsGameOverPending(true);
    setIsAiThinking(false);
    clearPendingTimeout();

    if (gameModeRef.current === 'tournament') {
      const currentIdx = tournamentStateRef.current.currentStageIndex;
      const isFinal = currentIdx === TOURNAMENT_STAGES_CONFIG.length - 1;
      const updatedMatches = tournamentStateRef.current.matches.map((m, idx) =>
        idx === currentIdx ? { ...m, isCompleted: true, isWon: true } : m
      );

      if (isFinal) {
        setTournamentState({
          ...tournamentStateRef.current,
          isChampion: true,
          isEliminated: false,
          matches: updatedMatches,
        });
        recordTournamentCupWin();
        setMessage('👑 ТРІУМФ! Ви скинули всі карти та виграли Золотий Кубок Чемпіона!');
        addLog('🏆 ВИ — ЧЕМПІОН ТУРНІРУ! Всі суперники повалені!', 'win');
      } else {
        const nextIdx = currentIdx + 1;
        setTournamentState({
          ...tournamentStateRef.current,
          currentStageIndex: nextIdx,
          isEliminated: false,
          matches: updatedMatches,
        });
        setMessage(`🎉 Перемога у раунді «${TOURNAMENT_STAGES_CONFIG[currentIdx].stageName}»! Ви вийшли у «${TOURNAMENT_STAGES_CONFIG[nextIdx].stageName}»!`);
        addLog(`Перемога у ${TOURNAMENT_STAGES_CONFIG[currentIdx].stageName}! Ви переходите до ${TOURNAMENT_STAGES_CONFIG[nextIdx].stageName}!`, 'win');
      }
    } else {
      setMessage('🎉 ПЕРЕМОГА! Ви скинули всі свої карти та зайняли 1-е місце!');
      addLog('Ви першим скинули всі свої карти та стали володарем Лісового патруля!', 'win');
    }

    // Вікно перемоги з'являється одразу без затримок
    setWinner('player');
    soundManager.playWinSound();
    soundManager.playSparkleSound(12);
    [0.25, 0.5, 0.75].forEach((fx, i) =>
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('fx:burst', {
            detail: { x: window.innerWidth * fx, y: window.innerHeight * 0.4, count: 60, power: 7 },
          })
        );
        soundManager.playSparkleSound(5);
      }, i * 380)
    );
    recordGameResult('player');

    try {
      confetti({
        particleCount: 170,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ffd86b', '#5eead4', '#ff7ad9', '#a78bfa', '#ffffff'],
      });
    } catch {}
  };

  const handleDefeat = () => {
    if (isGameOverPendingRef.current || winner) return;
    isGameOverPendingRef.current = true;
    setIsGameOverPending(true);
    setIsAiThinking(false);
    clearPendingTimeout();

    const isSingleBot = botsRef.current.length === 1;
    const opponentName = botsRef.current[0]?.name || 'Суперник';

    if (gameModeRef.current === 'tournament') {
      const currentIdx = tournamentStateRef.current.currentStageIndex;
      setMessage(`⚔️ ${opponentName} скинув свою останню карту у раунді «${TOURNAMENT_STAGES_CONFIG[currentIdx]?.stageName}»!`);
      addLog(`Поразка у ${TOURNAMENT_STAGES_CONFIG[currentIdx]?.stageName}. Ви вибули з турніру на вибування.`, 'loss');
    } else {
      setMessage(
        isSingleBot
          ? `⚔️ ${opponentName} зіграв останню карту та першим скинув усю руку!`
          : '⚔️ Суперники скинули свої карти раніше за вас.'
      );
      addLog(
        isSingleBot
          ? `${opponentName} позбувся своїх карт раніше за вас.`
          : 'Суперники позбулися всіх своїх карт раніше за вас.',
        'loss'
      );
    }

    // Даємо гравцю 1 секунду спокійно розгледіти останній хід бота, карту на столі та стан гри
    timeoutRef.current = setTimeout(() => {
      if (gameModeRef.current === 'tournament') {
        const currentIdx = tournamentStateRef.current.currentStageIndex;
        const updatedMatches = tournamentStateRef.current.matches.map((m, idx) =>
          idx === currentIdx ? { ...m, isCompleted: true, isWon: false } : m
        );
        setTournamentState({
          ...tournamentStateRef.current,
          isEliminated: true,
          matches: updatedMatches,
        });
      }

      setWinner('ai');
      soundManager.playDefeatSound();
      recordGameResult('ai');
    }, 1000);
  };

  // Check and record rankings when hands empty (original quick draw rules)
  const checkAndRecordFinishes = (
    currPlayerHand: Card[],
    currBots: BotPlayer[],
    currRankings: FinishedRanking[]
  ): FinishedRanking[] => {
    // In refill mode, players can only finish if the deck is completely empty
    if (refillHandTo4Ref.current && deckRef.current.length > 0) {
      return currRankings;
    }

    const newRankings = [...currRankings];
    const finishedSet = new Set(newRankings.map((r) => r.id));

    // Check Player
    if (currPlayerHand.length === 0 && !finishedSet.has('player')) {
      const rank = newRankings.length + 1;
      newRankings.push({
        id: 'player',
        name: 'Ви',
        emoji: '👤',
        rank,
      });
      finishedSet.add('player');
      addLog(`🎉 Ви скинули всі карти та зайняли ${rank}-е місце!`, 'win');

      if (rank === 1) {
        handleVictory();
      }
    }

    // Check Bots
    currBots.forEach((bot) => {
      if (bot.hand.length === 0 && !finishedSet.has(bot.id)) {
        const rank = newRankings.length + 1;
        newRankings.push({
          id: bot.id,
          name: bot.name,
          emoji: bot.emoji,
          rank,
        });
        finishedSet.add(bot.id);
        addLog(`🏆 ${bot.name} (${bot.emoji}) скинув усі карти та зайняв ${rank}-е місце!`, 'system');
      }
    });

    if (newRankings.length !== currRankings.length) {
      setFinishedRankings(newRankings);
      finishedRankingsRef.current = newRankings;
    }

    // If at least one player finished, check if the game is over
    if (newRankings.length > 0) {
      const active = getActivePlayerRing(currPlayerHand, currBots, newRankings);
      if (active.length <= 1) {
        if (active.length === 1 && active[0] === 'player') {
          if (!winner && !isGameOverPendingRef.current) {
            handleDefeat();
          }
        } else if (active.length === 0 && !winner && !isGameOverPendingRef.current) {
          if (newRankings.length > 0 && newRankings[0].id === 'player') {
            handleVictory();
          } else {
            handleDefeat();
          }
        }
      }
    }

    return newRankings;
  };

  // --- AI DECISION HELPERS (3 РІВНІ СКЛАДНОСТІ) ---
  const aiChooseDefenseCard = (attackType: CardType, currentHand: Card[]): Card | null => {
    const candidates = currentHand.filter((c) => canBeat(c.type, attackType));
    if (candidates.length === 0) return null;

    if (difficulty === 'easy') {
      // 🟢 Легкий: випадковий вибір, може випадково скинути Сокиру завчасно (30%)
      if (candidates.some((c) => c.type === 'Сокира') && Math.random() < 0.3) {
        return candidates.find((c) => c.type === 'Сокира')!;
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (difficulty === 'normal') {
      // 🟡 Середній: береже Сокиру, використовує звичайний контр-тип
      const regularCounters = candidates.filter((c) => c.type !== 'Сокира');
      if (regularCounters.length > 0) {
        return regularCounters[0];
      }
      return candidates[0];
    }

    // 🔴 Важкий (Гросмейстер):
    // Завжди зберігає Сокиру на вирішальний момент.
    // Серед звичайних контр-карт обирає ту, якої в руці найбільше (зберігає різноманітність для наступних ходів)
    const regularCounters = candidates.filter((c) => c.type !== 'Сокира');
    if (regularCounters.length > 0) {
      const counts: Record<string, number> = {};
      currentHand.forEach((c) => {
        counts[c.type] = (counts[c.type] || 0) + 1;
      });
      regularCounters.sort((a, b) => (counts[b.type] || 0) - (counts[a.type] || 0));
      return regularCounters[0];
    }

    return candidates[0];
  };

  const aiChooseAttackCard = (currentHand: Card[]): Card => {
    if (difficulty === 'easy') {
      // 🟢 Легкий: атака навмання (іноді навіть Сокирою 20%)
      if (Math.random() < 0.2 && currentHand.some((c) => c.type === 'Сокира')) {
        return currentHand.find((c) => c.type === 'Сокира')!;
      }
      return currentHand[Math.floor(Math.random() * currentHand.length)];
    }

    if (difficulty === 'normal') {
      // 🟡 Середній: атака не-Сокирою з урахуванням наявності дублікатів
      const nonAxe = currentHand.filter((c) => c.type !== 'Сокира');
      if (nonAxe.length > 0) {
        const counts: Record<string, number> = {};
        nonAxe.forEach((c) => {
          counts[c.type] = (counts[c.type] || 0) + 1;
        });
        const sorted = [...nonAxe].sort((a, b) => (counts[b.type] || 0) - (counts[a.type] || 0));
        return sorted[0];
      }
      return currentHand[0];
    }

    // 🔴 Важкий: прораховує найвигіднішу серію для атаки
    const nonAxe = currentHand.filter((c) => c.type !== 'Сокира');
    if (nonAxe.length > 0) {
      const counts: Record<string, number> = {};
      nonAxe.forEach((c) => {
        counts[c.type] = (counts[c.type] || 0) + 1;
      });
      // Обирає карту з максимальною кількістю дублікатів у руці для подальшого жорсткого закидання
      const sorted = [...nonAxe].sort((a, b) => (counts[b.type] || 0) - (counts[a.type] || 0));
      return sorted[0];
    }
    return currentHand[0];
  };

  const aiChooseTossCard = (
    currentHand: Card[],
    pairsOnTable: TablePair[],
    defenderRemainingHand: number
  ): Card | null => {
    if (defenderRemainingHand <= 0) return null;
    const tableTypes = getTableCardTypes(pairsOnTable);
    const tossCandidates = currentHand.filter((c) => tableTypes.has(c.type));
    if (tossCandidates.length === 0) return null;

    if (difficulty === 'easy') {
      // 🟢 Легкий: підкидає лише у 25% випадків, дає гравцеві легше вийти у «Бито!»
      return Math.random() < 0.25 ? tossCandidates[0] : null;
    }

    if (difficulty === 'normal') {
      // 🟡 Середній: підкидає звичайні карти в 70% випадків
      const nonAxe = tossCandidates.filter((c) => c.type !== 'Сокира');
      if (nonAxe.length > 0 && Math.random() < 0.7) {
        return nonAxe[0];
      }
      return null;
    }

    // 🔴 Важкий: нещадний тиск! Завжди підкидає кожну доступну не-Сокиру
    const nonAxe = tossCandidates.filter((c) => c.type !== 'Сокира');
    if (nonAxe.length > 0) {
      return nonAxe[0];
    }
    // Сокиру підкидає лише якщо це буквально остання карта в руці для негайної перемоги
    if (currentHand.length === 1 && tossCandidates.length === 1) {
      return tossCandidates[0];
    }
    return null;
  };

  // --- BOT DEFENSE EXECUTION ---
  const executeBotDefend = (
    botId: PlayerId,
    currentPairs: TablePair[],
    updatedPlayerHand: Card[],
    updatedBots: BotPlayer[]
  ) => {
    setIsAiThinking(true);

    timeoutRef.current = setTimeout(() => {
      setIsAiThinking(false);

      const activePairIndex = currentPairs.findIndex((p) => !p.defender);
      if (activePairIndex === -1) return;

      const targetPair = currentPairs[activePairIndex];
      const attackCard = targetPair.attacker;

      const bot = updatedBots.find((b) => b.id === botId);
      if (!bot) return;

      const currBotHand = bot.hand;
      const currentDeck = deckRef.current;
      const defenseCard = aiChooseDefenseCard(attackCard.type, currBotHand);

      if (defenseCard) {
        // Bot can defend!
        const newBotHand = currBotHand.filter((c) => c.id !== defenseCard.id);
        const newBots = updatedBots.map((b) =>
          b.id === botId ? { ...b, hand: newBotHand, hasDrawnThisDefense: false } : b
        );
        botsRef.current = newBots;
        setBots(newBots);

        if (defenseCard.type === 'Сокира') {
          soundManager.playAxeSound();
        } else if (defenseCard.type === 'Пилка') {
          soundManager.playSawSound();
        } else {
          soundManager.playClashSound();
        }

        const updatedPairs = currentPairs.map((p, idx) =>
          idx === activePairIndex ? { ...p, defender: defenseCard } : p
        );
        tablePairsRef.current = updatedPairs;
        setTablePairs(updatedPairs);

        addLog(`${bot.name} (${bot.emoji}) захистився картою «${defenseCard.type}»!`, 'defend');

        // Check rankings
        const updatedRankings = checkAndRecordFinishes(updatedPlayerHand, newBots, finishedRankingsRef.current);

        // Check if there are more undefeated pairs on table for this bot to defend
        const nextUndefeated = updatedPairs.findIndex((p) => !p.defender);
        if (nextUndefeated !== -1 && newBotHand.length > 0) {
          setIsAiThinking(true);
          timeoutRef.current = setTimeout(() => {
            executeBotDefend(botId, updatedPairs, updatedPlayerHand, newBots);
          }, 600);
          return;
        }

        // All pairs are covered!
        const attacker = attackerIdRef.current;
        if (attacker === 'player') {
          if (newBotHand.length === 0) {
            setMessage(`⚔️ ${bot.name} побив вашу карту «${attackCard.type}» своєю останньою картою «${defenseCard.type}»!`);
          } else if (noTossingRef.current) {
            setMessage(`${bot.name} захистився («${defenseCard.type}»)! Правило «Без підкидання» — натисніть «Бито! (У відбій)».`);
          } else {
            const tableTypes = getTableCardTypes(updatedPairs);
            const playerCanToss = updatedPlayerHand.some((c) => tableTypes.has(c.type)) && newBotHand.length > 0;
            if (playerCanToss) {
              setMessage(`${bot.name} захистився («${defenseCard.type}»)! Ви можете підкинути карту з руки або натиснути «Бито!».`);
            } else {
              setMessage(`${bot.name} захистився («${defenseCard.type}»)! Карт для підкидання немає — натисніть «Бито! (У відбій)».`);
            }
          }
          setCurrentTurn('player');
        } else {
          // Attacker is another bot
          if (newBotHand.length === 0) {
            setMessage(`⚔️ ${bot.name} побив карту своєю останньою картою «${defenseCard.type}»!`);
          }
          setIsAiThinking(true);
          timeoutRef.current = setTimeout(() => {
            executeBotTossOrPass(attacker, botId, updatedPairs, updatedPlayerHand, newBots);
          }, 700);
        }
      } else if (!bot.hasDrawnThisDefense && currentDeck.length > 0) {
        // Uno-style draw: Bot draws 1 card from deck
        const newDeck = [...currentDeck];
        const drawnCard = newDeck.pop()!;
        deckRef.current = newDeck;
        setDeck(newDeck);

        const newBotHandWithDrawn = [...currBotHand, drawnCard];
        const newBotsWithDrawn = updatedBots.map((b) =>
          b.id === botId ? { ...b, hand: newBotHandWithDrawn, hasDrawnThisDefense: true } : b
        );
        botsRef.current = newBotsWithDrawn;
        setBots(newBotsWithDrawn);

        soundManager.playCardSound();
        addLog(`${bot.name} не мав чим побити «${attackCard.type}» і бере 1 карту з колоди (+1).`, 'system');
        setMessage(`${bot.name} взяв карту з колоди...`);

        setIsAiThinking(true);
        timeoutRef.current = setTimeout(() => {
          setIsAiThinking(false);
          const newDefenseCard = aiChooseDefenseCard(attackCard.type, newBotHandWithDrawn);

          if (newDefenseCard) {
            // Bot defends using newly drawn or hand card
            const finalBotHand = newBotHandWithDrawn.filter((c) => c.id !== newDefenseCard.id);
            const finalBots = newBotsWithDrawn.map((b) =>
              b.id === botId ? { ...b, hand: finalBotHand, hasDrawnThisDefense: false } : b
            );
            botsRef.current = finalBots;
            setBots(finalBots);

            if (newDefenseCard.type === 'Сокира') {
              soundManager.playAxeSound();
            } else if (newDefenseCard.type === 'Пилка') {
              soundManager.playSawSound();
            } else {
              soundManager.playClashSound();
            }

            const updatedPairs = currentPairs.map((p, idx) =>
              idx === activePairIndex ? { ...p, defender: newDefenseCard } : p
            );
            tablePairsRef.current = updatedPairs;
            setTablePairs(updatedPairs);

            addLog(`${bot.name} захистився картою «${newDefenseCard.type}» (після підбору)!`, 'defend');
            checkAndRecordFinishes(updatedPlayerHand, finalBots, finishedRankingsRef.current);

            const attacker = attackerIdRef.current;
            if (attacker === 'player') {
              if (finalBotHand.length === 0) {
                setMessage(`⚔️ ${bot.name} побив вашу карту «${attackCard.type}» своєю останньою картою «${newDefenseCard.type}»!`);
              } else if (noTossingRef.current) {
                setMessage(`${bot.name} взяв карту й захистився («${newDefenseCard.type}»)! Правило «Без підкидання» — натисніть «Бито! (У відбій)».`);
              } else {
                const tableTypes = getTableCardTypes(updatedPairs);
                const playerCanToss = updatedPlayerHand.some((c) => tableTypes.has(c.type)) && finalBotHand.length > 0;
                if (playerCanToss) {
                  setMessage(`${bot.name} взяв карту й захистився («${newDefenseCard.type}»)! Можете підкинути або «Бито!».`);
                } else {
                  setMessage(`${bot.name} взяв карту й захистився («${newDefenseCard.type}»)! Натисніть «Бито! (У відбій)».`);
                }
              }
              setCurrentTurn('player');
            } else {
              if (finalBotHand.length === 0) {
                setMessage(`⚔️ ${bot.name} побив карту своєю останньою картою «${newDefenseCard.type}»!`);
              }
              setIsAiThinking(true);
              timeoutRef.current = setTimeout(() => {
                executeBotTossOrPass(attacker, botId, updatedPairs, updatedPlayerHand, finalBots);
              }, 700);
            }
          } else {
            // Bot cannot defend even after drawing 1 card -> Takes cards!
            handleBotTake(botId, currentPairs, updatedPlayerHand, newBotsWithDrawn);
          }
        }, 750);
      } else {
        // Bot cannot defend -> Takes cards!
        handleBotTake(botId, currentPairs, updatedPlayerHand, updatedBots);
      }
    }, 700);
  };

  // --- BOT TAKES CARDS ---
  const handleBotTake = (
    botId: PlayerId,
    currentPairs: TablePair[],
    currPlayerHand: Card[],
    currBots: BotPlayer[]
  ) => {
    const bot = currBots.find((b) => b.id === botId);
    if (!bot) return;

    soundManager.playTakeSound();
    addLog(`${bot.name} (${bot.emoji}) не може побити атаку і каже: «Забираю»!`, 'take');

    const attacker = attackerIdRef.current;
    if (attacker === 'player' && !noTossingRef.current) {
      const tableTypes = getTableCardTypes(currentPairs);
      const playerCanGiveMore = currPlayerHand.some((c) => tableTypes.has(c.type)) && currentPairs.length < bot.hand.length;

      if (playerCanGiveMore) {
        setMessage(`${bot.name} каже: «Забираю»! Ви можете підкинути ще («Дати ще») або натиснути «Завершити хід».`);
        setIsOpponentTaking(true);
        setCurrentTurn('player');
        return;
      }
    }

    // Bot takes cards (player cannot give more, noTossing is active, or bot vs bot)
    setMessage(`${bot.name} не зміг побити й забирає карти зі столу.`);
    setIsAiThinking(true);
    timeoutRef.current = setTimeout(() => {
      finishBotTake(botId, currentPairs, currPlayerHand, currBots);
    }, 900);
  };

  // --- FINISH BOT TAKE ---
  const finishBotTake = (
    botId: PlayerId,
    pairsToTake: TablePair[],
    currPlayerHand: Card[],
    currBots: BotPlayer[]
  ) => {
    setIsAiThinking(false);
    setIsOpponentTaking(false);

    const allTableCards: Card[] = [];
    pairsToTake.forEach((p) => {
      allTableCards.push(p.attacker);
      if (p.defender) allTableCards.push(p.defender);
    });

    const newBots = currBots.map((b) =>
      b.id === botId
        ? { ...b, hand: [...b.hand, ...allTableCards], hasDrawnThisDefense: false }
        : b
    );
    botsRef.current = newBots;
    setBots(newBots);
    setTablePairs([]);
    tablePairsRef.current = [];

    addLog(`${getPlayerInfo(botId).name} забрав усі карти зі столу (${allTableCards.length} шт.).`, 'take');
    soundManager.playTakeSound();

    let effectivePlayerHand = currPlayerHand;
    let effectiveBots = newBots;

    // Режим «З добором (до 4 карт)»: атакуючий добирає до 4 карт
    if (refillHandTo4Ref.current && deckRef.current.length > 0) {
      const attacker = attackerIdRef.current;
      const refillRes = performRefillTo4(currPlayerHand, newBots, [attacker]);
      effectivePlayerHand = refillRes.nextPlayerHand;
      effectiveBots = refillRes.nextBots;
    }

    const updatedRankings = checkAndRecordFinishes(effectivePlayerHand, effectiveBots, finishedRankingsRef.current);
    const activeRing = getActivePlayerRing(effectivePlayerHand, effectiveBots, updatedRankings);
    const nextAttacker = getNextActivePlayer(botId, activeRing) || 'player';
    const nextDefender = getNextActivePlayer(nextAttacker, activeRing) || 'player';

    attackerIdRef.current = nextAttacker;
    defenderIdRef.current = nextDefender;
    setAttackerId(nextAttacker);
    setDefenderId(nextDefender);

    if (nextAttacker === 'player') {
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Ваш новий хід для атаки! Атакуйте ${defInfo.name} (${defInfo.emoji}).`);
      setCurrentTurn('player');
    } else {
      const attInfo = getPlayerInfo(nextAttacker);
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Хід переходить до ${attInfo.name} (${attInfo.emoji}). Він атакує ${defInfo.name}...`);
      setCurrentTurn(nextAttacker);

      setIsAiThinking(true);
      timeoutRef.current = setTimeout(() => {
        executeBotAttack(nextAttacker, nextDefender, effectivePlayerHand, effectiveBots);
      }, 800);
    }
  };

  // --- BOT ATTACK INITIATION ---
  const executeBotAttack = (
    attBotId: PlayerId,
    defId: PlayerId,
    currPlayerHand: Card[],
    currBots: BotPlayer[]
  ) => {
    const bot = currBots.find((b) => b.id === attBotId);
    if (!bot || bot.hand.length === 0) return;

    setIsAiThinking(true);

    timeoutRef.current = setTimeout(() => {
      setIsAiThinking(false);

      const attackCard = aiChooseAttackCard(bot.hand);
      const remainingBotHand = bot.hand.filter((c) => c.id !== attackCard.id);

      const newBots = currBots.map((b) =>
        b.id === attBotId ? { ...b, hand: remainingBotHand, hasDrawnThisDefense: false } : b
      );
      botsRef.current = newBots;
      setBots(newBots);

      const initialPair: TablePair = {
        id: `pair-${Date.now()}`,
        attacker: attackCard,
        defender: null,
      };

      const updatedPairs = [initialPair];
      tablePairsRef.current = updatedPairs;
      setTablePairs(updatedPairs);

      attackerIdRef.current = attBotId;
      defenderIdRef.current = defId;
      setAttackerId(attBotId);
      setDefenderId(defId);

      soundManager.playCardSound();
      addLog(`${bot.name} (${bot.emoji}) атакує картою «${attackCard.type}» гравця ${getPlayerInfo(defId).name}.`, 'attack');

      checkAndRecordFinishes(currPlayerHand, newBots, finishedRankingsRef.current);

      if (remainingBotHand.length === 0) {
        setMessage(`⚔️ ${bot.name} пішов своєю останньою картою «${attackCard.type}»!`);
      } else if (defId === 'player') {
        // Player must defend
        const hasCounter = currPlayerHand.some((c) => canBeat(c.type, attackCard.type));
        if (hasCounter) {
          setMessage(`${bot.name} атакує вас: «${attackCard.type}»! Оберіть карту для захисту або візьміть з колоди (+1).`);
        } else {
          setMessage(`${bot.name} атакує вас: «${attackCard.type}»! Немає чим побити — візьміть карту (+1) або «Забрати карти».`);
        }
        setPlayerHasDrawnThisDefense(false);
        setCurrentTurn('player');
      } else {
        // Bot vs Bot defense
        setMessage(`${bot.name} атакує ${getPlayerInfo(defId).name}: «${attackCard.type}»...`);
        setCurrentTurn(defId);
        setIsAiThinking(true);
        timeoutRef.current = setTimeout(() => {
          executeBotDefend(defId, updatedPairs, currPlayerHand, newBots);
        }, 750);
      }
    }, 700);
  };

  // --- BOT TOSS OR "БИТО!" ---
  const executeBotTossOrPass = (
    attBotId: PlayerId,
    defId: PlayerId,
    currentPairs: TablePair[],
    currPlayerHand: Card[],
    currBots: BotPlayer[]
  ) => {
    const bot = currBots.find((b) => b.id === attBotId);
    const defender = defId === 'player'
      ? { hand: currPlayerHand }
      : currBots.find((b) => b.id === defId);

    if (!bot || !defender || defender.hand.length === 0 || noTossingRef.current) {
      if (noTossingRef.current && bot) {
        addLog(`${bot.name} каже: «Бито!» (правило «Без підкидання»).`, 'system');
      }
      handleCompleteBito(currentPairs, attBotId, defId, currPlayerHand, currBots);
      return;
    }

    setIsAiThinking(true);

    timeoutRef.current = setTimeout(() => {
      setIsAiThinking(false);

      const tossCard = aiChooseTossCard(bot.hand, currentPairs, defender.hand.length);

      if (tossCard) {
        // Bot tosses a card!
        const remainingBotHand = bot.hand.filter((c) => c.id !== tossCard.id);
        const newBots = currBots.map((b) =>
          b.id === attBotId ? { ...b, hand: remainingBotHand, hasDrawnThisDefense: false } : b
        );
        botsRef.current = newBots;
        setBots(newBots);

        const newPair: TablePair = {
          id: `pair-${Date.now()}-${Math.random()}`,
          attacker: tossCard,
          defender: null,
        };
        const updatedPairs = [...currentPairs, newPair];
        tablePairsRef.current = updatedPairs;
        setTablePairs(updatedPairs);

        soundManager.playCardSound();
        addLog(`${bot.name} підкинув карту «${tossCard.type}»!`, 'attack');

        checkAndRecordFinishes(currPlayerHand, newBots, finishedRankingsRef.current);

        if (remainingBotHand.length === 0) {
          setMessage(`⚔️ ${bot.name} підкинув свою останню карту «${tossCard.type}»!`);
        } else if (defId === 'player') {
          setPlayerHasDrawnThisDefense(false);
          const hasCounter = currPlayerHand.some((c) => canBeat(c.type, tossCard.type));
          if (hasCounter) {
            setMessage(`${bot.name} підкидає: «${tossCard.type}»! Відбийтеся відповідною картою або візьміть з колоди (+1).`);
          } else {
            setMessage(`${bot.name} підкидає: «${tossCard.type}»! Немає чим побити — візьміть з колоди (+1) або «Забрати карти».`);
          }
          setCurrentTurn('player');
        } else {
          setCurrentTurn(defId);
          setIsAiThinking(true);
          timeoutRef.current = setTimeout(() => {
            executeBotDefend(defId, updatedPairs, currPlayerHand, newBots);
          }, 700);
        }
      } else {
        // Bot passes ("Бито!")
        addLog(`${bot.name} каже: «Бито!» Карти йдуть у відбій.`, 'system');
        handleCompleteBito(currentPairs, attBotId, defId, currPlayerHand, currBots);
      }
    }, 750);
  };

  // --- REFILL HANDS TO 4 (ПРАВИЛО «З ДОБОРОМ ДО 4 КАРТ») ---
  const performRefillTo4 = (
    pHand: Card[],
    bList: BotPlayer[],
    drawOrder: PlayerId[]
  ): { nextPlayerHand: Card[]; nextBots: BotPlayer[]; cardsWereDrawn: boolean } => {
    if (!refillHandTo4Ref.current || deckRef.current.length === 0) {
      return { nextPlayerHand: pHand, nextBots: bList, cardsWereDrawn: false };
    }

    const currentDeck = [...deckRef.current];
    let nextPlayerHand = [...pHand];
    let nextBots = bList.map((b) => ({ ...b, hand: [...b.hand] }));
    let drawnTotal = 0;

    drawOrder.forEach((pid) => {
      if (currentDeck.length === 0) return;

      if (pid === 'player') {
        const needed = Math.max(0, 4 - nextPlayerHand.length);
        if (needed > 0 && currentDeck.length > 0) {
          const count = Math.min(needed, currentDeck.length);
          const drawn = currentDeck.splice(currentDeck.length - count, count);
          nextPlayerHand = [...nextPlayerHand, ...drawn];
          drawnTotal += count;
        }
      } else {
        const bIdx = nextBots.findIndex((b) => b.id === pid);
        if (bIdx !== -1) {
          const needed = Math.max(0, 4 - nextBots[bIdx].hand.length);
          if (needed > 0 && currentDeck.length > 0) {
            const count = Math.min(needed, currentDeck.length);
            const drawn = currentDeck.splice(currentDeck.length - count, count);
            nextBots[bIdx].hand = [...nextBots[bIdx].hand, ...drawn];
            drawnTotal += count;
          }
        }
      }
    });

    if (drawnTotal > 0) {
      deckRef.current = currentDeck;
      setDeck(currentDeck);
      playerHandRef.current = nextPlayerHand;
      setPlayerHand(nextPlayerHand);
      botsRef.current = nextBots;
      setBots(nextBots);
      soundManager.playDrawSound();
      addLog(`Гравці по черзі добрали карти з колоди до 4 шт. (У колоді залишилось: ${currentDeck.length}).`, 'system');
      return { nextPlayerHand, nextBots, cardsWereDrawn: true };
    }

    return { nextPlayerHand: pHand, nextBots: bList, cardsWereDrawn: false };
  };

  // --- COMPLETE BITO (SEND TO DISCARD) ---
  const handleCompleteBito = (
    pairsToSend: TablePair[],
    whoWasAttacker: PlayerId,
    whoWasDefender: PlayerId,
    currPlayerHand: Card[],
    currBots: BotPlayer[]
  ) => {
    const cardsToDiscard: Card[] = [];
    pairsToSend.forEach((p) => {
      cardsToDiscard.push(p.attacker);
      if (p.defender) cardsToDiscard.push(p.defender);
    });

    setDiscardPile((prev) => [...prev, ...cardsToDiscard]);
    setTablePairs([]);
    tablePairsRef.current = [];
    setPlayerHasDrawnThisDefense(false);

    let effectivePlayerHand = currPlayerHand;
    let effectiveBots = currBots;

    // Режим «З добором (до 4 карт)»: спочатку добирає атакуючий, потім той, хто захищався
    if (refillHandTo4Ref.current && deckRef.current.length > 0) {
      const refillRes = performRefillTo4(currPlayerHand, currBots, [whoWasAttacker, whoWasDefender]);
      effectivePlayerHand = refillRes.nextPlayerHand;
      effectiveBots = refillRes.nextBots;
    }

    // Check finishes
    const updatedRankings = checkAndRecordFinishes(effectivePlayerHand, effectiveBots, finishedRankingsRef.current);
    const activeRing = getActivePlayerRing(effectivePlayerHand, effectiveBots, updatedRankings);

    if (activeRing.length <= 1) {
      return;
    }

    let nextAttacker = activeRing.includes(whoWasDefender)
      ? whoWasDefender
      : getNextActivePlayer(whoWasDefender, activeRing) || activeRing[0];

    let nextDefender = getNextActivePlayer(nextAttacker, activeRing) || activeRing[0];

    attackerIdRef.current = nextAttacker;
    defenderIdRef.current = nextDefender;
    setAttackerId(nextAttacker);
    setDefenderId(nextDefender);

    if (nextAttacker === 'player') {
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Бито! Ви успішно відбилися — тепер ваш хід для атаки на ${defInfo.name} (${defInfo.emoji}).`);
      setCurrentTurn('player');
    } else {
      const attInfo = getPlayerInfo(nextAttacker);
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Бито! Карти у відбої. Тепер ${attInfo.name} (${attInfo.emoji}) атакує ${defInfo.name}...`);
      setCurrentTurn(nextAttacker);

      setIsAiThinking(true);
      timeoutRef.current = setTimeout(() => {
        executeBotAttack(nextAttacker, nextDefender, effectivePlayerHand, effectiveBots);
      }, 800);
    }
  };

  // --- PLAYER ACTIONS ---

  // When player clicks "Бито!" button
  const handlePlayerBitoClick = () => {
    if (currentTurn !== 'player' || attackerId !== 'player' || tablePairs.length === 0 || winner || isGameOverPending) return;
    const allCovered = tablePairs.every((p) => p.defender !== null);
    if (!allCovered) return;

    soundManager.playBitoSound();
    addLog('Ви оголосили: «Бито!» Всі карти відправлено у відбій.', 'system');
    handleCompleteBito(tablePairs, 'player', defenderId, playerHandRef.current, botsRef.current);
  };

  // When player clicks card in hand
  const handlePlayerCardClick = (card: Card, index: number) => {
    if (currentTurn !== 'player' || winner || isAiThinking || isGameOverPending) return;

    // --- CASE 0: DEFENDER IS TAKING (Player can give more matching cards) ---
    if (isOpponentTaking) {
      const tableTypes = getTableCardTypes(tablePairs);
      if (!tableTypes.has(card.type)) {
        setMessage(`Карту «${card.type}» не можна дати (такого типу немає на столі). Натисніть «Завершити хід».`);
        return;
      }

      const targetBot = bots.find((b) => b.id === defenderId);
      if (targetBot && tablePairs.length >= targetBot.hand.length) {
        setMessage(`Більше карт дати не можна (ліміт руки ${targetBot.name}: ${targetBot.hand.length}). Натисніть «Завершити хід».`);
        return;
      }

      const newPlayerHand = playerHand.filter((c) => c.id !== card.id);
      const newPair: TablePair = {
        id: `pair-${Date.now()}-${Math.random()}`,
        attacker: card,
        defender: null,
      };
      const updatedPairs = [...tablePairs, newPair];

      playerHandRef.current = newPlayerHand;
      tablePairsRef.current = updatedPairs;
      setPlayerHand(newPlayerHand);
      setTablePairs(updatedPairs);

      soundManager.playCardSound();
      addLog(`Ви додали ще одну карту «${card.type}».`, 'attack');

      checkAndRecordFinishes(newPlayerHand, botsRef.current, finishedRankingsRef.current);

      const newTableTypes = getTableCardTypes(updatedPairs);
      const stillCanGive = newPlayerHand.some((c) => newTableTypes.has(c.type));
      if (stillCanGive) {
        setMessage(`Ви дали ще «${card.type}». Можете дати ще або натиснути «Завершити хід».`);
      } else {
        setMessage(`Ви дали «${card.type}». Натисніть «Завершити хід».`);
      }
      return;
    }

    // --- CASE 1: INITIAL ATTACK (Player attacks defender) ---
    if (tablePairs.length === 0 && attackerId === 'player') {
      const newPlayerHand = playerHand.filter((c) => c.id !== card.id);
      const newPair: TablePair = {
        id: `pair-${Date.now()}`,
        attacker: card,
        defender: null,
      };

      playerHandRef.current = newPlayerHand;
      tablePairsRef.current = [newPair];
      setPlayerHand(newPlayerHand);
      setTablePairs([newPair]);

      soundManager.playCardSound();
      const defInfo = getPlayerInfo(defenderId);
      addLog(`Ви атакували гравця ${defInfo.name} (${defInfo.emoji}) картою «${card.type}».`, 'attack');
      setMessage(`Ви атакували ${defInfo.name} картою «${card.type}». Супротивник обмірковує захист...`);

      checkAndRecordFinishes(newPlayerHand, botsRef.current, finishedRankingsRef.current);

      setCurrentTurn(defenderId);
      executeBotDefend(defenderId, [newPair], newPlayerHand, botsRef.current);
      return;
    }

    // --- CASE 2: TOSSING (Player is attacker, all table cards beaten, tossing matching card) ---
    const allCovered = tablePairs.every((p) => p.defender !== null);
    if (attackerId === 'player' && allCovered) {
      if (noTossingRef.current) {
        setMessage('Правило «Без підкидання» активне! Натисніть «Бито! (У відбій)».');
        return;
      }

      const targetBot = bots.find((b) => b.id === defenderId);
      if (targetBot && targetBot.hand.length === 0) {
        setMessage(`У ${targetBot.name} не залишилося карт у руці! Натисніть «Бито!».`);
        return;
      }

      const tableTypes = getTableCardTypes(tablePairs);
      if (!tableTypes.has(card.type)) {
        setMessage(`Карту «${card.type}» не можна підкинути (немає на столі). Натисніть «Бито! (У відбій)».`);
        return;
      }

      const newPlayerHand = playerHand.filter((c) => c.id !== card.id);
      const newTossedPair: TablePair = {
        id: `pair-${Date.now()}-${Math.random()}`,
        attacker: card,
        defender: null,
      };
      const updatedPairs = [...tablePairs, newTossedPair];

      playerHandRef.current = newPlayerHand;
      tablePairsRef.current = updatedPairs;
      setPlayerHand(newPlayerHand);
      setTablePairs(updatedPairs);

      soundManager.playCardSound();
      const defInfo = getPlayerInfo(defenderId);
      addLog(`Ви підкинули карту «${card.type}» для ${defInfo.name}!`, 'attack');
      setMessage(`Ви підкинули: «${card.type}». ${defInfo.name} обмірковує захист...`);

      checkAndRecordFinishes(newPlayerHand, botsRef.current, finishedRankingsRef.current);

      setCurrentTurn(defenderId);
      executeBotDefend(defenderId, updatedPairs, newPlayerHand, botsRef.current);
      return;
    }

    // --- CASE 3: DEFENSE (Player is defender and beats an attacking card) ---
    if (defenderId === 'player') {
      const activePairIndex = tablePairs.findIndex((p) => !p.defender);
      if (activePairIndex === -1) return;

      const targetPair = tablePairs[activePairIndex];
      const attackCard = targetPair.attacker;

      if (!canBeat(card.type, attackCard.type)) {
        setMessage(`Карта «${card.type}» не може побити «${attackCard.type}»! Оберіть іншу або візьміть з колоди.`);
        return;
      }

      // Valid defense!
      setPlayerHasDrawnThisDefense(false);
      const newPlayerHand = playerHand.filter((c) => c.id !== card.id);
      playerHandRef.current = newPlayerHand;
      setPlayerHand(newPlayerHand);

      if (card.type === 'Сокира') {
        soundManager.playAxeSound();
      } else if (card.type === 'Пилка') {
        soundManager.playSawSound();
      } else {
        soundManager.playClashSound();
      }

      const updatedPairs = tablePairs.map((p, idx) =>
        idx === activePairIndex ? { ...p, defender: card } : p
      );
      tablePairsRef.current = updatedPairs;
      setTablePairs(updatedPairs);

      addLog(`Ви захистилися: ваша карта «${card.type}» побила «${attackCard.type}»!`, 'defend');
      setMessage(`Ви успішно побили «${attackCard.type}» картою «${card.type}»!`);

      checkAndRecordFinishes(newPlayerHand, botsRef.current, finishedRankingsRef.current);

      // Now the attacker evaluates tossing or passing
      setCurrentTurn(attackerId);
      executeBotTossOrPass(attackerId, 'player', updatedPairs, newPlayerHand, botsRef.current);
    }
  };

  // When player draws 1 card from deck
  const handlePlayerDrawOneCard = () => {
    const activeUndefended = tablePairs.find((p) => !p.defender);
    if (currentTurn !== 'player' || defenderId !== 'player' || !activeUndefended || playerHasDrawnThisDefense || isAiThinking || winner || isGameOverPending) return;
    if (deck.length === 0) {
      setMessage('Колода спорожніла! Більше не можна взяти карту.');
      return;
    }

    const newDeck = [...deck];
    const drawn = newDeck.pop()!;
    deckRef.current = newDeck;
    setDeck(newDeck);

    const newHand = [...playerHand, drawn];
    playerHandRef.current = newHand;
    setPlayerHand(newHand);
    setPlayerHasDrawnThisDefense(true);

    soundManager.playDrawSound();
    addLog(`Ви взяли 1 карту з колоди: «${drawn.type}» (+1).`, 'system');

    const attackType = activeUndefended.attacker.type;
    const canBeatNow = canBeat(drawn.type, attackType);
    if (canBeatNow) {
      setMessage(`Ви витягли «${drawn.type}» — вона б'є «${attackType}»! Зіграйте її для захисту.`);
    } else {
      const anyCanBeat = newHand.some((c) => canBeat(c.type, attackType));
      if (anyCanBeat) {
        setMessage(`Ви витягли «${drawn.type}». У вас є інша карта в руці для захисту — або заберіть карти.`);
      } else {
        setMessage(`Ви витягли «${drawn.type}», але вона не б'є «${attackType}». Натисніть «Забрати карти («Беру»)».`);
      }
    }
  };

  // When player clicks "Забрати карти («Беру»)"
  const handlePlayerTakeCards = () => {
    if (currentTurn !== 'player' || tablePairs.length === 0 || defenderId !== 'player' || winner || isAiThinking || isGameOverPending) return;

    soundManager.playTakeSound();
    setPlayerHasDrawnThisDefense(false);

    // Attacker bot tosses matching cards in pursuit if any (if tossing is allowed)
    const tableTypes = getTableCardTypes(tablePairs);
    const attackerBot = bots.find((b) => b.id === attackerId);
    let updatedPairs = [...tablePairs];
    let updatedBots = [...bots];

    if (attackerBot && !noTossingRef.current) {
      const tossable = attackerBot.hand.filter((c) => tableTypes.has(c.type));
      if (tossable.length > 0) {
        let remainingAttHand = [...attackerBot.hand];
        tossable.forEach((tc) => {
          remainingAttHand = remainingAttHand.filter((c) => c.id !== tc.id);
          updatedPairs.push({
            id: `pair-${Date.now()}-${Math.random()}`,
            attacker: tc,
            defender: null,
          });
          addLog(`${attackerBot.name} додав вам карту «${tc.type}» вдогонку!`, 'attack');
        });
        updatedBots = updatedBots.map((b) =>
          b.id === attackerId ? { ...b, hand: remainingAttHand } : b
        );
        botsRef.current = updatedBots;
        setBots(updatedBots);
      }
    }

    const allTableCards: Card[] = [];
    updatedPairs.forEach((p) => {
      allTableCards.push(p.attacker);
      if (p.defender) allTableCards.push(p.defender);
    });

    const newPlayerHand = [...playerHand, ...allTableCards];
    playerHandRef.current = newPlayerHand;
    setPlayerHand(newPlayerHand);
    setTablePairs([]);
    tablePairsRef.current = [];

    addLog(`Ви забрали всі карти зі столу (${allTableCards.length} шт.).`, 'take');
    soundManager.playTakeSound();

    let effectivePlayerHand = newPlayerHand;
    let effectiveBots = updatedBots;

    // Режим «З добором (до 4 карт)»: атакуючий добирає до 4 карт
    if (refillHandTo4Ref.current && deckRef.current.length > 0) {
      const refillRes = performRefillTo4(newPlayerHand, updatedBots, [attackerId]);
      effectivePlayerHand = refillRes.nextPlayerHand;
      effectiveBots = refillRes.nextBots;
    }

    const updatedRankings = checkAndRecordFinishes(effectivePlayerHand, effectiveBots, finishedRankingsRef.current);
    const activeRing = getActivePlayerRing(effectivePlayerHand, effectiveBots, updatedRankings);

    const nextAttacker = getNextActivePlayer('player', activeRing) || activeRing[0];
    const nextDefender = getNextActivePlayer(nextAttacker, activeRing) || activeRing[0];

    attackerIdRef.current = nextAttacker;
    defenderIdRef.current = nextDefender;
    setAttackerId(nextAttacker);
    setDefenderId(nextDefender);

    if (nextAttacker === 'player') {
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Ваш хід для атаки на ${defInfo.name} (${defInfo.emoji}).`);
      setCurrentTurn('player');
    } else {
      const attInfo = getPlayerInfo(nextAttacker);
      const defInfo = getPlayerInfo(nextDefender);
      setMessage(`Ви забрали карти. Хід переходить до ${attInfo.name} (${attInfo.emoji}). Він атакує ${defInfo.name}...`);
      setCurrentTurn(nextAttacker);

      setIsAiThinking(true);
      timeoutRef.current = setTimeout(() => {
        executeBotAttack(nextAttacker, nextDefender, newPlayerHand, updatedBots);
      }, 850);
    }
  };

  // When player clicks "Дати ще" button
  const handleGiveOneMore = () => {
    if (!isOpponentTaking) return;
    const tableTypes = getTableCardTypes(tablePairs);
    const matchingCard = playerHand.find((c) => tableTypes.has(c.type));
    if (matchingCard) {
      handlePlayerCardClick(matchingCard, 0);
    }
  };

  // When player clicks "Завершити хід" button after opponent takes
  const handleFinishTurn = () => {
    finishBotTake(defenderId, tablePairs, playerHand, bots);
  };

  // Determine active cards and UI helpers
  const tableTypes = getTableCardTypes(tablePairs);
  const allTableCovered = tablePairs.length > 0 && tablePairs.every((p) => p.defender !== null);
  const activeUndefendedPair = tablePairs.find((p) => !p.defender);

  const targetBotForTake = bots.find((b) => b.id === defenderId);
  const nextMatchingCard = isOpponentTaking
    ? playerHand.find((c) => tableTypes.has(c.type))
    : undefined;
  const playerCanGiveMore = Boolean(
    isOpponentTaking &&
    nextMatchingCard &&
    targetBotForTake &&
    tablePairs.length < targetBotForTake.hand.length
  );

  const playerCanToss =
    !noTossing &&
    currentTurn === 'player' &&
    attackerId === 'player' &&
    allTableCovered &&
    Boolean(targetBotForTake && targetBotForTake.hand.length > 0) &&
    playerHand.some((c) => tableTypes.has(c.type));

  const canPlayerDrawFromDeck =
    currentTurn === 'player' &&
    defenderId === 'player' &&
    Boolean(activeUndefendedPair) &&
    !playerHasDrawnThisDefense &&
    deck.length > 0 &&
    !isAiThinking;

  const currentAttackerInfo = getPlayerInfo(attackerId);
  const currentDefenderInfo = getPlayerInfo(defenderId);
  const currentTournamentStage = TOURNAMENT_STAGES_CONFIG[tournamentState.currentStageIndex];

  // --- KEYBOARD SYNCHRONIZATION WITH ON-SCREEN BUTTONS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Check for Modal close on Escape
      if (e.key === 'Escape') {
        if (showRules) { setShowRules(false); return; }
        if (showDiscard) { setShowDiscard(false); return; }
        if (showTournamentModal) { setShowTournamentModal(false); return; }
        if (showChainAnimation) { setShowChainAnimation(false); return; }
        if (showMobileMenu) { setShowMobileMenu(false); return; }
        if (showDifficultyModal) { setShowDifficultyModal(false); return; }
        if (showSettingsModal) { setShowSettingsModal(false); return; }
        if (showCycleGuide) { setShowCycleGuide(false); return; }

        // If in game defending, Escape can act as "Забрати карти («Беру»)"
        if (currentTurn === 'player' && defenderId === 'player' && activeUndefendedPair && !isAiThinking && !winner) {
          e.preventDefault();
          handlePlayerTakeCards();
          return;
        }
      }

      // If game has a winner, Space/Enter/R starts new game
      if (winner) {
        if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'к') {
          e.preventDefault();
          startGame(gameMode, botCount);
        }
        return;
      }

      // Restart hotkey: 'r' or 'R' or 'к' (Ukrainian keyboard layout)
      if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'к') {
        e.preventDefault();
        startGame(gameMode, botCount);
        return;
      }

      // Sound mute toggle: 'm' or 'M' or 'ь'
      if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'ь') {
        e.preventDefault();
        handleToggleSound();
        return;
      }

      // Rules modal toggle: 'h' or 'H' or 'р' or '?'
      if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'р' || e.key === '?') {
        e.preventDefault();
        setShowRules((prev) => !prev);
        return;
      }

      // If game is not active for player or AI is thinking, ignore action keys
      if (currentTurn !== 'player' || isAiThinking || isGameOverPending) {
        return;
      }

      // Number keys 1-9: Play corresponding card in player's hand
      if (/^[1-9]$/.test(e.key)) {
        const cardIndex = parseInt(e.key, 10) - 1;
        if (cardIndex >= 0 && cardIndex < playerHand.length) {
          e.preventDefault();
          handlePlayerCardClick(playerHand[cardIndex], cardIndex);
          return;
        }
      }

      // Space or Enter: Primary contextual button
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // 1. If opponent is taking, finish turn ("Завершити хід")
        if (isOpponentTaking) {
          handleFinishTurn();
          return;
        }
        // 2. If player attacked and all cards covered, "Бито! (У відбій)"
        if (attackerId === 'player' && allTableCovered) {
          handlePlayerBitoClick();
          return;
        }
      }

      // 'B' or 'b' or 'и' (or 't'): "Забрати карти («Беру»)"
      if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'и' || e.key.toLowerCase() === 't' || e.key.toLowerCase() === 'е') {
        if (defenderId === 'player' && activeUndefendedPair) {
          e.preventDefault();
          handlePlayerTakeCards();
          return;
        }
      }

      // 'D' or 'd' or 'в': "Взяти 1 карту (+1)" from deck
      if (e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 'в') {
        if (canPlayerDrawFromDeck) {
          e.preventDefault();
          handlePlayerDrawOneCard();
          return;
        }
      }

      // 'G' or 'g' or 'п': "Дати ще" when opponent is taking
      if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'п') {
        if (isOpponentTaking && playerCanGiveMore) {
          e.preventDefault();
          handleGiveOneMore();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTurn,
    attackerId,
    defenderId,
    playerHand,
    tablePairs,
    allTableCovered,
    activeUndefendedPair,
    isOpponentTaking,
    playerCanGiveMore,
    canPlayerDrawFromDeck,
    isAiThinking,
    winner,
    isGameOverPending,
    gameMode,
    botCount,
    showRules,
    showDiscard,
    showTournamentModal,
    showChainAnimation,
    showMobileMenu,
    showDifficultyModal,
    showSettingsModal,
    showCycleGuide,
  ]);

  return (
    <div className="app-root min-h-screen text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Живий фон: сяйво, зорі, світлячки, ліс */}
      <Ambient />

      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-md max-w-full">
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setShowChainAnimation(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95 group"
            title="Натисніть для перегляду анімації персонажів"
          >
            <span className="title-shimmer tracking-tight">Лісовий патруль</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
            {gameMode === 'tournament' && (
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 items-center gap-1 shrink-0 ml-1">
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{currentTournamentStage?.stageName}</span>
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tournament Bracket Button */}
          {gameMode === 'tournament' && (
            <button
              onClick={() => setShowTournamentModal(true)}
              className="h-8 px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Переглянути турнірну сітку"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Сітка</span>
            </button>
          )}

          {gameMode !== 'tournament' && (
            /* Desktop-only: Bot Count selector */
            <div className="hidden lg:inline-flex h-8 items-center bg-stone-900/80 rounded-xl px-1.5 border border-stone-800 text-xs gap-1">
              <span className="text-[11px] text-stone-400 px-1 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-stone-400" /> Боти:
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleBotCountChange(num)}
                    className={`w-5 h-5 rounded-md text-xs font-bold flex items-center justify-center transition-all ${
                      botCount === num
                        ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Header Difficulty Button */}
          <button
            onClick={() => setShowDifficultyModal(true)}
            className="hidden sm:inline-flex h-8 items-center gap-1.5 px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Змінити рівень складності ШІ"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400 font-semibold">ШІ:</span>
            <span
              className={
                difficulty === 'easy'
                  ? 'text-emerald-400 font-bold'
                  : difficulty === 'normal'
                  ? 'text-amber-400 font-bold'
                  : 'text-rose-400 font-bold'
              }
            >
              {difficulty === 'easy' ? '🟢 Легкий' : difficulty === 'normal' ? '🟡 Середній' : '🔴 Важкий'}
            </span>
          </button>

          {/* Desktop-only: Game Mode selector */}
          <div className="hidden md:inline-flex h-8 relative items-center bg-stone-900/80 rounded-xl px-2 border border-stone-800 text-xs">
            <select
              value={gameMode}
              onChange={(e) => {
                const nextMode = e.target.value as GameMode;
                setGameMode(nextMode);
                if (nextMode === 'tournament') {
                  setShowTournamentModal(true);
                }
                startGame(nextMode, botCount);
              }}
              className="bg-transparent text-stone-200 font-semibold pr-1 py-1 rounded text-xs cursor-pointer focus:outline-none"
            >
              <option value="classic" className="bg-stone-900 text-stone-200">🏆 Колода (54 карти)</option>
              <option value="tournament" className="bg-stone-900 text-amber-300 font-bold">👑 Турнір (Плей-оф)</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
            className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors border border-stone-800 active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-stone-300" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {/* Settings / Gear Button (Шестерня) */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Налаштування правил (Без підкидання, Добір до 4 карт)"
            className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors border border-stone-800 relative group shadow-sm active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-stone-300 group-hover:rotate-45 transition-transform" />
            {(noTossing || refillHandTo4) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-stone-900" />
            )}
          </button>

          {/* Desktop-only: Cycle Guide Button */}
          <button
            onClick={() => setShowCycleGuide(!showCycleGuide)}
            title="Показати харчовий ланцюг"
            className="hidden md:inline-flex h-8 px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-xs font-semibold items-center gap-1.5 transition-colors border border-stone-800 active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Ланцюг</span>
          </button>

          {/* Desktop-only: Rules Button */}
          <button
            onClick={() => setShowRules(true)}
            className="hidden md:inline-flex h-8 px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-xs font-semibold items-center gap-1.5 transition-colors border border-stone-800 active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Правила</span>
          </button>

          {/* Mobile-only Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            title="Налаштування гри"
            className="md:hidden h-8 px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-800 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[11px]">Меню</span>
          </button>

          {/* Primary Action Button (Заново / Грати) */}
          <button
            onClick={() => startGame(gameMode, botCount)}
            className="h-8 px-3 sm:px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            title="Заново / Грати (Клавіша R)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-950" />
            <span>{gameStarted ? 'Заново' : 'Грати'}</span>
            <kbd className="hidden sm:inline-flex items-center justify-center px-1 py-0.2 rounded bg-amber-600/50 border border-amber-700/40 text-[9px] font-mono font-bold text-stone-950">
              R
            </kbd>
          </button>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-5 flex flex-col justify-between gap-2.5 sm:gap-4 overflow-hidden">
        {/* Banner with battle match indicator */}
        <div className="bg-stone-900/85 border border-stone-800 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-md flex items-center justify-between gap-2.5 backdrop-blur-sm min-h-[46px]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
            <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
              currentTurn === 'player'
                ? 'bg-emerald-400 ring-2 ring-emerald-500/40 animate-pulse'
                : 'bg-amber-400 ring-2 ring-amber-500/40 animate-pulse'
            }`} />

            {/* Centered battle chips */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* Хто ходить до кого (Чітко й наочно) */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs sm:text-sm font-black leading-none">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                  <span className="text-rose-400">⚔️</span>
                  <span>{currentAttackerInfo.name}</span>
                  <span className="text-xs">{currentAttackerInfo.emoji}</span>
                </span>

                <span className="text-amber-400 font-bold text-xs px-0.5">➔</span>

                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  <span className="text-emerald-400">🛡️</span>
                  <span>{currentDefenderInfo.name}</span>
                  <span className="text-xs">{currentDefenderInfo.emoji}</span>
                </span>

                {gameMode === 'tournament' && currentTournamentStage && (
                  <span className="text-amber-400/90 font-semibold hidden md:inline border-l border-stone-700 pl-2 text-[11px] shrink-0">
                    🏆 {currentTournamentStage.stageName}
                  </span>
                )}
              </div>

              {noTossing && (
                <span className="hidden xl:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0" title="Правило: Без підкидання (атака 1 картою)">
                  Без підкидання
                </span>
              )}

              {refillHandTo4 && (
                <span className="hidden xl:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0" title="Правило: Добір з колоди до 4 карт">
                  Добір до 4
                </span>
              )}
            </div>
          </div>

          {/* Індикатор складності та лічильники */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Лаконічний індикатор складності (відкриває модальне вікно) */}
            <button
              onClick={() => setShowDifficultyModal(true)}
              className={`group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
                difficulty === 'easy'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500'
                  : difficulty === 'normal'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 hover:border-rose-500'
              }`}
              title="Натисніть для зміни рівня складності ШІ"
            >
              <span>{difficulty === 'easy' ? '🟢' : difficulty === 'normal' ? '🟡' : '🔴'}</span>
              <span className="hidden xs:inline">
                {difficulty === 'easy' ? 'Легкий' : difficulty === 'normal' ? 'Середній' : 'Важкий'}
              </span>
              <Sliders className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>

            {(stats.tournamentWins || 0) > 0 && (
              <div
                onClick={() => setShowTournamentModal(true)}
                className="cursor-pointer flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-xl text-xs text-amber-300 font-bold hover:bg-amber-500/25 transition-colors"
                title="Здобуті турнірні кубки"
              >
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{stats.tournamentWins}</span>
              </div>
            )}
            {stats.streak > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-xl text-xs text-amber-300 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{stats.streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Full Survival Wheel Overlay if clicked */}
        {showCycleGuide && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <CycleWheel
              currentHighlighted={activeUndefendedPair ? activeUndefendedPair.attacker.type : null}
              onClose={() => setShowCycleGuide(false)}
            />
          </div>
        )}

        {/* Bot Opponents Area (Grid for 1-4 bots) */}
        <div className={`grid gap-2 sm:gap-3 ${
          bots.length === 1
            ? 'grid-cols-1'
            : bots.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : bots.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          {bots.map((bot) => {
            const isAttacker = attackerId === bot.id;
            const isDefender = defenderId === bot.id;
            const ranking = finishedRankings.find((r) => r.id === bot.id);
            const isFinished = Boolean(ranking);

            return (
              <div
                key={bot.id}
                className={`bg-stone-900/70 border rounded-2xl p-2 sm:p-3 flex flex-col justify-between relative overflow-hidden transition-all ${
                  isAttacker
                    ? 'border-rose-500/80 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/50'
                    : isDefender
                    ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                    : 'border-stone-800/80'
                } ${isFinished ? 'opacity-50 grayscale-[50%]' : ''}`}
              >
                {/* Header of bot card */}
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-base shadow shrink-0">
                      {bot.emoji}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-200 flex items-center gap-1 leading-tight">
                        <span className="truncate max-w-[80px] sm:max-w-none">{bot.name}</span>
                        {isAttacker && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold border border-rose-500/40">
                            ⚔️ Атака
                          </span>
                        )}
                        {isDefender && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold border border-emerald-500/40">
                            🛡️ Захист
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-stone-400">{bot.role}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 font-mono bg-stone-950/70 px-2 py-0.5 rounded-lg border border-stone-800 shrink-0">
                    {isFinished ? (
                      <span className="text-amber-400 font-bold">🏆 {ranking?.rank}-е місце</span>
                    ) : (
                      <>Карт: <b className="text-amber-300">{bot.hand.length}</b></>
                    )}
                  </div>
                </div>

                {/* Bot Cards (Face Down) - Compact 1 Row */}
                {!isFinished ? (
                  <div className="flex items-center justify-center gap-1 flex-nowrap max-w-full overflow-x-auto py-1 px-0.5">
                    {bot.hand.map((card, idx) => (
                      <CardView
                        key={card.id || idx}
                        faceDown
                        size="xs"
                        className="transform hover:scale-105 transition-transform shrink-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-amber-300 font-bold bg-amber-500/10 rounded-lg border border-amber-500/20">
                    Всі карти скинуто!
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Middle: Battle Table & Card Piles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-stretch">
          {/* Left Column: Card Piles (Стіпки карт зліва, по висоті як стіл) */}
          <div className="hidden md:flex flex-row justify-center items-center gap-3 sm:gap-4 order-2 md:order-1 md:col-span-3 lg:col-span-3 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3 shadow-md h-full">
            {/* Discard (Відбій) Pile - зліва від колоди */}
            <div className="relative text-center">
              <div className="text-[10px] uppercase font-bold text-stone-400 mb-1 flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3 text-stone-400" />
                <span>Відбій</span>
              </div>
              {discardPile.length > 0 && discardPile[discardPile.length - 1] ? (
                <button
                  onClick={() => setShowDiscard(true)}
                  className="group relative cursor-pointer"
                  title="Натисніть для перегляду вибулих карт"
                >
                  <CardView
                    type={discardPile[discardPile.length - 1].type}
                    size="sm"
                    countBadge={discardPile.length}
                    className="opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ) : (
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-600 text-[10px]">
                  0 карт
                </div>
              )}
            </div>

            {/* Deck Pile - зправа від відбою */}
            <div className="relative text-center">
              <div className="text-[10px] uppercase font-bold text-stone-400 mb-1 flex items-center justify-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Колода</span>
              </div>
              {deck.length > 0 ? (
                <div
                  onClick={canPlayerDrawFromDeck ? handlePlayerDrawOneCard : undefined}
                  className={`relative ${canPlayerDrawFromDeck ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform animate-pulse' : ''}`}
                  title={canPlayerDrawFromDeck ? 'Натисніть, щоб взяти 1 карту з колоди (+1)' : 'Колода'}
                >
                  <CardView faceDown size="sm" countBadge={deck.length} highlight={canPlayerDrawFromDeck} />
                  {canPlayerDrawFromDeck && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-md border border-stone-900 z-30">
                      +1 карта
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-600 text-[10px]">
                  Порожня
                </div>
              )}
            </div>
          </div>

          {/* Center: Clash Table Area (Ігровий стіл по центру) */}
          <div className="arena-felt order-1 md:order-2 md:col-span-6 lg:col-span-6 bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-2 border-stone-800/80 rounded-2xl p-2 sm:p-4 min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center relative shadow-inner h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* Mobile compact deck & discard strip: Відбій зліва, Колода справа */}
            <div className="flex md:hidden items-center justify-between w-full px-2.5 py-1.5 bg-stone-950/70 rounded-xl border border-stone-800 text-xs mb-2">
              <button
                onClick={() => setShowDiscard(true)}
                className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors font-medium text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Відбій ({discardPile.length}) 🔍</span>
              </button>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Колода: {deck.length}</span>
                {canPlayerDrawFromDeck && (
                  <button
                    onClick={handlePlayerDrawOneCard}
                    className="ml-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-[10px] font-black animate-pulse"
                  >
                    + Взяти 1
                  </button>
                )}
              </div>
            </div>

            {tablePairs.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-stone-500">
                <Swords className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 text-stone-600/80 animate-pulse" />
                <p className="text-xs sm:text-sm font-medium">Стіл порожній</p>
                <p className="text-[10px] sm:text-[11px] text-stone-600 mt-0.5">
                  {attackerId === 'player'
                    ? `Ваш хід: оберіть карту з руки для атаки на ${currentDefenderInfo.name}`
                    : `Очікуємо атаку від ${currentAttackerInfo.name}...`}
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap max-w-full">
                  {tablePairs.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="pair-in flex flex-col items-center bg-stone-950/50 p-1.5 sm:p-2 rounded-xl border border-stone-800/60 relative"
                    >
                      <div className="text-[9px] sm:text-[10px] font-mono text-stone-400 mb-0.5 sm:mb-1 flex items-center gap-1">
                        <span>Пара #{idx + 1}</span>
                        {pair.defender && (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 relative">
                        {/* Attacking Card */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold mb-0.5 flex items-center gap-0.5">
                            ⚔️ Атака
                          </span>
                          <CardView
                            type={pair.attacker.type}
                            size={tablePairs.length > 1 ? 'sm' : 'md'}
                          />
                        </div>

                        {/* Arrow indicator when defended */}
                        {pair.defender && (
                          <div className="flex flex-col items-center justify-center px-0.5 text-emerald-400">
                            <span className="text-xs sm:text-base font-black">➔</span>
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter text-emerald-300 -mt-1 hidden xs:block">
                              Бито
                            </span>
                          </div>
                        )}

                        {/* Defending Card Slot */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold mb-0.5 flex items-center gap-0.5">
                            🛡️ Захист
                          </span>
                          {pair.defender ? (
                            <CardView
                              type={pair.defender.type}
                              size={tablePairs.length > 1 ? 'sm' : 'md'}
                            />
                          ) : (
                            <div
                              className={`rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/5 flex flex-col items-center justify-center text-center p-1 text-amber-400 animate-pulse ${
                                tablePairs.length > 1
                                  ? 'w-10 h-15 xs:w-11 xs:h-16 text-[8px]'
                                  : 'w-[74px] h-[112px] sm:w-24 sm:h-36 text-xs'
                              }`}
                            >
                              <span className="text-sm sm:text-xl">🛡️</span>
                              <span className="font-semibold text-[8px] sm:text-xs mt-0.5 leading-tight">Очікує</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Bar based on player situation */}
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  {/* Case A: Player is defending */}
                  {currentTurn === 'player' && defenderId === 'player' && activeUndefendedPair && (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {canPlayerDrawFromDeck && (
                        <button
                          onClick={handlePlayerDrawOneCard}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 animate-pulse"
                          title="Взяти 1 карту з колоди (Клавіша D)"
                        >
                          <Layers className="w-4 h-4 text-stone-950" />
                          <span>Взяти 1 карту (+1)</span>
                          <kbd className="hidden xs:inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-stone-950/60 text-stone-200 border border-stone-800 text-[10px] font-mono font-bold">
                            D
                          </kbd>
                        </button>
                      )}

                      <button
                        onClick={handlePlayerTakeCards}
                        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        title="Забрати карти зі столу (Клавіша B або Esc)"
                      >
                        <span>Забрати карти («Беру»)</span>
                        <kbd className="hidden xs:inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-stone-950/60 text-stone-200 border border-stone-800 text-[10px] font-mono font-bold">
                          B / Esc
                        </kbd>
                      </button>
                    </div>
                  )}

                  {/* Case B: Player attacked, defender covered all, player can click "Бито!" or toss */}
                  {currentTurn === 'player' && attackerId === 'player' && allTableCovered && !isOpponentTaking && (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        onClick={handlePlayerBitoClick}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        title="Оголосити «Бито!» (Клавіша Пробіл або Enter)"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Бито! (У відбій)</span>
                        <kbd className="hidden xs:inline-flex items-center justify-center px-2 py-0.5 rounded bg-stone-950/60 text-stone-200 border border-stone-800 text-[10px] font-mono font-bold">
                          Пробіл
                        </kbd>
                      </button>

                      {playerCanToss && (
                        <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Або натисніть карту з руки, щоб підкинути!</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Case C: Opponent is taking cards */}
                  {isOpponentTaking && (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {playerCanGiveMore && (
                        <button
                          onClick={handleGiveOneMore}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
                          title="Підкинути ще одну карту (Клавіша G)"
                        >
                          <PlusCircle className="w-4 h-4 text-stone-950" />
                          <span>Дати ще{nextMatchingCard ? ` (${nextMatchingCard.type})` : ''}</span>
                          <kbd className="hidden xs:inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-stone-950/60 text-stone-200 border border-stone-800 text-[10px] font-mono font-bold">
                            G
                          </kbd>
                        </button>
                      )}

                      <button
                        onClick={handleFinishTurn}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        title="Завершити хід (Клавіша Пробіл або Enter)"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Завершити хід</span>
                        <kbd className="hidden xs:inline-flex items-center justify-center px-2 py-0.5 rounded bg-stone-950/60 text-stone-200 border border-stone-800 text-[10px] font-mono font-bold">
                          Пробіл
                        </kbd>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Battle Log (Літопис бою праворуч, по висоті як стіл) */}
          <div className="order-3 md:order-3 md:col-span-3 lg:col-span-3 h-full">
            <GameLog
              logs={battleLogs}
              collapsed={logCollapsed}
              onToggleCollapse={() => setLogCollapsed(!logCollapsed)}
              className="h-full"
            />
          </div>
        </div>

        {/* Bottom: Player Hand */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center relative shadow-lg">
          <div className="flex items-center justify-between w-full mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs sm:text-sm font-bold text-stone-200">
                Ваша рука ({playerHand.length} карт)
              </span>

              {/* Status hints */}
              {currentTurn === 'player' && tablePairs.length === 0 && attackerId === 'player' && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Атакуйте {currentDefenderInfo.name}
                </span>
              )}
              {currentTurn === 'player' && defenderId === 'player' && activeUndefendedPair && (
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                  Побийте «{activeUndefendedPair.attacker.type}» або візьміть з колоди
                </span>
              )}
              {currentTurn === 'player' && attackerId === 'player' && allTableCovered && !isOpponentTaking && (
                <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  Карту побито! Можна підкинути або «Бито!»
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>
                Перемог: <b className="text-emerald-400">{stats.wins}</b> / Поразок:{' '}
                <b className="text-rose-400">{stats.losses}</b>
              </span>
            </div>
          </div>

          {/* Player Cards Hand */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap max-w-full py-1.5 px-0.5">
            {playerHand.map((card, idx) => {
              let isHighlighted = false;
              let isDimmed = false;
              let badgeText: string | undefined = undefined;

              // Sub-case 1: Player is defending
              if (currentTurn === 'player' && defenderId === 'player' && activeUndefendedPair) {
                const beatsCurrent = canBeat(card.type, activeUndefendedPair.attacker.type);
                isHighlighted = beatsCurrent;
                isDimmed = !beatsCurrent;
                if (beatsCurrent) badgeText = "Б'Є!";
              }

              // Sub-case 2: Player is tossing
              if (!noTossing && currentTurn === 'player' && attackerId === 'player' && allTableCovered && !isOpponentTaking) {
                const canTossCard = Boolean(tableTypes.has(card.type) && targetBotForTake && targetBotForTake.hand.length > 0);
                isHighlighted = canTossCard;
                isDimmed = !canTossCard;
                if (canTossCard) badgeText = 'ПІДКИНУТИ';
              }

              // Sub-case 3: Opponent is taking
              if (!noTossing && isOpponentTaking) {
                const canGiveThis = Boolean(tableTypes.has(card.type) && targetBotForTake && tablePairs.length < targetBotForTake.hand.length);
                isHighlighted = canGiveThis;
                isDimmed = !canGiveThis;
                if (canGiveThis) badgeText = 'ДАТИ ЩЕ';
              }

              return (
                <CardView
                  key={card.id || `${card.type}-${idx}`}
                  type={card.type}
                  size="md"
                  highlight={isHighlighted}
                  dimmed={isDimmed}
                  badge={badgeText}
                  keyShortcut={idx < 9 ? idx + 1 : undefined}
                  onClick={() => handlePlayerCardClick(card, idx)}
                />
              );
            })}
          </div>
        </div>

        {/* Compact Cycle Bar at the very bottom */}
        <div className="mt-2">
          <CycleWheel compact />
        </div>

        {/* Winner / Round Over Modal with Tournament Logic & Leaderboard */}
        {winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-stone-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              {/* Victory Trophy / Stars or Defeat Badge */}
              <div className="mb-4">
                {winner === 'player' ? (
                  <div className="relative inline-flex items-center justify-center mx-auto my-2">
                    {/* Три золоті зірочки переможця */}
                    <VictoryStars className="w-32 h-20 sm:w-36 sm:h-24" />
                  </div>
                ) : winner === 'draw' ? (
                  <div className="relative inline-flex items-center justify-center mx-auto my-2 text-5xl">
                    🤝
                  </div>
                ) : (
                  <div className="relative inline-flex items-center justify-center mx-auto my-2">
                    {/* Кольорові схрещені сокири за референсом без круга */}
                    <CrossedAxes className="w-24 h-24 sm:w-28 sm:h-28" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-amber-200 mb-1">
                {winner === 'player'
                  ? gameMode === 'tournament'
                    ? tournamentState.isChampion
                      ? 'ВИ — ЧЕМПІОН ТУРНІРУ!'
                      : 'ПЕРЕМОГА У РАУНДІ!'
                    : 'Ви перемогли!'
                  : gameMode === 'tournament'
                  ? 'ВИ ВИБУЛИ З ТУРНІРУ'
                  : bots.length === 1
                  ? 'Поразка у дуелі'
                  : 'Гру завершено!'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mb-5 leading-relaxed">
                {winner === 'player'
                  ? gameMode === 'tournament'
                    ? tournamentState.isChampion
                      ? 'Вітаємо! Ви здолали всіх 3 суперників на вибування та здобули головний кубок Чемпіона лісу!'
                      : `Чудова битва! Ви здолали суперника та пройшли до наступного етапу: ${TOURNAMENT_STAGES_CONFIG[tournamentState.currentStageIndex]?.stageName}!`
                    : 'Вітаємо! Ви першим скинули всі карти та стали переможцем Лісового патруля!'
                  : gameMode === 'tournament'
                  ? `Поразка у раунді «${currentTournamentStage?.stageName}». За правилами плей-оф ви вибуваєте з цього розіграшу.`
                  : bots.length === 1
                  ? `${bots[0]?.name || 'Суперник'} виявився спритнішим цього разу та першим скинув усі карти. Спробуйте зіграти реванш!`
                  : 'Суперники виявилися спритнішими цього разу. Спробуйте ще раз!'}
              </p>

              {/* Tournament Match / Bracket Action */}
              {gameMode === 'tournament' ? (
                <div className="space-y-3 mb-2">
                  <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800 text-xs">
                    <div className="text-amber-400 font-bold mb-2 flex items-center justify-center gap-1 text-sm">
                      <Trophy className="w-4 h-4" /> Прогрес плей-оф
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {tournamentState.matches.map((m, idx) => (
                        <div
                          key={m.stage}
                          className={`p-2 rounded-xl border ${
                            m.isCompleted && m.isWon
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : m.isCompleted && !m.isWon
                              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                              : idx === tournamentState.currentStageIndex
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-500'
                          }`}
                        >
                          <div className="text-sm">{m.opponentEmoji}</div>
                          <div className="text-[10px] truncate mt-0.5">{m.stageName.split(' ')[0]}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!tournamentState.isChampion && !tournamentState.isEliminated ? (
                    <button
                      onClick={() => startGame('tournament')}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl shadow-lg transition-all text-base flex items-center justify-center gap-2"
                    >
                      <span>Наступний бій: {TOURNAMENT_STAGES_CONFIG[tournamentState.currentStageIndex]?.stageName}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleResetTournament}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl shadow-lg transition-all text-base"
                    >
                      Почати новий турнір
                    </button>
                  )}
                </div>
              ) : (
                /* Classic Mode: Duel Result (1-on-1) or Leaderboard Table (Multiplayer) */
                <div className="space-y-3 mb-2">
                  {bots.length === 1 ? (
                    <div className="bg-stone-950/80 rounded-2xl p-3.5 border border-stone-800 text-xs text-stone-300">
                      <div className="text-amber-400 font-bold mb-2 flex items-center justify-center gap-1.5 text-sm">
                        <Award className="w-4 h-4" /> Результат дуелі
                      </div>
                      <div className="flex items-center justify-around bg-stone-900/90 rounded-xl p-2.5 border border-stone-800/80 mb-2.5">
                        <div className="text-center">
                          <div className="text-2xl mb-0.5">👤</div>
                          <div className="font-bold text-stone-200">Ви</div>
                          <div className="text-[11px] font-bold text-emerald-400">
                            {winner === 'player' ? '🏆 Перемога' : 'Поразка'}
                          </div>
                        </div>
                        <div className="text-stone-500 font-black text-sm">VS</div>
                        <div className="text-center">
                          <div className="text-2xl mb-0.5">{bots[0]?.emoji || '🐺'}</div>
                          <div className="font-bold text-stone-200">{bots[0]?.name || 'Бот'}</div>
                          <div className="text-[11px] font-bold text-stone-400">
                            {winner === 'player' ? 'Поразка' : '🏆 Перемога'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 border-t border-stone-800/60 pt-2">
                        <span>Загальний рахунок:</span>
                        <span className="font-bold text-stone-200">
                          <b className="text-emerald-400">{stats.wins}</b> перемог / <b className="text-rose-400">{stats.losses}</b> поразок
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800 text-xs">
                      <div className="text-amber-400 font-bold mb-2 flex items-center justify-center gap-1 text-sm">
                        <Award className="w-4 h-4" /> Підсумкова таблиця
                      </div>
                      <div className="space-y-1.5">
                        {finishedRankings.map((r, idx) => (
                          <div
                            key={r.id}
                            className={`flex items-center justify-between p-2 rounded-xl border ${
                              r.id === 'player'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                                : 'bg-stone-900 border-stone-800 text-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}</span>
                              <span className="text-base">{r.emoji}</span>
                              <span>{r.name}</span>
                            </div>
                            <span className="font-mono font-bold text-amber-400">
                              {r.rank}-е місце
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => startGame(gameMode, botCount)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl shadow-lg transition-all text-base"
                  >
                    Грати знову
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Discard Pile Modal */}
      <DiscardModal
        isOpen={showDiscard}
        onClose={() => setShowDiscard(false)}
        discardedCards={discardPile}
      />

      {/* Tournament Bracket Modal */}
      <TournamentModal
        isOpen={showTournamentModal}
        onClose={() => setShowTournamentModal(false)}
        tournament={tournamentState}
        onStartMatch={() => startGame('tournament')}
        onResetTournament={handleResetTournament}
      />

      {/* Full-screen width Chain Character Animation Modal */}
      <ChainAnimationModal
        isOpen={showChainAnimation}
        onClose={() => setShowChainAnimation(false)}
      />

      {/* Mobile Settings & Menu Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border-t-2 sm:border-2 border-stone-700 rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full text-stone-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Налаштування гри</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Game Mode */}
            <div className="mb-4">
              <label className="text-xs text-stone-400 font-semibold mb-1.5 block">
                🎮 Режим гри
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setGameMode('classic');
                    startGame('classic', botCount);
                    setShowMobileMenu(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    gameMode === 'classic'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  🏆 Колода (54 карти)
                </button>

                <button
                  onClick={() => {
                    setGameMode('tournament');
                    setShowTournamentModal(true);
                    startGame('tournament');
                    setShowMobileMenu(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    gameMode === 'tournament'
                      ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-amber-400 text-amber-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  🏆 Турнір
                </button>
              </div>
            </div>

            {/* Bot Count Selection (Hidden in Tournament mode) */}
            {gameMode !== 'tournament' && (
              <div className="mb-4">
                <label className="text-xs text-stone-400 font-semibold mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Кількість ботів-супротивників:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        handleBotCountChange(num);
                        setShowMobileMenu(false);
                      }}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        botCount === num
                          ? 'bg-amber-500 border-amber-400 text-stone-950 shadow'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400'
                      }`}
                    >
                      {num} {num === 1 ? 'бот' : num < 5 ? 'боти' : 'ботів'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Difficulty Levels Selection */}
            <div className="mb-4">
              <label className="text-xs text-stone-400 font-semibold mb-1.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Рівень складності бота:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    handleDifficultyChange('easy');
                    setShowMobileMenu(false);
                  }}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  🟢 Легкий
                </button>
                <button
                  onClick={() => {
                    handleDifficultyChange('normal');
                    setShowMobileMenu(false);
                  }}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                    difficulty === 'normal'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  🟡 Середній
                </button>
                <button
                  onClick={() => {
                    handleDifficultyChange('hard');
                    setShowMobileMenu(false);
                  }}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                    difficulty === 'hard'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400'
                  }`}
                >
                  🔴 Важкий
                </button>
              </div>
              <p className="text-[10px] text-stone-400 mt-1 px-1">
                {difficulty === 'easy'
                  ? '🟢 Легкий: бот робить помилки, рідко підкидає карти (25%) і може зарано скинути козир.'
                  : difficulty === 'normal'
                  ? '🟡 Середній: збалансована гра, береже Сокиру, атакує парами й помірно підкидає (70%).'
                  : '🔴 Важкий: безжальний тиск! Закидає всіма можливими картами, береже козирі та грає безпомилково.'}
              </p>
            </div>

            {/* Settings Rules Button in Mobile Menu */}
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowSettingsModal(true);
              }}
              className="w-full mb-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Налаштування правил</span>
              </div>
              <div className="flex items-center gap-1.5">
                {noTossing && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    1 карта
                  </span>
                )}
                {refillHandTo4 && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    добір до 4
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </button>

            {/* Quick links to Guides and Tournament */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {gameMode === 'tournament' ? (
                <button
                  onClick={() => {
                    setShowTournamentModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-500/40"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Сітка турніру</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowCycleGuide(true);
                    setShowMobileMenu(false);
                  }}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-700"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Коло ланцюга</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowRules(true);
                  setShowMobileMenu(false);
                }}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-700"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Правила гри</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowMobileMenu(false)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-xs text-stone-300 border border-stone-700"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Шестерня) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        noTossing={noTossing}
        onToggleNoTossing={handleToggleNoTossing}
        refillHandTo4={refillHandTo4}
        onToggleRefillHandTo4={handleToggleRefillHandTo4}
      />

      {/* Гарне модальне вікно вибору складності ШІ */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
            {/* Декоративне сяйво */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Заголовок модального вікна */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 z-10 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-sm">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-100 flex items-center gap-1.5 leading-tight">
                    Рівень складності ШІ
                  </h3>
                  <p className="text-xs text-stone-400 leading-tight mt-0.5">
                    Оберіть інтелект та поведінку ботів
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDifficultyModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* 3 Картки складності */}
            <div className="flex flex-col gap-2.5 z-10 relative">
              {[
                {
                  id: 'easy' as Difficulty,
                  dot: '🟢',
                  title: 'Легкий (Новачок)',
                  badge: 'Для розслаблення',
                  borderActive: 'border-emerald-500 bg-emerald-950/25 ring-2 ring-emerald-500/30 shadow-emerald-500/10 shadow-lg',
                  desc: 'Бот грає розслаблено. Рідко підкидає карти (25%), інколи робить помилки та може завчасно скинути козир-Сокиру.',
                },
                {
                  id: 'normal' as Difficulty,
                  dot: '🟡',
                  title: 'Середній (Тактик)',
                  badge: 'Класичний баланс',
                  borderActive: 'border-amber-500 bg-amber-950/25 ring-2 ring-amber-500/30 shadow-amber-500/10 shadow-lg',
                  desc: 'Розумний супротивник. Береже Сокиру для вирішальних ходів, атакує парними картами та активно підкидає (70%).',
                },
                {
                  id: 'hard' as Difficulty,
                  dot: '🔴',
                  title: 'Важкий (Гросмейстер)',
                  badge: 'Максимальний виклик',
                  borderActive: 'border-rose-500 bg-rose-950/25 ring-2 ring-rose-500/30 shadow-rose-500/10 shadow-lg',
                  desc: 'Нещадний інтелект! Закидає всіма доступними картами, аналізує виходи та карає за кожну вашу тактичну помилку.',
                },
              ].map((item) => {
                const isSelected = difficulty === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleDifficultyChange(item.id);
                      soundManager.playCardSound();
                    }}
                    className={`cursor-pointer rounded-2xl p-3 sm:p-3.5 border transition-all text-left relative flex items-start gap-3 active:scale-[0.98] ${
                      isSelected
                        ? item.borderActive
                        : 'bg-stone-950/60 border-stone-800 hover:bg-stone-850 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-2xl shrink-0 mt-0.5">
                      {item.dot}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-black text-sm sm:text-base text-stone-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800/90 text-stone-300 border border-stone-700/80 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Кнопка підтвердження */}
            <div className="pt-2 z-10 relative">
              <button
                onClick={() => setShowDifficultyModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Застосувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
