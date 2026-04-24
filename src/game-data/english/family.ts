import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const FAMILY_WORDS: W[] = [
  { id: 'family-mom',     english: 'mom',     korean: '엄마',      category: 'family', difficulty: 'elementary' },
  { id: 'family-dad',     english: 'dad',     korean: '아빠',      category: 'family', difficulty: 'elementary' },
  { id: 'family-brother', english: 'brother', korean: '오빠/형',   category: 'family', difficulty: 'elementary' },
  { id: 'family-sister',  english: 'sister',  korean: '언니/누나', category: 'family', difficulty: 'elementary' },
  { id: 'family-grandma', english: 'grandma', korean: '할머니',    category: 'family', difficulty: 'elementary' },
  { id: 'family-grandpa', english: 'grandpa', korean: '할아버지',  category: 'family', difficulty: 'elementary' },
  { id: 'family-baby',    english: 'baby',    korean: '아기',      category: 'family', difficulty: 'elementary' },
  { id: 'family-family',  english: 'family',  korean: '가족',      category: 'family', difficulty: 'elementary' },
];
