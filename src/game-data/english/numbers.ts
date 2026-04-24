import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const NUMBERS_WORDS: W[] = [
  { id: 'num-one',   english: 'one',   korean: '일 (1)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-two',   english: 'two',   korean: '이 (2)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-three', english: 'three', korean: '삼 (3)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-four',  english: 'four',  korean: '사 (4)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-five',  english: 'five',  korean: '오 (5)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-six',   english: 'six',   korean: '육 (6)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-seven', english: 'seven', korean: '칠 (7)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-eight', english: 'eight', korean: '팔 (8)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-nine',  english: 'nine',  korean: '구 (9)',  category: 'numbers', difficulty: 'beginner' },
  { id: 'num-ten',   english: 'ten',   korean: '십 (10)', category: 'numbers', difficulty: 'beginner' },
];
