import { describe, it, expect } from 'vitest';
import {
  GAMES_CATALOG,
  getGamesBySubject,
  getDefaultGame,
  getGameById,
} from '../../../src/game-data/gamesCatalog';

describe('GAMES_CATALOG', () => {
  it('각 항목이 필수 필드를 가져야 함', () => {
    GAMES_CATALOG.forEach(game => {
      expect(game.id).toBeTruthy();
      expect(game.subjectId).toBeTruthy();
      expect(game.labelKo).toBeTruthy();
      expect(game.labelEn).toBeTruthy();
      expect(game.routeId).toBeTruthy();
      expect(typeof game.isDefault).toBe('boolean');
    });
  });

  it('각 분야(math/english/logic/creativity)에 게임이 존재해야 함', () => {
    const subjects = ['math', 'english', 'logic', 'creativity'];
    subjects.forEach(subjectId => {
      const games = GAMES_CATALOG.filter(g => g.subjectId === subjectId);
      expect(games.length).toBeGreaterThan(0);
    });
  });

  it('각 분야에 기본(isDefault=true) 게임이 정확히 1개여야 함', () => {
    const subjects = ['math', 'english', 'logic', 'creativity'];
    subjects.forEach(subjectId => {
      const defaults = GAMES_CATALOG.filter(g => g.subjectId === subjectId && g.isDefault);
      expect(defaults.length).toBe(1);
    });
  });

  it('모든 게임 id가 유일해야 함', () => {
    const ids = GAMES_CATALOG.map(g => g.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('각 항목에 icon 필드가 존재해야 함', () => {
    GAMES_CATALOG.forEach(game => {
      expect(game.icon).toBeTruthy();
    });
  });

  it('각 항목에 descriptionKo와 descriptionEn이 존재해야 함', () => {
    GAMES_CATALOG.forEach(game => {
      expect(game.descriptionKo).toBeTruthy();
      expect(game.descriptionEn).toBeTruthy();
    });
  });
});

describe('getGamesBySubject', () => {
  it('math 분야 게임들 반환', () => {
    const games = getGamesBySubject('math');
    expect(games.length).toBeGreaterThan(0);
    games.forEach(g => expect(g.subjectId).toBe('math'));
  });

  it('english 분야 게임들 반환', () => {
    const games = getGamesBySubject('english');
    expect(games.length).toBeGreaterThan(0);
    games.forEach(g => expect(g.subjectId).toBe('english'));
  });

  it('logic 분야 게임들 반환', () => {
    const games = getGamesBySubject('logic');
    expect(games.length).toBeGreaterThan(0);
    games.forEach(g => expect(g.subjectId).toBe('logic'));
  });

  it('creativity 분야 게임들 반환', () => {
    const games = getGamesBySubject('creativity');
    expect(games.length).toBeGreaterThan(0);
    games.forEach(g => expect(g.subjectId).toBe('creativity'));
  });

  it('존재하지 않는 분야는 빈 배열', () => {
    expect(getGamesBySubject('nonexistent')).toEqual([]);
  });

  it('빈 문자열은 빈 배열', () => {
    expect(getGamesBySubject('')).toEqual([]);
  });

  it('반환된 배열을 변경해도 원본 카탈로그에 영향 없음', () => {
    const originalLength = GAMES_CATALOG.filter(g => g.subjectId === 'math').length;
    const games = getGamesBySubject('math');
    games.push({ id: 'fake', subjectId: 'math', labelKo: '가짜', labelEn: 'Fake', descriptionKo: '설명', descriptionEn: 'Desc', icon: '?', routeId: 'fake-route', isDefault: false });
    expect(GAMES_CATALOG.filter(g => g.subjectId === 'math').length).toBe(originalLength);
  });
});

describe('getDefaultGame', () => {
  it('각 분야 기본 게임 반환', () => {
    ['math', 'english', 'logic', 'creativity'].forEach(subject => {
      const game = getDefaultGame(subject);
      expect(game).toBeDefined();
      expect(game?.isDefault).toBe(true);
    });
  });

  it('없는 분야 -> undefined', () => {
    expect(getDefaultGame('unknown')).toBeUndefined();
  });

  it('빈 문자열 -> undefined', () => {
    expect(getDefaultGame('')).toBeUndefined();
  });

  it('math 기본 게임은 math 분야에 속함', () => {
    const game = getDefaultGame('math');
    expect(game?.subjectId).toBe('math');
  });

  it('english 기본 게임은 english 분야에 속함', () => {
    const game = getDefaultGame('english');
    expect(game?.subjectId).toBe('english');
  });

  it('logic 기본 게임은 logic 분야에 속함', () => {
    const game = getDefaultGame('logic');
    expect(game?.subjectId).toBe('logic');
  });

  it('creativity 기본 게임은 creativity 분야에 속함', () => {
    const game = getDefaultGame('creativity');
    expect(game?.subjectId).toBe('creativity');
  });
});

describe('getGameById', () => {
  it('eq-fill 게임 찾기', () => {
    const game = getGameById('eq-fill');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('math');
  });

  it('없는 id -> undefined', () => {
    expect(getGameById('does-not-exist')).toBeUndefined();
  });

  it('빈 문자열 -> undefined', () => {
    expect(getGameById('')).toBeUndefined();
  });

  it('english-spelling 게임 찾기', () => {
    const game = getGameById('english-spelling');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('english');
    expect(game?.isDefault).toBe(true);
  });

  it('logic-sequence 게임 찾기', () => {
    const game = getGameById('logic-sequence');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('logic');
  });

  it('creativity-wall 게임 찾기', () => {
    const game = getGameById('creativity-wall');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('creativity');
  });

  it('arithmetic 게임 찾기 - math 분야이고 isDefault=false', () => {
    const game = getGameById('arithmetic');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('math');
    expect(game?.isDefault).toBe(false);
  });

  it('pat-find 게임 찾기', () => {
    const game = getGameById('pat-find');
    expect(game).toBeDefined();
    expect(game?.subjectId).toBe('math');
  });
});
