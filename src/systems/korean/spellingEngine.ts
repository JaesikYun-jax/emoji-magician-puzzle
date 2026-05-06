import {
  SPELLING_QUESTIONS,
  getQuestionsByDifficulty,
  type SpellingQuestion,
  type SpellingDifficulty,
} from '../../game-data/korean/spellingQuestions';

export type { SpellingDifficulty };

export interface SpellingQuizQuestion {
  question: SpellingQuestion;
  choices: [string, string]; // [choice0, choice1] — 셔플 결과
  correctIdx: 0 | 1;         // 정답 위치
}

export interface SpellingQuizSession {
  questions: SpellingQuizQuestion[];
  totalCount: number;
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 맞춤법 퀴즈 세션 생성.
 * - pool: 문제 소스 (기본값 전체 SPELLING_QUESTIONS)
 * - count: 문제 수 (기본 10)
 * - difficulty: 난이도 필터 (없으면 pool 그대로 사용)
 */
export function buildSpellingSession(
  pool: SpellingQuestion[] = SPELLING_QUESTIONS,
  count = 10,
  difficulty?: SpellingDifficulty,
): SpellingQuizSession {
  const filtered = difficulty
    ? pool.filter(q => q.difficulty === difficulty)
    : pool;

  const picked = shuffle(filtered).slice(0, Math.min(count, filtered.length));

  const questions: SpellingQuizQuestion[] = picked.map(q => {
    const swap = Math.random() < 0.5;
    const choices: [string, string] = swap
      ? [q.wrong, q.correct]
      : [q.correct, q.wrong];
    const correctIdx: 0 | 1 = swap ? 1 : 0;
    return { question: q, choices, correctIdx };
  });

  return { questions, totalCount: questions.length };
}

/**
 * 난이도별 문제 풀 반환 (편의 함수)
 */
export { getQuestionsByDifficulty };
