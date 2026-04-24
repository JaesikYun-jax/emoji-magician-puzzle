import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const EMOTIONS_WORDS: W[] = [
  // advanced — 감정 형용사 (10)
  { id: 'emotion-happy',   english: 'happy',   korean: '행복한',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-sad',     english: 'sad',     korean: '슬픈',       category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-angry',   english: 'angry',   korean: '화난',       category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-excited', english: 'excited', korean: '신나는',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-scared',  english: 'scared',  korean: '무서운',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-lonely',  english: 'lonely',  korean: '외로운',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-proud',   english: 'proud',   korean: '자랑스러운', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-nervous', english: 'nervous', korean: '긴장한',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-curious', english: 'curious', korean: '궁금한',     category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-bored',   english: 'bored',   korean: '지루한',     category: 'emotions', difficulty: 'advanced' },
  // advanced — 추상 명사 (10)
  { id: 'emotion-friendship', english: 'friendship', korean: '우정', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-dream',      english: 'dream',      korean: '꿈',   category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-peace',      english: 'peace',      korean: '평화', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-courage',    english: 'courage',    korean: '용기', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-hope',       english: 'hope',       korean: '희망', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-freedom',    english: 'freedom',    korean: '자유', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-truth',      english: 'truth',      korean: '진실', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-love',       english: 'love',       korean: '사랑', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-kindness',   english: 'kindness',   korean: '친절', category: 'emotions', difficulty: 'advanced' },
  { id: 'emotion-wisdom',     english: 'wisdom',     korean: '지혜', category: 'emotions', difficulty: 'advanced' },
];
