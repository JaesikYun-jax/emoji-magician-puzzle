import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const FOOD_WORDS: W[] = [
  // beginner (10)
  { id: 'daily-apple',   english: 'apple',      korean: '사과',   category: 'food', difficulty: 'beginner' },
  { id: 'daily-cake',    english: 'cake',       korean: '케이크', category: 'food', difficulty: 'beginner' },
  { id: 'food-milk',     english: 'milk',       korean: '우유',   category: 'food', difficulty: 'beginner' },
  { id: 'food-egg',      english: 'egg',        korean: '달걀',   category: 'food', difficulty: 'beginner' },
  { id: 'food-bread',    english: 'bread',      korean: '빵',     category: 'food', difficulty: 'beginner' },
  { id: 'food-rice',     english: 'rice',       korean: '밥',     category: 'food', difficulty: 'beginner' },
  { id: 'food-cookie',   english: 'cookie',     korean: '쿠키',   category: 'food', difficulty: 'beginner' },
  { id: 'food-candy',    english: 'candy',      korean: '사탕',   category: 'food', difficulty: 'beginner' },
  { id: 'food-juice',    english: 'juice',      korean: '주스',   category: 'food', difficulty: 'beginner' },
  { id: 'food-banana',   english: 'banana',     korean: '바나나', category: 'food', difficulty: 'beginner' },
  // elementary (15)
  { id: 'food-pizza',      english: 'pizza',     korean: '피자',     category: 'food', difficulty: 'elementary' },
  { id: 'food-noodle',     english: 'noodle',    korean: '국수',     category: 'food', difficulty: 'elementary' },
  { id: 'food-soup',       english: 'soup',      korean: '수프',     category: 'food', difficulty: 'elementary' },
  { id: 'food-salad',      english: 'salad',     korean: '샐러드',   category: 'food', difficulty: 'elementary' },
  { id: 'food-sandwich',   english: 'sandwich',  korean: '샌드위치', category: 'food', difficulty: 'elementary' },
  { id: 'food-fruit',      english: 'fruit',     korean: '과일',     category: 'food', difficulty: 'elementary' },
  { id: 'food-vegetable',  english: 'vegetable', korean: '채소',     category: 'food', difficulty: 'elementary' },
  { id: 'food-meat',       english: 'meat',      korean: '고기',     category: 'food', difficulty: 'elementary' },
  { id: 'food-chicken',    english: 'chicken',   korean: '닭고기',   category: 'food', difficulty: 'elementary' },
  { id: 'food-shrimp',     english: 'shrimp',    korean: '새우',     category: 'food', difficulty: 'elementary' },
  { id: 'food-grape',      english: 'grape',     korean: '포도',     category: 'food', difficulty: 'elementary' },
  { id: 'food-lemon',      english: 'lemon',     korean: '레몬',     category: 'food', difficulty: 'elementary' },
  { id: 'food-strawberry', english: 'strawberry',korean: '딸기',     category: 'food', difficulty: 'elementary' },
  { id: 'food-cheese',     english: 'cheese',    korean: '치즈',     category: 'food', difficulty: 'elementary' },
  { id: 'food-butter',     english: 'butter',    korean: '버터',     category: 'food', difficulty: 'elementary' },
  // intermediate (10)
  { id: 'food-pumpkin',  english: 'pumpkin',  korean: '호박',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-mushroom', english: 'mushroom', korean: '버섯',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-spinach',  english: 'spinach',  korean: '시금치', category: 'food', difficulty: 'intermediate' },
  { id: 'food-garlic',   english: 'garlic',   korean: '마늘',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-onion',    english: 'onion',    korean: '양파',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-potato',   english: 'potato',   korean: '감자',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-tomato',   english: 'tomato',   korean: '토마토', category: 'food', difficulty: 'intermediate' },
  { id: 'food-carrot',   english: 'carrot',   korean: '당근',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-cucumber', english: 'cucumber', korean: '오이',   category: 'food', difficulty: 'intermediate' },
  { id: 'food-pepper',   english: 'pepper',   korean: '후추',   category: 'food', difficulty: 'intermediate' },
];
