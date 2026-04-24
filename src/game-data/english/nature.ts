import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const NATURE_WORDS: W[] = [
  // elementary (10)
  { id: 'nature-cloud',    english: 'cloud',    korean: '구름',   category: 'nature', difficulty: 'elementary' },
  { id: 'nature-rain',     english: 'rain',     korean: '비',     category: 'nature', difficulty: 'elementary' },
  { id: 'nature-wind',     english: 'wind',     korean: '바람',   category: 'nature', difficulty: 'elementary' },
  { id: 'nature-snow',     english: 'snow',     korean: '눈',     category: 'nature', difficulty: 'elementary' },
  { id: 'nature-mountain', english: 'mountain', korean: '산',     category: 'nature', difficulty: 'elementary' },
  { id: 'nature-river',    english: 'river',    korean: '강',     category: 'nature', difficulty: 'elementary' },
  { id: 'nature-sea',      english: 'sea',      korean: '바다',   category: 'nature', difficulty: 'elementary' },
  { id: 'nature-sky',      english: 'sky',      korean: '하늘',   category: 'nature', difficulty: 'elementary' },
  { id: 'nature-rock',     english: 'rock',     korean: '바위',   category: 'nature', difficulty: 'elementary' },
  { id: 'nature-leaf',     english: 'leaf',     korean: '나뭇잎', category: 'nature', difficulty: 'elementary' },
  // intermediate (15)
  { id: 'nature-forest',  english: 'forest',  korean: '숲',       category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-lake',    english: 'lake',    korean: '호수',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-island',  english: 'island',  korean: '섬',       category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-desert',  english: 'desert',  korean: '사막',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-ocean',   english: 'ocean',   korean: '대양',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-storm',   english: 'storm',   korean: '폭풍',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-thunder', english: 'thunder', korean: '천둥',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-rainbow', english: 'rainbow', korean: '무지개',   category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-sand',    english: 'sand',    korean: '모래',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-soil',    english: 'soil',    korean: '흙',       category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-grass',   english: 'grass',   korean: '풀',       category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-seed',    english: 'seed',    korean: '씨앗',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-branch',  english: 'branch',  korean: '나뭇가지', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-root',    english: 'root',    korean: '뿌리',     category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-nest',    english: 'nest',    korean: '둥지',     category: 'nature', difficulty: 'intermediate' },
];
