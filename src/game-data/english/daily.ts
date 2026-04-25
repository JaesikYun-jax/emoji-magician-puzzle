import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const DAILY_WORDS: W[] = [
  { id: 'daily-book',   english: 'book',   korean: '책',     emoji: '📚', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-pencil', english: 'pencil', korean: '연필',   emoji: '✏️', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-water',  english: 'water',  korean: '물',     emoji: '💧', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-sun',    english: 'sun',    korean: '해',     emoji: '☀️', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-moon',   english: 'moon',   korean: '달',     emoji: '🌙', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-star',   english: 'star',   korean: '별',     emoji: '⭐', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-flower', english: 'flower', korean: '꽃',     emoji: '🌸', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-tree',   english: 'tree',   korean: '나무',   emoji: '🌳', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-house',  english: 'house',  korean: '집',     emoji: '🏠', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-car',    english: 'car',    korean: '자동차', emoji: '🚗', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-ball',   english: 'ball',   korean: '공',     emoji: '⚽', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-bird',   english: 'bird',   korean: '새',     emoji: '🐦', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-door',   english: 'door',   korean: '문',     emoji: '🚪', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-chair',  english: 'chair',  korean: '의자',   emoji: '🪑', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-table',  english: 'table',  korean: '탁자',   emoji: '🪞', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-bag',    english: 'bag',    korean: '가방',   emoji: '👜', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-shoes',  english: 'shoes',  korean: '신발',   emoji: '👟', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-hat',    english: 'hat',    korean: '모자',   emoji: '🎩', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-window', english: 'window', korean: '창문',   emoji: '🪟', category: 'daily', difficulty: 'elementary' },
  { id: 'daily-clock',  english: 'clock',  korean: '시계',   emoji: '🕐', category: 'daily', difficulty: 'elementary' },
];
