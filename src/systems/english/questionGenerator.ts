import { ENGLISH_WORDS } from '../../game-data/englishWords';
import type { WordEntry } from '../../game-data/english/index';

export interface EnglishQuestion {
  word: WordEntry;
  choices: string[];   // 한국어 보기 4개
  correctIdx: number;
}

export type EnglishDifficultyKey = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

/** Fisher-Yates 셔플 (순수 함수) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 난이도에 맞는 단어 풀 반환 */
export function getWordPool(difficulty: EnglishDifficultyKey): WordEntry[] {
  const pool = ENGLISH_WORDS.filter(w => w.difficulty === difficulty);
  if (pool.length >= 4) return pool;
  return ENGLISH_WORDS.filter(w => w.difficulty === 'beginner' || w.difficulty === difficulty);
}

/** 단일 문제 생성 */
export function generateQuestion(difficulty: EnglishDifficultyKey): EnglishQuestion {
  const pool = getWordPool(difficulty);
  if (pool.length < 4) {
    throw new Error(`Word pool too small for difficulty: ${difficulty} (got ${pool.length})`);
  }
  const word = pool[Math.floor(Math.random() * pool.length)];
  const wrongPool = ENGLISH_WORDS.filter(w => w.korean !== word.korean);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(w => w.korean);
  if (wrongs.length < 3) {
    console.warn(`[questionGenerator] wrongs 부족: ${wrongs.length}개 (단어풀 크기: ${wrongPool.length})`);
  }
  const choices = shuffle([word.korean, ...wrongs]);
  return {
    word,
    choices,
    correctIdx: choices.indexOf(word.korean),
  };
}
