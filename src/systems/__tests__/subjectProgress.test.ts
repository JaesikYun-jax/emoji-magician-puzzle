import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveService } from '../../../src/services/SaveService';

// localStorage mock (saveService.test.ts 패턴 동일)
let store: Record<string, string> = {};

vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { store = {}; },
});

describe('SubjectProgress (v6) 메서드', () => {
  let service: SaveService;

  beforeEach(() => {
    store = {};
    service = new SaveService();
  });

  // ── getSubjectProgress ────────────────────────────────────────────────────

  describe('getSubjectProgress', () => {
    it('초기값은 xp:0, level:1, totalClears:0, streak:0, bestStreak:0, placementDone:false', () => {
      const progress = service.getSubjectProgress('math');
      expect(progress).toEqual({
        xp: 0,
        level: 1,
        totalClears: 0,
        streak: 0,
        bestStreak: 0,
        placementDone: false,
      });
    });

    it('english 초기값도 기본값', () => {
      const progress = service.getSubjectProgress('english');
      expect(progress.xp).toBe(0);
      expect(progress.level).toBe(1);
      expect(progress.placementDone).toBe(false);
    });

    it('logic 초기값도 기본값', () => {
      const progress = service.getSubjectProgress('logic');
      expect(progress.xp).toBe(0);
      expect(progress.totalClears).toBe(0);
    });

    it('creativity 초기값도 기본값', () => {
      const progress = service.getSubjectProgress('creativity');
      expect(progress.xp).toBe(0);
      expect(progress.placementDone).toBe(false);
    });
  });

  // ── updateSubjectProgress ─────────────────────────────────────────────────

  describe('updateSubjectProgress', () => {
    it('math 업데이터 함수 적용 후 변경값이 저장됨', () => {
      service.updateSubjectProgress('math', prev => ({ ...prev, xp: 100, level: 2 }));
      const progress = service.getSubjectProgress('math');
      expect(progress.xp).toBe(100);
      expect(progress.level).toBe(2);
    });

    it('english 업데이터 함수 적용 후 변경값이 저장됨', () => {
      service.updateSubjectProgress('english', prev => ({ ...prev, totalClears: 5 }));
      const progress = service.getSubjectProgress('english');
      expect(progress.totalClears).toBe(5);
    });

    it('logic 업데이터 함수 적용 후 변경값이 저장됨', () => {
      service.updateSubjectProgress('logic', prev => ({ ...prev, streak: 3 }));
      const progress = service.getSubjectProgress('logic');
      expect(progress.streak).toBe(3);
    });

    it('creativity 업데이터 함수 적용 후 변경값이 저장됨', () => {
      service.updateSubjectProgress('creativity', prev => ({ ...prev, bestStreak: 7 }));
      const progress = service.getSubjectProgress('creativity');
      expect(progress.bestStreak).toBe(7);
    });

    it('변경 사항이 localStorage에 영속됨', () => {
      service.updateSubjectProgress('math', prev => ({ ...prev, xp: 200 }));
      const service2 = new SaveService();
      expect(service2.getSubjectProgress('math').xp).toBe(200);
    });

    it('업데이터는 이전 값을 받아서 처리함', () => {
      service.updateSubjectProgress('math', () => ({ xp: 50, level: 1, totalClears: 0, streak: 0, bestStreak: 0, placementDone: false }));
      service.updateSubjectProgress('math', prev => ({ ...prev, xp: prev.xp + 30 }));
      expect(service.getSubjectProgress('math').xp).toBe(80);
    });
  });

  // ── recordSubjectClear ────────────────────────────────────────────────────

  describe('recordSubjectClear', () => {
    it('isCorrect=true 시 xp 증가', () => {
      const result = service.recordSubjectClear('math', 10, true);
      expect(result.xp).toBe(10);
    });

    it('isCorrect=true 시 totalClears 증가', () => {
      const result = service.recordSubjectClear('math', 10, true);
      expect(result.totalClears).toBe(1);
    });

    it('isCorrect=true 시 streak 증가', () => {
      const result = service.recordSubjectClear('math', 10, true);
      expect(result.streak).toBe(1);
    });

    it('isCorrect=false 시 xp 불변', () => {
      service.recordSubjectClear('math', 10, true);
      const result = service.recordSubjectClear('math', 10, false);
      expect(result.xp).toBe(10);
    });

    it('isCorrect=false 시 streak 리셋(0)', () => {
      service.recordSubjectClear('math', 10, true);
      service.recordSubjectClear('math', 10, true);
      const result = service.recordSubjectClear('math', 10, false);
      expect(result.streak).toBe(0);
    });

    it('isCorrect=false 시 totalClears는 증가함', () => {
      service.recordSubjectClear('math', 10, true);
      const result = service.recordSubjectClear('math', 10, false);
      expect(result.totalClears).toBe(2);
    });

    it('연속 정답 시 bestStreak이 올라감', () => {
      service.recordSubjectClear('math', 10, true);
      service.recordSubjectClear('math', 10, true);
      const result = service.recordSubjectClear('math', 10, true);
      expect(result.streak).toBe(3);
      expect(result.bestStreak).toBe(3);
    });

    it('streak 리셋 후 bestStreak은 이전 최고값 유지', () => {
      service.recordSubjectClear('math', 10, true);
      service.recordSubjectClear('math', 10, true);
      service.recordSubjectClear('math', 10, false);
      const result = service.getSubjectProgress('math');
      expect(result.bestStreak).toBe(2);
      expect(result.streak).toBe(0);
    });

    it('english 분야에도 동작함', () => {
      const result = service.recordSubjectClear('english', 15, true);
      expect(result.xp).toBe(15);
      expect(result.totalClears).toBe(1);
    });

    it('logic 분야에도 동작함', () => {
      const result = service.recordSubjectClear('logic', 20, true);
      expect(result.xp).toBe(20);
    });

    it('creativity 분야에도 동작함', () => {
      const result = service.recordSubjectClear('creativity', 5, true);
      expect(result.xp).toBe(5);
    });

    it('결과가 localStorage에 영속됨', () => {
      service.recordSubjectClear('math', 10, true);
      const service2 = new SaveService();
      expect(service2.getSubjectProgress('math').xp).toBe(10);
      expect(service2.getSubjectProgress('math').totalClears).toBe(1);
    });
  });

  // ── recordPlacementDone ───────────────────────────────────────────────────

  describe('recordPlacementDone', () => {
    it('호출 후 placementDone이 true가 됨', () => {
      service.recordPlacementDone('math', 4, 5);
      expect(service.getSubjectProgress('math').placementDone).toBe(true);
    });

    it('correctCount/totalQuestions로 초기 XP 계산됨 (4/5 -> 40)', () => {
      service.recordPlacementDone('math', 4, 5);
      // xp = round((4/5) * 50) = round(40) = 40
      expect(service.getSubjectProgress('math').xp).toBe(40);
    });

    it('correctCount/totalQuestions로 초기 level 계산됨 (4/5 -> round(2.4)+1=3)', () => {
      service.recordPlacementDone('math', 4, 5);
      // level = round((4/5) * 3) + 1 = round(2.4) + 1 = 2+1 = 3
      expect(service.getSubjectProgress('math').level).toBe(3);
    });

    it('0점일 때 xp=0, level=1', () => {
      service.recordPlacementDone('math', 0, 5);
      // xp = round(0) = 0, level = round(0)+1 = 1
      expect(service.getSubjectProgress('math').xp).toBe(0);
      expect(service.getSubjectProgress('math').level).toBe(1);
    });

    it('만점일 때 xp=50, level=4', () => {
      service.recordPlacementDone('math', 5, 5);
      // xp = round(50) = 50, level = round(3)+1 = 4
      expect(service.getSubjectProgress('math').xp).toBe(50);
      expect(service.getSubjectProgress('math').level).toBe(4);
    });

    it('placementScore 필드에 correctCount가 기록됨', () => {
      service.recordPlacementDone('math', 3, 5);
      const progress = service.getSubjectProgress('math');
      expect(progress.placementScore).toBe(3);
    });

    it('english 분야에도 동작함', () => {
      service.recordPlacementDone('english', 2, 5);
      expect(service.getSubjectProgress('english').placementDone).toBe(true);
    });

    it('logic 분야에도 동작함', () => {
      service.recordPlacementDone('logic', 5, 5);
      expect(service.getSubjectProgress('logic').placementDone).toBe(true);
    });

    it('결과가 localStorage에 영속됨', () => {
      service.recordPlacementDone('math', 4, 5);
      const service2 = new SaveService();
      expect(service2.getSubjectProgress('math').placementDone).toBe(true);
    });
  });

  // ── isPlacementDone ───────────────────────────────────────────────────────

  describe('isPlacementDone', () => {
    it('초기에는 false', () => {
      expect(service.isPlacementDone('math')).toBe(false);
    });

    it('recordPlacementDone 호출 후 true', () => {
      service.recordPlacementDone('math', 4, 5);
      expect(service.isPlacementDone('math')).toBe(true);
    });

    it('english 초기에는 false', () => {
      expect(service.isPlacementDone('english')).toBe(false);
    });

    it('english recordPlacementDone 후 true', () => {
      service.recordPlacementDone('english', 3, 5);
      expect(service.isPlacementDone('english')).toBe(true);
    });

    it('logic 초기에는 false', () => {
      expect(service.isPlacementDone('logic')).toBe(false);
    });

    it('creativity 초기에는 false', () => {
      expect(service.isPlacementDone('creativity')).toBe(false);
    });

    it('한 분야의 진단 완료가 다른 분야에 영향 없음', () => {
      service.recordPlacementDone('math', 4, 5);
      expect(service.isPlacementDone('english')).toBe(false);
      expect(service.isPlacementDone('logic')).toBe(false);
    });

    it('영속성: 새 인스턴스에서도 true 유지', () => {
      service.recordPlacementDone('math', 4, 5);
      const service2 = new SaveService();
      expect(service2.isPlacementDone('math')).toBe(true);
    });
  });
});
