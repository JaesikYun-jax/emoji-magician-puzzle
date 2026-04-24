import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveService } from '../../../src/services/SaveService';

// localStorage mock
let store: Record<string, string> = {};

vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { store = {}; },
});

describe('SaveService', () => {
  let service: SaveService;

  beforeEach(() => {
    store = {};
    service = new SaveService();
  });

  describe('초기 생성', () => {
    it('덧셈 첫 레벨(math-add-single-1)이 isUnlocked: true이다', () => {
      const progress = service.getMathProgress('math-add-single-1');
      expect(progress.isUnlocked).toBe(true);
    });

    it('뺄셈 첫 레벨(math-sub-single-1)이 isUnlocked: true이다', () => {
      const progress = service.getMathProgress('math-sub-single-1');
      expect(progress.isUnlocked).toBe(true);
    });

    it('곱셈 첫 레벨(math-mul-1)이 isUnlocked: true이다', () => {
      const progress = service.getMathProgress('math-mul-1');
      expect(progress.isUnlocked).toBe(true);
    });
  });

  describe('recordMathClear - 다음 레벨 해금', () => {
    it('덧셈 첫 레벨 클리어 후 다음 레벨(math-add-single-2)이 해금된다', () => {
      const nextId = service.recordMathClear('math-add-single-1', 3, 1000);
      expect(nextId).toBe('math-add-single-2');
      const progress = service.getMathProgress('math-add-single-2');
      expect(progress.isUnlocked).toBe(true);
    });

    it('뺄셈 첫 레벨 클리어 후 다음 레벨(math-sub-single-2)이 해금된다', () => {
      const nextId = service.recordMathClear('math-sub-single-1', 2, 500);
      expect(nextId).toBe('math-sub-single-2');
      const progress = service.getMathProgress('math-sub-single-2');
      expect(progress.isUnlocked).toBe(true);
    });

    it('곱셈 첫 레벨 클리어 후 다음 레벨(math-mul-2)이 해금된다', () => {
      const nextId = service.recordMathClear('math-mul-1', 1, 200);
      expect(nextId).toBe('math-mul-2');
      const progress = service.getMathProgress('math-mul-2');
      expect(progress.isUnlocked).toBe(true);
    });
  });

  describe('recordMathClear - 별점 최고값 보존', () => {
    it('기존 2별인데 1별 클리어 시 여전히 2별을 유지한다', () => {
      // 먼저 2별로 클리어
      service.recordMathClear('math-add-single-1', 2, 500);
      // 다시 1별로 클리어
      service.recordMathClear('math-add-single-1', 1, 100);
      const progress = service.getMathProgress('math-add-single-1');
      expect(progress.stars).toBe(2);
    });

    it('기존 1별인데 3별 클리어 시 3별로 갱신된다', () => {
      service.recordMathClear('math-add-single-1', 1, 100);
      service.recordMathClear('math-add-single-1', 3, 9999);
      const progress = service.getMathProgress('math-add-single-1');
      expect(progress.stars).toBe(3);
    });

    it('기존 점수보다 낮은 점수로 클리어 시 bestScore는 기존 값을 유지한다', () => {
      service.recordMathClear('math-add-single-1', 3, 1000);
      service.recordMathClear('math-add-single-1', 1, 200);
      const progress = service.getMathProgress('math-add-single-1');
      expect(progress.bestScore).toBe(1000);
    });

    it('클리어 횟수(playCount)가 누적된다', () => {
      service.recordMathClear('math-add-single-1', 2, 500);
      service.recordMathClear('math-add-single-1', 1, 100);
      const progress = service.getMathProgress('math-add-single-1');
      expect(progress.playCount).toBe(2);
    });
  });

  describe('getUnlockedMathIds', () => {
    it('초기에는 덧셈/뺄셈/곱셈 첫 레벨 ID가 포함된다', () => {
      const ids = service.getUnlockedMathIds();
      expect(ids).toContain('math-add-single-1');
      expect(ids).toContain('math-sub-single-1');
      expect(ids).toContain('math-mul-1');
    });

    it('레벨 클리어 후 해금된 ID가 목록에 추가된다', () => {
      service.recordMathClear('math-add-single-1', 3, 1000);
      const ids = service.getUnlockedMathIds();
      expect(ids).toContain('math-add-single-2');
    });
  });

  describe('getMathProgress - 미등록 레벨', () => {
    it('미등록 레벨 ID에 대해 isUnlocked: false를 반환한다', () => {
      const progress = service.getMathProgress('math-add-single-99');
      expect(progress.isUnlocked).toBe(false);
    });

    it('미등록 레벨 ID에 대해 기본값을 반환한다', () => {
      const progress = service.getMathProgress('non-existent-level');
      expect(progress.stars).toBe(0);
      expect(progress.bestScore).toBe(0);
      expect(progress.playCount).toBe(0);
      expect(progress.isUnlocked).toBe(false);
    });
  });

  describe('LevelTest 메서드', () => {
    const mathTestResult = {
      testedAt: 1713600000000,
      recommendedLevelId: 'math-add-single-2',
      recommendedLevelIndex: 2,
      stagesCleared: 3,
      totalQuestions: 5,
      correctCount: 4,
    };

    const englishTestResult = {
      testedAt: 1713600000000,
      recommendedLevelId: 'english-beginner-1',
      recommendedLevelIndex: 1,
      stagesCleared: 2,
      totalQuestions: 5,
      correctCount: 3,
    };

    it('getMathLevelTestResult() 초기에 null을 반환한다', () => {
      expect(service.getMathLevelTestResult()).toBeNull();
    });

    it('recordMathLevelTest() 호출 후 getMathLevelTestResult()가 저장된 결과를 반환한다', () => {
      service.recordMathLevelTest(mathTestResult);
      const result = service.getMathLevelTestResult();
      expect(result).not.toBeNull();
      expect(result?.recommendedLevelId).toBe('math-add-single-2');
      expect(result?.correctCount).toBe(4);
      expect(result?.stagesCleared).toBe(3);
    });

    it('recordMathLevelTest() 호출 후 recommendedLevelIndex까지 해당 operation 레벨이 해금된다', () => {
      service.recordMathLevelTest(mathTestResult);
      // math-add-single-1 (levelIndex=1)과 math-add-single-2 (levelIndex=2) 모두 해금돼야 한다
      expect(service.getMathProgress('math-add-single-1').isUnlocked).toBe(true);
      expect(service.getMathProgress('math-add-single-2').isUnlocked).toBe(true);
    });

    it('recordMathLevelTest() 호출 후 recommendedLevelIndex보다 큰 레벨은 해금되지 않는다', () => {
      service.recordMathLevelTest(mathTestResult);
      // math-add-single-3 (levelIndex=3)은 해금 안 됨
      expect(service.getMathProgress('math-add-single-3').isUnlocked).toBe(false);
    });

    it('recordMathLevelTest() 결과가 localStorage에 영속된다', () => {
      service.recordMathLevelTest(mathTestResult);
      // 새 인스턴스로 다시 로드
      const service2 = new SaveService();
      const result = service2.getMathLevelTestResult();
      expect(result).not.toBeNull();
      expect(result?.recommendedLevelId).toBe('math-add-single-2');
    });

    it('getEnglishLevelTestResult() 초기에 null을 반환한다', () => {
      expect(service.getEnglishLevelTestResult()).toBeNull();
    });

    it('recordEnglishLevelTest() 저장 후 getEnglishLevelTestResult()가 결과를 반환한다', () => {
      service.recordEnglishLevelTest(englishTestResult);
      const result = service.getEnglishLevelTestResult();
      expect(result).not.toBeNull();
      expect(result?.recommendedLevelId).toBe('english-beginner-1');
      expect(result?.correctCount).toBe(3);
    });

    it('recordEnglishLevelTest() 결과가 localStorage에 영속된다', () => {
      service.recordEnglishLevelTest(englishTestResult);
      const service2 = new SaveService();
      const result = service2.getEnglishLevelTestResult();
      expect(result).not.toBeNull();
      expect(result?.recommendedLevelId).toBe('english-beginner-1');
    });

    it('recordMathLevelTest()를 두 번 호출하면 최신 결과로 덮어씌워진다', () => {
      service.recordMathLevelTest(mathTestResult);
      const updatedResult = { ...mathTestResult, correctCount: 5, recommendedLevelId: 'math-add-single-3', recommendedLevelIndex: 3 };
      service.recordMathLevelTest(updatedResult);
      const result = service.getMathLevelTestResult();
      expect(result?.correctCount).toBe(5);
      expect(result?.recommendedLevelId).toBe('math-add-single-3');
    });

    it('recommendedLevelId가 존재하지 않는 ID일 때 해금 처리 없이 저장만 된다', () => {
      const invalidResult = { ...mathTestResult, recommendedLevelId: 'math-add-nonexistent', recommendedLevelIndex: 99 };
      service.recordMathLevelTest(invalidResult);
      // 저장은 되어야 한다
      const result = service.getMathLevelTestResult();
      expect(result).not.toBeNull();
      expect(result?.recommendedLevelId).toBe('math-add-nonexistent');
    });
  });
});
