import type { EnglishCategory, EnglishDifficulty } from './categories';

interface W { id: string; english: string; korean: string; emoji: string; category: EnglishCategory; difficulty: EnglishDifficulty; }

export const SCHOOL_WORDS: W[] = [
  // elementary (15)
  { id: 'school-teacher',    english: 'teacher',     korean: '선생님', emoji: '👩‍🏫', category: 'school', difficulty: 'elementary' },
  { id: 'school-student',    english: 'student',     korean: '학생',   emoji: '🧑‍🎓', category: 'school', difficulty: 'elementary' },
  { id: 'school-classroom',  english: 'classroom',   korean: '교실',   emoji: '🏫', category: 'school', difficulty: 'elementary' },
  { id: 'school-desk',       english: 'desk',        korean: '책상',   emoji: '🪑', category: 'school', difficulty: 'elementary' },
  { id: 'school-eraser',     english: 'eraser',      korean: '지우개', emoji: '🧹', category: 'school', difficulty: 'elementary' },
  { id: 'school-pencilcase', english: 'pencil case', korean: '필통',   emoji: '🖊️', category: 'school', difficulty: 'elementary' },
  { id: 'school-ruler',      english: 'ruler',       korean: '자',     emoji: '📏', category: 'school', difficulty: 'elementary' },
  { id: 'school-notebook',   english: 'notebook',    korean: '공책',   emoji: '📓', category: 'school', difficulty: 'elementary' },
  { id: 'school-backpack',   english: 'backpack',    korean: '책가방', emoji: '🎒', category: 'school', difficulty: 'elementary' },
  { id: 'school-lunch',      english: 'lunch',       korean: '점심',   emoji: '🍱', category: 'school', difficulty: 'elementary' },
  { id: 'school-friend',     english: 'friend',      korean: '친구',   emoji: '🤝', category: 'school', difficulty: 'elementary' },
  { id: 'school-playground', english: 'playground',  korean: '운동장', emoji: '🛝', category: 'school', difficulty: 'elementary' },
  { id: 'school-library',    english: 'library',     korean: '도서관', emoji: '📚', category: 'school', difficulty: 'elementary' },
  { id: 'school-gym',        english: 'gym',         korean: '체육관', emoji: '🏋️', category: 'school', difficulty: 'elementary' },
  { id: 'school-art',        english: 'art',         korean: '미술',   emoji: '🎨', category: 'school', difficulty: 'elementary' },
  // intermediate (10)
  { id: 'school-science',   english: 'science',   korean: '과학', emoji: '🔬', category: 'school', difficulty: 'intermediate' },
  { id: 'school-history',   english: 'history',   korean: '역사', emoji: '📜', category: 'school', difficulty: 'intermediate' },
  { id: 'school-music',     english: 'music',     korean: '음악', emoji: '🎵', category: 'school', difficulty: 'intermediate' },
  { id: 'school-sports',    english: 'sports',    korean: '체육', emoji: '⚽', category: 'school', difficulty: 'intermediate' },
  { id: 'school-reading',   english: 'reading',   korean: '독서', emoji: '📖', category: 'school', difficulty: 'intermediate' },
  { id: 'school-grammar',   english: 'grammar',   korean: '문법', emoji: '✍️', category: 'school', difficulty: 'intermediate' },
  { id: 'school-test',      english: 'test',      korean: '시험', emoji: '📝', category: 'school', difficulty: 'intermediate' },
  { id: 'school-grade',     english: 'grade',     korean: '성적', emoji: '🏆', category: 'school', difficulty: 'intermediate' },
  { id: 'school-homework',  english: 'homework',  korean: '숙제', emoji: '📋', category: 'school', difficulty: 'intermediate' },
  { id: 'school-principal', english: 'principal', korean: '교장', emoji: '👔', category: 'school', difficulty: 'intermediate' },
];
