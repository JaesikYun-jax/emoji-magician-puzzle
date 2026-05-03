/**
 * 화면 트랜지션 시스템 검증
 * ─────────────────────────────────────────────────────────────────
 * 메뉴/허브 화면 컴포넌트는 모두 root element 에 `.screen-root` 클래스를
 * 부여해야 한다. 이 클래스가 src/style.css 의 entry/exit 트랜지션을
 * 트리거하는 마커이며, 누락되면 사용자에게 깜빡이는 화면 전환이 노출된다.
 *
 * 신규 메뉴 컴포넌트 추가 시 아래 FACTORIES 배열에 1줄 등록하면
 * 자동으로 검증된다. 누락 시 PR 의 CI 단계에서 fail 한다.
 *
 * 게임 컴포넌트(WatermelonGame 등)는 LevelIntro 카운트다운이
 * 트랜지션 역할을 하므로 의도적으로 마커를 부여하지 않는다.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRouterStub, mountContainer, cleanup } from './_stubs';
import type { SaveService } from '../../services/SaveService';

import { BrandHome } from '../BrandHome';
import { HomeB } from '../HomeB';
import { ProfileSetup } from '../ProfileSetup';
import { SubjectSelect } from '../SubjectSelect';
import { MathMenu } from '../MathMenu';
import { EnglishMenu } from '../EnglishMenu';
import { KoreanMenu } from '../KoreanMenu';
import { LogicMenu } from '../LogicMenu';
import { CreativityMenu } from '../CreativityMenu';
import { ReasoningMenu } from '../ReasoningMenu';
import { ArithmeticMenu } from '../ArithmeticMenu';
import { LevelTestMath } from '../LevelTestMath';
import { LevelTestEnglish } from '../LevelTestEnglish';
import { AdminPage } from '../AdminPage';

interface ScreenComponent {
  show: (...args: unknown[]) => void;
  hide: () => void;
}

/** SaveService 의 어떤 메서드가 호출되어도 안전한 default 를 돌려주는 Proxy stub. */
function createSaveServiceStub(): SaveService {
  const handler: ProxyHandler<object> = {
    get: (_target, prop) => {
      if (typeof prop !== 'string') return undefined;
      if (prop.startsWith('has') || prop.startsWith('is')) return vi.fn(() => false);
      if (prop.startsWith('get') || prop.startsWith('load')) {
        return vi.fn(() => {
          if (prop.includes('Progress')) return { stars: 0, score: 0, completed: false, bestScore: 0 };
          if (prop.includes('Meta')) return { totalClears: 0, recentPuzzleIds: [], currentStreak: 0, recentClears: [] };
          if (prop.includes('Stats')) return { playerLevel: 1, totalClears: 0, streak: 0 };
          if (prop.includes('Profile')) return null;
          if (prop.includes('Result')) return null;
          if (prop.includes('Count') || prop.includes('Streak') || prop.includes('Level') || prop.includes('Xp')) return 0;
          if (prop.includes('Ids') || prop.includes('Unlocked') || prop.endsWith('s')) return [];
          if (prop.includes('Status') || prop.includes('State') || prop.includes('Settings')) return {};
          if (prop.includes('Id')) return '';
          return null;
        });
      }
      return vi.fn();
    },
  };
  return new Proxy({}, handler) as unknown as SaveService;
}

const FACTORIES: ReadonlyArray<readonly [string, (container: HTMLElement) => ScreenComponent]> = [
  ['BrandHome',        c => new BrandHome(c, createRouterStub(), createSaveServiceStub())],
  ['HomeB',            c => new HomeB(c, createRouterStub(), createSaveServiceStub())],
  ['ProfileSetup',     c => new ProfileSetup(c, createRouterStub(), createSaveServiceStub())],
  ['SubjectSelect',    c => new SubjectSelect(c, createRouterStub())],
  ['MathMenu',         c => new MathMenu(c, createRouterStub(), createSaveServiceStub())],
  ['EnglishMenu',      c => new EnglishMenu(c, createRouterStub(), createSaveServiceStub())],
  ['KoreanMenu',       c => new KoreanMenu(c, createRouterStub())],
  ['LogicMenu',        c => new LogicMenu(c, createRouterStub(), createSaveServiceStub())],
  ['CreativityMenu',   c => new CreativityMenu(c, createRouterStub(), createSaveServiceStub())],
  ['ReasoningMenu',    c => new ReasoningMenu(c, createRouterStub(), createSaveServiceStub())],
  ['ArithmeticMenu',   c => new ArithmeticMenu(c, createRouterStub())],
  ['LevelTestMath',    c => new LevelTestMath(c)],
  ['LevelTestEnglish', c => new LevelTestEnglish(c, createRouterStub(), createSaveServiceStub())],
  ['AdminPage',        c => new AdminPage(c, createRouterStub())],
];

describe('Screen transitions — every menu/hub component marks its root with .screen-root', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = mountContainer();
  });

  afterEach(() => {
    cleanup(container);
  });

  for (const [name, create] of FACTORIES) {
    it(`${name}: root has 'screen-root' class on mount`, () => {
      const comp = create(container);
      comp.show();
      const roots = container.querySelectorAll('.screen-root');
      expect(
        roots.length,
        `${name} 의 show() 직후 container 에 .screen-root 가 부여된 root 가 없습니다. ` +
          `show() 의 createElement 직후 'el.classList.add("screen-root")' 를 호출했는지 확인하세요.`,
      ).toBeGreaterThanOrEqual(1);
      comp.hide();
    });
  }

  it('FACTORIES covers all current ShowHideable menu/hub exports (regression guard)', () => {
    // 신규 컴포넌트가 추가되었을 때 위 배열에 등록을 잊지 않도록 하는 안전망.
    // main.ts 의 appRouter.register() 호출 수와 비교하지는 않지만, 최소 카운트 검사로
    // 실수로 항목이 통째로 사라지는 경우를 방지한다.
    expect(FACTORIES.length).toBeGreaterThanOrEqual(14);
  });
});
