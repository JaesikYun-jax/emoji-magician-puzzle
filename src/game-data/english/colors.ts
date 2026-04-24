import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const COLORS_WORDS: W[] = [
  { id: 'color-red',    english: 'red',    korean: '빨간색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-blue',   english: 'blue',   korean: '파란색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-yellow', english: 'yellow', korean: '노란색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-green',  english: 'green',  korean: '초록색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-orange', english: 'orange', korean: '주황색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-purple', english: 'purple', korean: '보라색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-pink',   english: 'pink',   korean: '분홍색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-white',  english: 'white',  korean: '흰색',   category: 'colors', difficulty: 'beginner' },
  { id: 'color-black',  english: 'black',  korean: '검은색', category: 'colors', difficulty: 'beginner' },
  { id: 'color-brown',  english: 'brown',  korean: '갈색',   category: 'colors', difficulty: 'beginner' },
];
