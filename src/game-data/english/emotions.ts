import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const EMOTIONS_WORDS: W[] = [
  // advanced — 감정 형용사 (10)
  { id: 'emotion-happy',   english: 'happy',   korean: '행복한',     emoji: '😊', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-sad',     english: 'sad',     korean: '슬픈',       emoji: '😢', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-angry',   english: 'angry',   korean: '화난',       emoji: '😠', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-excited', english: 'excited', korean: '신나는',     emoji: '🤩', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-scared',  english: 'scared',  korean: '무서운',     emoji: '😨', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-lonely',  english: 'lonely',  korean: '외로운',     emoji: '😔', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-proud',   english: 'proud',   korean: '자랑스러운', emoji: '😤', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-nervous', english: 'nervous', korean: '긴장한',     emoji: '😰', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-curious', english: 'curious', korean: '궁금한',     emoji: '🤔', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-bored',   english: 'bored',   korean: '지루한',     emoji: '😑', category: 'emotions', difficulty: 'advanced' },
  // advanced — 추상 명사 (10)
  { id: 'emotion-friendship', english: 'friendship', korean: '우정', emoji: '🤝', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-dream',      english: 'dream',      korean: '꿈',   emoji: '💭', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-peace',      english: 'peace',      korean: '평화', emoji: '☮️', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-courage',    english: 'courage',    korean: '용기', emoji: '💪', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-hope',       english: 'hope',       korean: '희망', emoji: '🌟', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-freedom',    english: 'freedom',    korean: '자유', emoji: '🕊️', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-truth',      english: 'truth',      korean: '진실', emoji: '🔍', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-love',       english: 'love',       korean: '사랑', emoji: '❤️', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-kindness',   english: 'kindness',   korean: '친절', emoji: '🌸', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-wisdom',     english: 'wisdom',     korean: '지혜', emoji: '🦉', category: 'emotions', difficulty: 'advanced' },
];
