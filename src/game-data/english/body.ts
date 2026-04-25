import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const BODY_WORDS: W[] = [
  // beginner (5)
  { id: 'body-face',     english: 'face',     korean: '얼굴',   emoji: '😊', category: 'body', difficulty: 'beginner' },
  { id: 'body-neck',     english: 'neck',     korean: '목',     emoji: '🦒', category: 'body', difficulty: 'beginner' },
  { id: 'body-shoulder', english: 'shoulder', korean: '어깨',   emoji: '💪', category: 'body', difficulty: 'beginner' },
  { id: 'body-knee',     english: 'knee',     korean: '무릎',   emoji: '🦵', category: 'body', difficulty: 'beginner' },
  { id: 'body-chest',    english: 'chest',    korean: '가슴',   emoji: '🫀', category: 'body', difficulty: 'beginner' },
  // elementary (12)
  { id: 'body-head',   english: 'head',   korean: '머리',     emoji: '🗣️', category: 'body', difficulty: 'elementary' },
  { id: 'body-eye',    english: 'eye',    korean: '눈',       emoji: '👁️', category: 'body', difficulty: 'elementary' },
  { id: 'body-nose',   english: 'nose',   korean: '코',       emoji: '👃', category: 'body', difficulty: 'elementary' },
  { id: 'body-mouth',  english: 'mouth',  korean: '입',       emoji: '👄', category: 'body', difficulty: 'elementary' },
  { id: 'body-ear',    english: 'ear',    korean: '귀',       emoji: '👂', category: 'body', difficulty: 'elementary' },
  { id: 'body-hand',   english: 'hand',   korean: '손',       emoji: '✋', category: 'body', difficulty: 'elementary' },
  { id: 'body-foot',   english: 'foot',   korean: '발',       emoji: '🦶', category: 'body', difficulty: 'elementary' },
  { id: 'body-arm',    english: 'arm',    korean: '팔',       emoji: '💪', category: 'body', difficulty: 'elementary' },
  { id: 'body-leg',    english: 'leg',    korean: '다리',     emoji: '🦵', category: 'body', difficulty: 'elementary' },
  { id: 'body-finger', english: 'finger', korean: '손가락',   emoji: '☝️', category: 'body', difficulty: 'elementary' },
  { id: 'body-hair',   english: 'hair',   korean: '머리카락', emoji: '💇', category: 'body', difficulty: 'elementary' },
  { id: 'body-back',   english: 'back',   korean: '등',       emoji: '🔙', category: 'body', difficulty: 'elementary' },
  // intermediate (5)
  { id: 'body-thumb',  english: 'thumb',  korean: '엄지손가락', emoji: '👍', category: 'body', difficulty: 'intermediate' },
  { id: 'body-toe',    english: 'toe',    korean: '발가락',   emoji: '🦶', category: 'body', difficulty: 'intermediate' },
  { id: 'body-elbow',  english: 'elbow',  korean: '팔꿈치',   emoji: '💪', category: 'body', difficulty: 'intermediate' },
  { id: 'body-ankle',  english: 'ankle',  korean: '발목',     emoji: '🦶', category: 'body', difficulty: 'intermediate' },
  { id: 'body-wrist',  english: 'wrist',  korean: '손목',     emoji: '⌚', category: 'body', difficulty: 'intermediate' },
];
