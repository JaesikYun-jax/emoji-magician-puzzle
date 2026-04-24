import { describe, it, expect } from 'vitest';
import { computeStreak } from '../../systems/gamification/streak';

const GOAL = 50;

describe('computeStreak', () => {
  it('xpByDay 가 비어있으면 streak 은 0이다', () => {
    expect(computeStreak({}, GOAL, '2026-04-23')).toBe(0);
  });

  it('오늘만 goal 달성 시 streak = 1', () => {
    const xp = { '2026-04-23': 50 };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(1);
  });

  it('오늘 XP 가 goal 미달이면 어제부터 계산: 어제만 달성이면 streak = 1', () => {
    const xp = { '2026-04-22': 50 };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(1);
  });

  it('오늘·어제 모두 달성이면 streak = 2', () => {
    const xp = { '2026-04-23': 60, '2026-04-22': 50 };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(2);
  });

  it('3일 연속 달성이면 streak = 3', () => {
    const xp = {
      '2026-04-23': 70,
      '2026-04-22': 50,
      '2026-04-21': 100,
    };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(3);
  });

  it('중간에 하루 빠지면 연속이 끊어진다', () => {
    // 04-23, 04-21 달성, 04-22 미달 → 오늘부터 1
    const xp = {
      '2026-04-23': 50,
      '2026-04-22': 10, // 미달
      '2026-04-21': 50,
    };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(1);
  });

  it('오늘·어제 둘 다 미달이면 streak = 0', () => {
    const xp = {
      '2026-04-23': 10,
      '2026-04-22': 20,
      '2026-04-21': 50,
    };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(0);
  });

  it('goal XP 정확히 충족(=) 하면 달성으로 간주한다', () => {
    const xp = { '2026-04-23': GOAL };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(1);
  });

  it('goal XP 보다 1 적으면 미달로 간주한다', () => {
    const xp = { '2026-04-23': GOAL - 1 };
    expect(computeStreak(xp, GOAL, '2026-04-23')).toBe(0);
  });

  it('월 경계를 가로질러 연속을 계산한다', () => {
    const xp = {
      '2026-05-01': 50,
      '2026-04-30': 50,
      '2026-04-29': 50,
    };
    expect(computeStreak(xp, GOAL, '2026-05-01')).toBe(3);
  });
});
