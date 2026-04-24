import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const ANIMALS_WORDS: W[] = [
  { id: 'animal-cat',      english: 'cat',      korean: '고양이', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-dog',      english: 'dog',      korean: '강아지', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-rabbit',   english: 'rabbit',   korean: '토끼',   category: 'animals', difficulty: 'beginner' },
  { id: 'animal-bear',     english: 'bear',     korean: '곰',     category: 'animals', difficulty: 'beginner' },
  { id: 'animal-pig',      english: 'pig',      korean: '돼지',   category: 'animals', difficulty: 'beginner' },
  { id: 'animal-cow',      english: 'cow',      korean: '소',     category: 'animals', difficulty: 'beginner' },
  { id: 'animal-horse',    english: 'horse',    korean: '말',     category: 'animals', difficulty: 'beginner' },
  { id: 'animal-monkey',   english: 'monkey',   korean: '원숭이', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-lion',     english: 'lion',     korean: '사자',   category: 'animals', difficulty: 'beginner' },
  { id: 'animal-tiger',    english: 'tiger',    korean: '호랑이', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-elephant', english: 'elephant', korean: '코끼리', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-penguin',  english: 'penguin',  korean: '펭귄',   category: 'animals', difficulty: 'beginner' },
  { id: 'animal-duck',     english: 'duck',     korean: '오리',   category: 'animals', difficulty: 'beginner' },
  { id: 'animal-frog',     english: 'frog',     korean: '개구리', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-fish',     english: 'fish',     korean: '물고기', category: 'animals', difficulty: 'beginner' },
];
