export const ENGLISH_CATEGORIES = [
  'colors', 'numbers', 'animals', 'body', 'family',
  'daily', 'food', 'nature', 'school', 'actions', 'emotions',
] as const;
export type EnglishCategory = typeof ENGLISH_CATEGORIES[number];

export const ENGLISH_DIFFICULTIES = [
  'beginner', 'elementary', 'intermediate', 'advanced',
] as const;
export type EnglishDifficulty = typeof ENGLISH_DIFFICULTIES[number];

export const CATEGORY_LABEL_KEYS: Record<EnglishCategory, string> = {
  colors:   'english.cat.colors',
  numbers:  'english.cat.numbers',
  animals:  'english.cat.animals',
  body:     'english.cat.body',
  family:   'english.cat.family',
  daily:    'english.cat.daily',
  food:     'english.cat.food',
  nature:   'english.cat.nature',
  school:   'english.cat.school',
  actions:  'english.cat.actions',
  emotions: 'english.cat.emotions',
};

export const DIFFICULTY_LABEL_KEYS: Record<EnglishDifficulty, string> = {
  beginner:     'english.category.beginner',
  elementary:   'english.category.elementary',
  intermediate: 'english.category.intermediate',
  advanced:     'english.category.advanced',
};
