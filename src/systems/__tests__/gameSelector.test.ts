/**
 * gameSelector.test.ts
 * pickEngine 가중치 분포 검증 + getAdapter 3개 등록 확인.
 *
 * - 시드 rng 주입으로 결정론적 검증
 * - 어댑터 모듈을 직접 import해 자기 등록(side-effect) 유발
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { pickEngine, getAdapter } from '../math/gameSelector';
import type { EngineEntry } from '../math/gameSelector';
import { seededRandom } from '../math/questionGenerator';

// 어댑터 자기 등록 — 이 import가 없으면 getAdapter 조회가 실패한다
import '../math/adapters/mathQuizAdapter';
import '../math/adapters/eqFillAdapter';
import '../math/adapters/patternFinderAdapter';

// ── pickEngine — 기본 동작 ─────────────────────────────────────────────────

describe('pickEngine — 기본 동작', () => {
  it('단일 엔트리 풀은 항상 그 id를 반환한다', () => {
    const pool: EngineEntry[] = [{ id: 'only', weight: 1 }];
    // rng를 어떻게 주입해도 결과가 동일해야 한다
    expect(pickEngine(pool, () => 0)).toBe('only');
    expect(pickEngine(pool, () => 0.9999)).toBe('only');
  });

  it('빈 풀은 RangeError를 던진다', () => {
    expect(() => pickEngine([])).toThrow(RangeError);
  });

  it('totalWeight ≤ 0이면 RangeError를 던진다', () => {
    expect(() => pickEngine([{ id: 'a', weight: 0 }, { id: 'b', weight: 0 }])).toThrow(RangeError);
  });

  it('weight=1 균등 풀: rng=0.0 → 첫 번째 항목', () => {
    const pool: EngineEntry[] = [
      { id: 'a', weight: 1 },
      { id: 'b', weight: 1 },
      { id: 'c', weight: 1 },
    ];
    // rng() * 3 = 0.0 → rand=0 → 첫 loop에서 0-1=-1<0 → 'a'
    expect(pickEngine(pool, () => 0)).toBe('a');
  });

  it('weight=1 균등 풀: rng≈1.0 → 마지막 항목(부동소수점 안전 fallback)', () => {
    const pool: EngineEntry[] = [
      { id: 'a', weight: 1 },
      { id: 'b', weight: 1 },
      { id: 'c', weight: 1 },
    ];
    // rng()=0.9999... → rand=2.9999... → a:-1.0..., b:0.9999..., c fallback
    expect(pickEngine(pool, () => 0.99999999)).toBe('c');
  });
});

// ── pickEngine — 가중치 분포 (시드 rng, 결정성) ───────────────────────────

describe('pickEngine — 가중치 분포 결정성 검증', () => {
  const pool: EngineEntry[] = [
    { id: 'math-quiz',      weight: 2 },
    { id: 'eq-fill',        weight: 3 },
    { id: 'pattern-finder', weight: 4 },
  ];
  const TRIALS = 10_000;

  it('시드 rng를 주입하면 동일한 결과가 재현된다 (결정성)', () => {
    const run1: string[] = [];
    const run2: string[] = [];
    const rng1 = seededRandom(42);
    const rng2 = seededRandom(42);
    for (let i = 0; i < 20; i++) {
      run1.push(pickEngine(pool, rng1));
      run2.push(pickEngine(pool, rng2));
    }
    expect(run1).toEqual(run2);
  });

  it('총 가중치(9) 기준으로 각 엔진의 출현 비율이 기댓값에 수렴한다 (±5%)', () => {
    const rng = seededRandom(7777);
    const counts: Record<string, number> = {
      'math-quiz': 0,
      'eq-fill': 0,
      'pattern-finder': 0,
    };
    for (let i = 0; i < TRIALS; i++) {
      counts[pickEngine(pool, rng)]++;
    }

    const totalWeight = 9;
    const tolerance = 0.05; // ±5%

    pool.forEach(({ id, weight }) => {
      const expectedRate = weight / totalWeight;
      const actualRate = counts[id] / TRIALS;
      expect(actualRate).toBeGreaterThan(expectedRate - tolerance);
      expect(actualRate).toBeLessThan(expectedRate + tolerance);
    });
  });

  it('고가중치 항목(pattern-finder w=4)이 저가중치 항목(math-quiz w=2)보다 많이 선택된다', () => {
    const rng = seededRandom(1234);
    let quizCount = 0;
    let patCount = 0;
    for (let i = 0; i < TRIALS; i++) {
      const id = pickEngine(pool, rng);
      if (id === 'math-quiz') quizCount++;
      if (id === 'pattern-finder') patCount++;
    }
    expect(patCount).toBeGreaterThan(quizCount);
  });

  it('단일 풀은 어떤 rng를 주입해도 항상 동일 id를 반환한다', () => {
    const singlePool: EngineEntry[] = [{ id: 'solo', weight: 99 }];
    const rng = seededRandom(99);
    for (let i = 0; i < 50; i++) {
      expect(pickEngine(singlePool, rng)).toBe('solo');
    }
  });
});

// ── 편향 가중치 — 극단값 검증 ─────────────────────────────────────────────

describe('pickEngine — 극단 가중치', () => {
  it('weight 100:1 풀에서 고가중치 항목이 압도적으로 선택된다 (>95%)', () => {
    const pool: EngineEntry[] = [
      { id: 'heavy', weight: 100 },
      { id: 'light', weight: 1 },
    ];
    const rng = seededRandom(55);
    let heavy = 0;
    for (let i = 0; i < 1000; i++) {
      if (pickEngine(pool, rng) === 'heavy') heavy++;
    }
    expect(heavy / 1000).toBeGreaterThan(0.93);
  });
});

// ── getAdapter — 3개 등록 확인 ────────────────────────────────────────────

describe('getAdapter — 레지스트리 등록 확인', () => {
  it('math-quiz 어댑터가 등록되어 있다', () => {
    const adapter = getAdapter('math-quiz');
    expect(adapter).toBeDefined();
    expect(adapter!.id).toBe('math-quiz');
  });

  it('eq-fill 어댑터가 등록되어 있다', () => {
    const adapter = getAdapter('eq-fill');
    expect(adapter).toBeDefined();
    expect(adapter!.id).toBe('eq-fill');
  });

  it('pattern-finder 어댑터가 등록되어 있다', () => {
    const adapter = getAdapter('pattern-finder');
    expect(adapter).toBeDefined();
    expect(adapter!.id).toBe('pattern-finder');
  });

  it('미등록 id는 undefined를 반환한다', () => {
    expect(getAdapter('nonexistent-engine')).toBeUndefined();
  });

  it('3개 어댑터 모두 mount/unmount 메서드를 갖는다', () => {
    const ids = ['math-quiz', 'eq-fill', 'pattern-finder'];
    ids.forEach((id) => {
      const adapter = getAdapter(id);
      expect(adapter).toBeDefined();
      expect(typeof adapter!.mount).toBe('function');
      expect(typeof adapter!.unmount).toBe('function');
    });
  });
});
