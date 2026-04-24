/**
 * gameSelector.ts
 * 수리 듀오링고 C2 — 게임 셀렉터 & 어댑터 레지스트리
 *
 * 공개 API:
 *   - MathGameAdapter  어댑터 인터페이스
 *   - LessonRunCtx     레슨 실행 컨텍스트
 *   - LessonRunResult  레슨 실행 결과
 *   - Slot             슬롯 디스크립터
 *   - EngineEntry      가중치 풀 엔트리
 *   - pickEngine()     가중치 기반 엔진 선택 (순수 함수)
 *   - getAdapter()     레지스트리 조회
 *   - registerAdapter() 어댑터 등록 (어댑터 모듈이 자기 등록에 사용)
 */

// ── 타입 정의 ──────────────────────────────────────────────────────────────

/** 레슨 실행 컨텍스트 — 어댑터의 mount()에 전달되는 입력 */
export interface LessonRunCtx {
  /** 게임/레벨 식별자 (예: 'eq-fill-3', 'math-1') */
  levelId: string;
}

/** 레슨 실행 결과 — mount()가 resolve하는 출력 */
export interface LessonRunResult {
  cleared: boolean;
  stars: number;   // 0~3
  score: number;
}

/**
 * 슬롯 디스크립터.
 * ref = 'inline'          → 어댑터가 host 안에서 새로 컴포넌트를 생성
 * ref = '<legacy-id>'     → 기존에 마운트된 컴포넌트의 DOM id를 참조
 */
export interface Slot {
  ref: string;
}

/** 가중치 풀 엔트리 (pickEngine 입력) */
export interface EngineEntry {
  id: string;
  weight: number;
}

/** 게임 어댑터 인터페이스 */
export interface MathGameAdapter {
  readonly id: string;
  /**
   * 게임을 host에 마운트하고 레슨이 끝나면 LessonRunResult로 resolve한다.
   * slot.ref = 'inline' → 어댑터가 host 안에서 DOM을 직접 생성.
   */
  mount(host: HTMLElement, slot: Slot, ctx: LessonRunCtx): Promise<LessonRunResult>;
  /** 이벤트 리스너 정리 및 DOM 숨김/제거 */
  unmount(): void;
}

// ── 내부 레지스트리 ────────────────────────────────────────────────────────

/** 모듈 내부 Map — 외부에서 직접 접근 불가 */
const engineRegistry = new Map<string, MathGameAdapter>();

// ── 공개 함수 ──────────────────────────────────────────────────────────────

/**
 * 어댑터를 레지스트리에 등록한다.
 * 어댑터 모듈이 import될 때 자기 등록(self-registration)을 위해 호출한다.
 */
export function registerAdapter(adapter: MathGameAdapter): void {
  engineRegistry.set(adapter.id, adapter);
}

/**
 * id로 등록된 어댑터를 조회한다.
 * @returns MathGameAdapter | undefined
 */
export function getAdapter(id: string): MathGameAdapter | undefined {
  return engineRegistry.get(id);
}

/**
 * 가중치 기반 엔진 선택 (순수 함수).
 *
 * @param pool - [{id, weight}, ...] 가중치 합이 0 초과여야 함
 * @param rng  - 0 이상 1 미만의 실수를 반환하는 함수 (기본: Math.random)
 *               시드 rng를 주입하면 결정론적 결과를 얻을 수 있다.
 * @throws RangeError pool이 비어 있거나 totalWeight ≤ 0일 때
 */
export function pickEngine(pool: EngineEntry[], rng: () => number = Math.random): string {
  if (pool.length === 0) {
    throw new RangeError('pickEngine: pool must not be empty');
  }
  if (pool.length === 1) {
    return pool[0].id;
  }

  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    throw new RangeError('pickEngine: total weight must be positive');
  }

  let rand = rng() * totalWeight;
  for (const entry of pool) {
    rand -= entry.weight;
    if (rand < 0) return entry.id;
  }
  // 부동소수점 오차(rand ≈ 0)일 때 마지막 항목 반환
  return pool[pool.length - 1].id;
}
