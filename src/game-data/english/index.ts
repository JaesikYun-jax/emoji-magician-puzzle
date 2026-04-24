import type { EnglishCategory, EnglishDifficulty } from './categories';
export { ENGLISH_CATEGORIES, ENGLISH_DIFFICULTIES, CATEGORY_LABEL_KEYS, DIFFICULTY_LABEL_KEYS } from './categories';
export type { EnglishCategory, EnglishDifficulty };

import { COLORS_WORDS }   from './colors';
import { NUMBERS_WORDS }  from './numbers';
import { ANIMALS_WORDS }  from './animals';
import { BODY_WORDS }     from './body';
import { FAMILY_WORDS }   from './family';
import { DAILY_WORDS }    from './daily';
import { FOOD_WORDS }     from './food';
import { NATURE_WORDS }   from './nature';
import { SCHOOL_WORDS }   from './school';
import { ACTIONS_WORDS }  from './actions';
import { EMOTIONS_WORDS } from './emotions';

export interface WordEntry {
  id: string;
  english: string;
  korean: string;
  category: EnglishCategory;
  difficulty: EnglishDifficulty;
}

export const ENGLISH_WORDS: WordEntry[] = [
  ...COLORS_WORDS,
  ...NUMBERS_WORDS,
  ...ANIMALS_WORDS,
  ...BODY_WORDS,
  ...FAMILY_WORDS,
  ...DAILY_WORDS,
  ...FOOD_WORDS,
  ...NATURE_WORDS,
  ...SCHOOL_WORDS,
  ...ACTIONS_WORDS,
  ...EMOTIONS_WORDS,
];

export function getWordsByCategory(category: EnglishCategory): WordEntry[] {
  return ENGLISH_WORDS.filter((w) => w.category === category);
}

export function getWordsByDifficulty(difficulty: EnglishDifficulty): WordEntry[] {
  return ENGLISH_WORDS.filter((w) => w.difficulty === difficulty);
}

export function getWordsByCategories(categories: EnglishCategory[]): WordEntry[] {
  return ENGLISH_WORDS.filter((w) => (categories as string[]).includes(w.category));
}
