import { CardType } from './types';

// Кількість карт, які роздаються кожному гравцю на початку гри (по 4 карти)
export const INITIAL_HAND_SIZE = 4;

// Профілі ботів-супротивників (до 4 ботів)
export const BOT_PROFILES = [
  {
    id: 'bot-1' as const,
    name: 'Лісник',
    emoji: '🐺',
    role: 'Хижак хащ',
    avatarBg: 'bg-rose-950/60 border-rose-500/50',
    accentColor: 'text-rose-400',
    glowColor: 'shadow-rose-500/30',
  },
  {
    id: 'bot-2' as const,
    name: 'Ведмідь',
    emoji: '🐻',
    role: 'Господар пущі',
    avatarBg: 'bg-amber-950/60 border-amber-500/50',
    accentColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/30',
  },
  {
    id: 'bot-3' as const,
    name: 'Лисиця',
    emoji: '🦊',
    role: 'Хитра тактичка',
    avatarBg: 'bg-orange-950/60 border-orange-500/50',
    accentColor: 'text-orange-400',
    glowColor: 'shadow-orange-500/30',
  },
  {
    id: 'bot-4' as const,
    name: 'Сова',
    emoji: '🦉',
    role: 'Мудра захисниця',
    avatarBg: 'bg-teal-950/60 border-teal-500/50',
    accentColor: 'text-teal-400',
    glowColor: 'shadow-teal-500/30',
  },
];

// Конфігурація раундів турніру на вибування
export const TOURNAMENT_STAGES_CONFIG = [
  {
    stage: 'quarter' as const,
    stageName: '1/4 Фіналу (Чвертьфінал)',
    opponentName: 'Лисиця Руда',
    opponentEmoji: '🦊',
    opponentTitle: 'Хитра тактичка лісових стежок',
    opponentAvatarBg: 'bg-orange-950/60 border-orange-500/50',
    difficulty: 'easy' as const,
    description: 'Спритна суперниця з гнучкою тактикою. Перший рубіж плей-оф турніру.',
  },
  {
    stage: 'semi' as const,
    stageName: '1/2 Фіналу (Півфінал)',
    opponentName: 'Ведмідь Бурий',
    opponentEmoji: '🐻',
    opponentTitle: 'Могутній господар тайги',
    opponentAvatarBg: 'bg-amber-950/60 border-amber-500/50',
    difficulty: 'normal' as const,
    description: 'Холоднокровний захисник. Береже джокери та контратакує влучними ударами.',
  },
  {
    stage: 'final' as const,
    stageName: 'Гранд-Фінал за Кубок',
    opponentName: 'Лютий Вовк-Ватажок',
    opponentEmoji: '🐺',
    opponentTitle: 'Легендарний володар ланцюга виживання',
    opponentAvatarBg: 'bg-rose-950/70 border-rose-500/70',
    difficulty: 'hard' as const,
    description: 'Головний бос турніру. Максимальна агресія та стратегічне підкидання карт!',
  },
];

// Склад колоди: всього 54 карти (по 10 кожного типу ланцюга + 4 сокири-джокери)
export const DECK_TEMPLATE: Record<CardType, number> = {
  'Вовк': 10,
  'Вівця': 10,
  'Кущі': 10,
  'Пилка': 10,
  'Ліс': 10,
  'Сокира': 4, // джокер
};

// Правила побиття: вовк -> вівця -> кущі -> пилка -> ліс -> вовк (сокира б'є все)
export const BEATS: Record<CardType, CardType[]> = {
  'Вовк': ['Вівця'],
  'Вівця': ['Кущі'],
  'Кущі': ['Пилка'], // ламають пилку
  'Пилка': ['Ліс'], // ріжуть ліс
  'Ліс': ['Вовк'], // поглинає вовка
  'Сокира': ['Вовк', 'Вівця', 'Кущі', 'Пилка', 'Ліс', 'Сокира'], // джокер
};

