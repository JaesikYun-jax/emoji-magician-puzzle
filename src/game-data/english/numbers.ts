import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const NUMBERS_WORDS: W[] = [
  { id: 'num-one',   english: 'one',   korean: '일 (1)',  emoji: '1️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-two',   english: 'two',   korean: '이 (2)',  emoji: '2️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-three', english: 'three', korean: '삼 (3)',  emoji: '3️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-four',  english: 'four',  korean: '사 (4)',  emoji: '4️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-five',  english: 'five',  korean: '오 (5)',  emoji: '5️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-six',   english: 'six',   korean: '육 (6)',  emoji: '6️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-seven', english: 'seven', korean: '칠 (7)',  emoji: '7️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-eight', english: 'eight', korean: '팔 (8)',  emoji: '8️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-nine',  english: 'nine',  korean: '구 (9)',  emoji: '9️⃣', category: 'numbers', difficulty: 'beginner' },
  { id: 'num-ten',   english: 'ten',   korean: '십 (10)', emoji: '🔟', category: 'numbers', difficulty: 'beginner' },
];
