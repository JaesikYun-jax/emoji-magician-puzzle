import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const ANIMALS_WORDS: W[] = [
  { id: 'animal-cat',      english: 'cat',      korean: '고양이', emoji: '🐱', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-dog',      english: 'dog',      korean: '강아지', emoji: '🐶', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-rabbit',   english: 'rabbit',   korean: '토끼',   emoji: '🐰', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-bear',     english: 'bear',     korean: '곰',     emoji: '🐻', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-pig',      english: 'pig',      korean: '돼지',   emoji: '🐷', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-cow',      english: 'cow',      korean: '소',     emoji: '🐄', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-horse',    english: 'horse',    korean: '말',     emoji: '🐴', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-monkey',   english: 'monkey',   korean: '원숭이', emoji: '🐵', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-lion',     english: 'lion',     korean: '사자',   emoji: '🦁', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-tiger',    english: 'tiger',    korean: '호랑이', emoji: '🐯', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-elephant', english: 'elephant', korean: '코끼리', emoji: '🐘', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-penguin',  english: 'penguin',  korean: '펭귄',   emoji: '🐧', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-duck',     english: 'duck',     korean: '오리',   emoji: '🦆', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-frog',     english: 'frog',     korean: '개구리', emoji: '🐸', category: 'animals', difficulty: 'beginner' },
  { id: 'animal-fish',     english: 'fish',     korean: '물고기', emoji: '🐟', category: 'animals', difficulty: 'beginner' },
];
