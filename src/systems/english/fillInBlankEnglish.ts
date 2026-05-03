import { generateSession } from '../fillInBlank/engine';
import type { FIBDifficulty, GeneratedProblem } from '../fillInBlank/types';
import { ENGLISH_FIB_TEMPLATES } from '../../game-data/english/fillInBlank/templates';

export type { FIBDifficulty, GeneratedProblem };

/** 난이도 문자열을 FIBDifficulty로 정규화 */
export function normalizeDifficulty(raw: string): FIBDifficulty {
  if (
    raw === 'beginner' ||
    raw === 'elementary' ||
    raw === 'intermediate' ||
    raw === 'advanced' ||
    raw === 'expert'
  ) {
    return raw;
  }
  return 'beginner';
}

/**
 * 영어 빈칸 채우기 세션 생성.
 * @param difficulty 난이도
 * @param count      문제 수 (기본 8)
 * @param seed       재현성 시드 (기본 Date.now())
 */
export function buildFillInBlankSession(
  difficulty: FIBDifficulty,
  count = 8,
  seed?: number,
): GeneratedProblem[] {
  const resolvedSeed = seed ?? Date.now();
  const templates = ENGLISH_FIB_TEMPLATES.filter((t) => t.difficulty === difficulty);
  return generateSession(templates, difficulty, count, resolvedSeed);
}
