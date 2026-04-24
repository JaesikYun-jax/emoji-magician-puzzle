import { describe, it, expect } from 'vitest';
import { dayKey, subtractDays, daysDiff } from '../../systems/gamification/dateBoundary';

describe('dateBoundary', () => {
  describe('dayKey', () => {
    it('Date 객체를 YYYY-MM-DD 형식으로 변환한다', () => {
      const date = new Date(2026, 3, 23); // 2026-04-23 (month is 0-indexed)
      expect(dayKey(date)).toBe('2026-04-23');
    });

    it('1~9월/일 에 0 패딩이 붙는다', () => {
      const date = new Date(2026, 0, 5); // 2026-01-05
      expect(dayKey(date)).toBe('2026-01-05');
    });

    it('12월 31일을 올바르게 변환한다', () => {
      const date = new Date(2025, 11, 31); // 2025-12-31
      expect(dayKey(date)).toBe('2025-12-31');
    });

    it('인자 없이 호출하면 현재 날짜를 YYYY-MM-DD 로 반환한다', () => {
      const result = dayKey();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('subtractDays', () => {
    it('n=1 이면 하루 전 dayKey를 반환한다', () => {
      expect(subtractDays('2026-04-23', 1)).toBe('2026-04-22');
    });

    it('월 경계를 넘어 계산한다', () => {
      expect(subtractDays('2026-04-01', 1)).toBe('2026-03-31');
    });

    it('연 경계를 넘어 계산한다', () => {
      expect(subtractDays('2026-01-01', 1)).toBe('2025-12-31');
    });

    it('n=0 이면 같은 dayKey를 반환한다', () => {
      expect(subtractDays('2026-04-23', 0)).toBe('2026-04-23');
    });

    it('n=7 이면 7일 전 dayKey를 반환한다', () => {
      expect(subtractDays('2026-04-23', 7)).toBe('2026-04-16');
    });
  });

  describe('daysDiff', () => {
    it('같은 날짜면 0을 반환한다', () => {
      expect(daysDiff('2026-04-23', '2026-04-23')).toBe(0);
    });

    it('a가 b보다 1일 뒤면 +1을 반환한다', () => {
      expect(daysDiff('2026-04-24', '2026-04-23')).toBe(1);
    });

    it('a가 b보다 1일 앞이면 -1을 반환한다', () => {
      expect(daysDiff('2026-04-22', '2026-04-23')).toBe(-1);
    });

    it('월 경계를 걸쳐 차이를 올바르게 계산한다', () => {
      expect(daysDiff('2026-05-01', '2026-04-28')).toBe(3);
    });

    it('14일 차이를 올바르게 계산한다', () => {
      expect(daysDiff('2026-05-07', '2026-04-23')).toBe(14);
    });
  });
});