// Що б'є цю карту (для підказок та аналітики)
export const BEATEN_BY: Record<CardType, CardType[]> = {
  'Вовк': ['Ліс', 'Сокира'],
  'Вівця': ['Вовк', 'Сокира'],
  'Кущі': ['Вівця', 'Сокира'],
  'Пилка': ['Кущі', 'Сокира'],
  'Ліс': ['Пилка', 'Сокира'],
  'Сокира': ['Сокира'],
};

export interface CardConfig {
  type: CardType;
  title: string;
  emoji: string;
  shortDesc: string;
  beatsDesc: string;
  beatenByDesc: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  glowColor: string;
  bgGradient: string;
}

export const CARD_CONFIGS: Record<CardType, CardConfig> = {
  'Вовк': {
    type: 'Вовк',
    title: 'Вовк',
    emoji: '🐺',
    shortDesc: 'Невблаганний хижак хащ',
    beatsDesc: 'Б\'є: Вівцю',
    beatenByDesc: 'Боїться: Лісу, Сокири',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/50',
    accentColor: 'text-rose-400',
    textColor: 'text-rose-200',
    glowColor: 'shadow-rose-500/30',
    bgGradient: 'from-rose-950 via-zinc-900 to-stone-900',
  },
  'Вівця': {
    type: 'Вівця',
    title: 'Вівця',
    emoji: '🐑',
    shortDesc: 'Травоїдна господиня пасовиськ',
    beatsDesc: 'Б\'є: Кущі',
    beatenByDesc: 'Боїться: Вовка, Сокири',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-400/50',
    accentColor: 'text-amber-300',
    textColor: 'text-amber-100',
    glowColor: 'shadow-amber-400/30',
    bgGradient: 'from-stone-900 via-amber-950/40 to-zinc-900',
  },
  'Кущі': {
    type: 'Кущі',
    title: 'Кущі',
    emoji: '🌿',
    shortDesc: 'Непролазні чагарники та терен',
    beatsDesc: 'Б\'є: Пилку',
    beatenByDesc: 'Боїться: Вівці, Сокири',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentColor: 'text-emerald-400',
    textColor: 'text-emerald-200',
    glowColor: 'shadow-emerald-500/30',
    bgGradient: 'from-emerald-950 via-zinc-900 to-stone-900',
  },
  'Ліс': {
    type: 'Ліс',
    title: 'Ліс',
    emoji: '🌲',
    shortDesc: 'Дрімуча пуща вікових велетнів',
    beatsDesc: 'Б\'є: Вовка',
    beatenByDesc: 'Боїться: Пилки, Сокири',
    bgColor: 'bg-teal-950/40',
    borderColor: 'border-teal-500/50',
    accentColor: 'text-teal-400',
    textColor: 'text-teal-200',
    glowColor: 'shadow-teal-500/30',
    bgGradient: 'from-teal-950 via-zinc-900 to-stone-900',
  },
  'Пилка': {
    type: 'Пилка',
    title: 'Пилка',
    emoji: '🪚',
    shortDesc: 'Зубчасте лезо: ріже стовбури',
    beatsDesc: 'Б\'є: Ліс',
    beatenByDesc: 'Боїться: Кущів, Сокири',
    bgColor: 'bg-orange-950/40',
    borderColor: 'border-orange-500/50',
    accentColor: 'text-orange-400',
    textColor: 'text-orange-200',
    glowColor: 'shadow-orange-500/30',
    bgGradient: 'from-zinc-900 via-orange-950/50 to-stone-900',
  },
  'Сокира': {
    type: 'Сокира',
    title: 'Сокира',
    emoji: '🪓',
    shortDesc: 'Універсальний джокер лісоруба',
    beatsDesc: 'Б\'є ВСЕ (Джокер)',
    beatenByDesc: 'Б\'ється лише Сокирою',
    bgColor: 'bg-yellow-950/50',
    borderColor: 'border-amber-400',
    accentColor: 'text-amber-300',
    textColor: 'text-amber-100',
    glowColor: 'shadow-amber-400/50',
    bgGradient: 'from-amber-900 via-zinc-900 to-yellow-950',
  },
};
