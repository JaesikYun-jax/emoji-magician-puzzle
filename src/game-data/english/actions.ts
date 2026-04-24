import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const ACTIONS_WORDS: W[] = [
  // intermediate (20)
  { id: 'action-run',    english: 'run',    korean: '달리다',   category: 'actions', difficulty: 'intermediate' },
  { id: 'action-jump',   english: 'jump',   korean: '뛰다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-swim',   english: 'swim',   korean: '수영하다', category: 'actions', difficulty: 'intermediate' },
  { id: 'action-eat',    english: 'eat',    korean: '먹다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-drink',  english: 'drink',  korean: '마시다',   category: 'actions', difficulty: 'intermediate' },
  { id: 'action-sleep',  english: 'sleep',  korean: '자다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-walk',   english: 'walk',   korean: '걷다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-talk',   english: 'talk',   korean: '말하다',   category: 'actions', difficulty: 'intermediate' },
  { id: 'action-read',   english: 'read',   korean: '읽다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-write',  english: 'write',  korean: '쓰다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-draw',   english: 'draw',   korean: '그리다',   category: 'actions', difficulty: 'intermediate' },
  { id: 'action-sing',   english: 'sing',   korean: '노래하다', category: 'actions', difficulty: 'intermediate' },
  { id: 'action-dance',  english: 'dance',  korean: '춤추다',   category: 'actions', difficulty: 'intermediate' },
  { id: 'action-play',   english: 'play',   korean: '놀다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-study',  english: 'study',  korean: '공부하다', category: 'actions', difficulty: 'intermediate' },
  { id: 'action-listen', english: 'listen', korean: '듣다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-open',   english: 'open',   korean: '열다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-close',  english: 'close',  korean: '닫다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-give',   english: 'give',   korean: '주다',     category: 'actions', difficulty: 'intermediate' },
  { id: 'action-help',   english: 'help',   korean: '돕다',     category: 'actions', difficulty: 'intermediate' },
  // advanced (10)
  { id: 'action-decide',     english: 'decide',     korean: '결심하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-remember',   english: 'remember',   korean: '기억하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-understand', english: 'understand', korean: '이해하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-believe',    english: 'believe',    korean: '믿다',     category: 'actions', difficulty: 'advanced' },
  { id: 'action-choose',     english: 'choose',     korean: '선택하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-learn',      english: 'learn',      korean: '배우다',   category: 'actions', difficulty: 'advanced' },
  { id: 'action-think',      english: 'think',      korean: '생각하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-grow',       english: 'grow',       korean: '성장하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-create',     english: 'create',     korean: '창조하다', category: 'actions', difficulty: 'advanced' },
  { id: 'action-protect',    english: 'protect',    korean: '보호하다', category: 'actions', difficulty: 'advanced' },
];
