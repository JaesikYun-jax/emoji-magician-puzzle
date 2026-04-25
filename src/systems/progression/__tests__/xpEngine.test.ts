import { describe, it, expect } from 'vitest';
import {
  computeLevel,
  computeLevelProgress,
  computeXpGain,
  estimateXpFromStars,
  buildSubjectProgress,
  MAX_LEVEL,
} from '../xpEngine';

describe('computeLevel', () => {
  it('0 XP → Lv1', () => expect(computeLevel(0)).toBe(1));
  it('59 XP → Lv1', () => expect(computeLevel(59)).toBe(1));
  it('60 XP → Lv2', () => expect(computeLevel(60)).toBe(2));
  it('2460 XP → 최대 레벨', () => expect(computeLevel(2460)).toBe(MAX_LEVEL));
  it('9999 XP → 최대 레벨 초과 안 됨', () => expect(computeLevel(9999)).toBe(MAX_LEVEL));
});

describe('computeLevelProgress', () => {
  it('Lv1에서 20 XP', () => {
    // Lv1 구간: 0~60 (60 XP 폭), 20 XP 진입 시 xpToNextLevel=40, percent=33
    const result = computeLevelProgress(20);
    expect(result.level).toBe(1);
    expect(result.xpInCurrentLevel).toBe(20);
    expect(result.xpToNextLevel).toBe(40);
    expect(result.levelProgressPercent).toBe(33);
  });

  it('최대 레벨에서 percent 100', () => {
    const result = computeLevelProgress(9999);
    expect(result.levelProgressPercent).toBe(100);
    expect(result.xpToNextLevel).toBe(0);
  });
});

describe('computeXpGain', () => {
  it('오답은 0 XP', () => {
    const gain = computeXpGain({ subjectId: 'math', streak: 5, isCorrect: false });
    expect(gain.total).toBe(0);
  });

  it('기본 정답은 10 XP', () => {
    const gain = computeXpGain({ subjectId: 'math', streak: 0, isCorrect: true });
    expect(gain.base).toBe(10);
    expect(gain.streakBonus).toBe(0);
  });

  it('streak 3이면 +6 보너스', () => {
    const gain = computeXpGain({ subjectId: 'math', streak: 3, isCorrect: true });
    expect(gain.streakBonus).toBe(6);
    expect(gain.total).toBe(16);
  });

  it('streak가 5 이상이어도 보너스는 최대 10', () => {
    const gain = computeXpGain({ subjectId: 'math', streak: 10, isCorrect: true });
    expect(gain.streakBonus).toBe(10);
  });

  it('difficultyMultiplier 1.5이면 base 15', () => {
    const gain = computeXpGain({ subjectId: 'math', streak: 0, isCorrect: true, difficultyMultiplier: 1.5 });
    expect(gain.base).toBe(15);
  });
});

describe('estimateXpFromStars', () => {
  it('별 10개 → 50 XP', () => expect(estimateXpFromStars(10)).toBe(50));
  it('별 0개 → 0 XP', () => expect(estimateXpFromStars(0)).toBe(0));
});

describe('buildSubjectProgress', () => {
  it('기본 필드를 올바르게 구성', () => {
    const progress = buildSubjectProgress({
      subjectId: 'math',
      xp: 100,
      totalClears: 20,
      streak: 3,
      bestStreak: 5,
    });
    expect(progress.subjectId).toBe('math');
    expect(progress.level).toBeGreaterThanOrEqual(1);
    expect(progress.rank).toBeTruthy();
    expect(progress.levelProgressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.levelProgressPercent).toBeLessThanOrEqual(100);
  });
});
