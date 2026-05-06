import type { EmojiCategory } from './matrixReasoningTypes';

export const EMOJI_POOL: Record<EmojiCategory, string[]> = {
  fruit:     ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉'],
  animal:    ['🐶', '🐱', '🐰', '🐼', '🦁', '🐨'],
  celestial: ['⭐', '🌙', '☀️', '⚡', '🌈', '✨'],
  vehicle:   ['🚗', '🚌', '🚲', '✈️', '🚀', '⛵'],
  food:      ['🍕', '🍔', '🍟', '🍩', '🍪', '🥨'],
  face:      ['😀', '😎', '🤔', '😴', '🥳', '😇'],
};

export const ALL_CATEGORIES: EmojiCategory[] = ['fruit', 'animal', 'celestial', 'vehicle', 'food', 'face'];
