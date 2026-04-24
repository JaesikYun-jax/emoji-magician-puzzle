// shim — 호출부 변경 없이 마이그레이션
export type { WordEntry, EnglishCategory, EnglishDifficulty } from './english';
export {
  ENGLISH_WORDS,
  getWordsByCategory,
  getWordsByDifficulty,
  getWordsByCategories,
} from './english';
