import { describe, it, expect, beforeEach, vi } from 'vitest';

// localStorage mock — vi.stubGlobal 방식으로 설정
let store: Record<string, string> = {};

vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { store = {}; },
});

// ArithmeticSaveService는 싱글턴 인스턴스도 export하지만
// 테스트에서는 매 beforeEach마다 새 인스턴스를 생성해 격리한다.
import { ArithmeticSaveService } from '../../services/ArithmeticSaveService';

describe('ArithmeticSaveService', () => {
  beforeEach(() => {
    store = {};
  });

  it('초기 상태: Level 1만 해금', () => {
    const svc = new ArithmeticSaveService();
    expect(svc.isUnlocked(1)).toBe(true);
    expect(svc.isUnlocked(2)).toBe(false);
  });

  it('별점 저장 및 하향 불가', () => {
    const svc = new ArithmeticSaveService();
    svc.saveResult(1, 'easy', 2);
    expect(svc.getBestStars(1).easy).toBe(2);
    svc.saveResult(1, 'easy', 1);
    expect(svc.getBestStars(1).easy).toBe(2); // 하향 안 됨
  });

  it('Level 1 클리어 → Level 2 해금', () => {
    const svc = new ArithmeticSaveService();
    svc.saveResult(1, 'normal', 1);
    expect(svc.isUnlocked(2)).toBe(true);
  });

  it('별점 0은 다음 레벨 해금 안 함', () => {
    const svc = new ArithmeticSaveService();
    svc.saveResult(1, 'easy', 0);
    expect(svc.isUnlocked(2)).toBe(false);
  });

  it('getBestStars — 저장 전 기본값 모두 0', () => {
    const svc = new ArithmeticSaveService();
    const stars = svc.getBestStars(1);
    expect(stars.easy).toBe(0);
    expect(stars.normal).toBe(0);
    expect(stars.hard).toBe(0);
  });

  it('난이도별 별점 독립 저장', () => {
    const svc = new ArithmeticSaveService();
    svc.saveResult(3, 'easy', 3);
    svc.saveResult(3, 'hard', 1);
    const stars = svc.getBestStars(3);
    expect(stars.easy).toBe(3);
    expect(stars.normal).toBe(0);
    expect(stars.hard).toBe(1);
  });

  it('reset → 초기 상태로 복귀', () => {
    const svc = new ArithmeticSaveService();
    svc.saveResult(1, 'easy', 3);
    svc.reset();
    expect(svc.getBestStars(1).easy).toBe(0);
    expect(svc.isUnlocked(2)).toBe(false);
  });

  it('존재하지 않는 levelId는 unlocked false 반환', () => {
    const svc = new ArithmeticSaveService();
    expect(svc.isUnlocked(99)).toBe(false);
  });

  it('localStorage 기존 데이터 로드', () => {
    // 먼저 저장
    const svc1 = new ArithmeticSaveService();
    svc1.saveResult(2, 'normal', 2);
    // 새 인스턴스로 다시 로드
    const svc2 = new ArithmeticSaveService();
    expect(svc2.getBestStars(2).normal).toBe(2);
  });
});
