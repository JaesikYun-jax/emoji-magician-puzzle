import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const NATURE_WORDS: W[] = [
  // elementary (10)
  { id: 'nature-cloud',    english: 'cloud',    korean: '구름',   emoji: '☁️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-rain',     english: 'rain',     korean: '비',     emoji: '🌧️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-wind',     english: 'wind',     korean: '바람',   emoji: '💨', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-snow',     english: 'snow',     korean: '눈',     emoji: '❄️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-mountain', english: 'mountain', korean: '산',     emoji: '🏔️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-river',    english: 'river',    korean: '강',     emoji: '🏞️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-sea',      english: 'sea',      korean: '바다',   emoji: '🌊', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-sky',      english: 'sky',      korean: '하늘',   emoji: '🌤️', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-rock',     english: 'rock',     korean: '바위',   emoji: '🪨', category: 'nature', difficulty: 'elementary' },
  { id: 'nature-leaf',     english: 'leaf',     korean: '나뭇잎', emoji: '🍃', category: 'nature', difficulty: 'elementary' },
  // intermediate (15)
  { id: 'nature-forest',  english: 'forest',  korean: '숲',       emoji: '🌲', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-lake',    english: 'lake',    korean: '호수',     emoji: '🏞️', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-island',  english: 'island',  korean: '섬',       emoji: '🏝️', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-desert',  english: 'desert',  korean: '사막',     emoji: '🏜️', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-ocean',   english: 'ocean',   korean: '대양',     emoji: '🌊', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-storm',   english: 'storm',   korean: '폭풍',     emoji: '⛈️', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-thunder', english: 'thunder', korean: '천둥',     emoji: '⚡', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-rainbow', english: 'rainbow', korean: '무지개',   emoji: '🌈', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-sand',    english: 'sand',    korean: '모래',     emoji: '⏳', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-soil',    english: 'soil',    korean: '흙',       emoji: '🌱', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-grass',   english: 'grass',   korean: '풀',       emoji: '🌿', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-seed',    english: 'seed',    korean: '씨앗',     emoji: '🌰', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-branch',  english: 'branch',  korean: '나뭇가지', emoji: '🌿', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-root',    english: 'root',    korean: '뿌리',     emoji: '🌱', category: 'nature', difficulty: 'intermediate' },
  { id: 'nature-nest',    english: 'nest',    korean: '둥지',     emoji: '🪹', category: 'nature', difficulty: 'intermediate' },
];
