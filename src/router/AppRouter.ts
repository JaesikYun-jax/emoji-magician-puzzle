import type { SubjectId } from '../game-data/subjectConfig';

export type ScreenId =
  | 'brand-home'
  | 'subject-select'
  | 'math-menu'
  | 'english-menu'
  | 'korean-menu'
  | 'level-select'
  | 'level-intro'
  | 'game-math'
  | 'game-english'
  | 'result'
  | 'level-test-math'
  | 'level-test-english'
  | 'game-math-quiz'
  | 'math-quiz-game'
  | 'game-eq-fill'
  | 'game-pattern-finder'
  | 'logic-menu'
  | 'creativity-menu'
  | 'game-logic'
  | 'game-creativity';

export interface NavigationPayload {
  to: ScreenId;
  subject?: SubjectId;
  levelId?: string;
  highlightLevelId?: string;
  skipHistory?: boolean;
  /** replace: true — 현재 화면을 교체만 하고 히스토리 스택을 변경하지 않는다.
   *  게임 종료 후 메뉴로 돌아갈 때처럼 "게임 화면을 기록하지 않고 조용히 전환"할 때 사용. */
  replace?: boolean;
}

export interface NavigationState {
  current: ScreenId;
  previous: ScreenId | null;
  subject: SubjectId | null;
  levelId: string | null;
  highlightLevelId?: string | null;
}

type ShowHideable = { show(...args: unknown[]): void; hide(): void };

export class AppRouter {
  private state: NavigationState = {
    current: 'brand-home',
    previous: null,
    subject: null,
    levelId: null,
    highlightLevelId: null,
  };

  /** 뒤로가기를 위한 히스토리 스택. skipHistory: true 네비게이션은 push하지 않는다. */
  private historyStack: ScreenId[] = [];

  private screens: Partial<Record<ScreenId, ShowHideable>> = {};

  register(id: ScreenId, component: ShowHideable): void {
    this.screens[id] = component;
  }

  getState(): Readonly<NavigationState> {
    return this.state;
  }

  navigate(payload: NavigationPayload): void {
    const { to, subject, levelId, highlightLevelId, skipHistory, replace } = payload;

    this.hideScreen(this.state.current);

    if (replace) {
      // replace: true — 히스토리 스택을 건드리지 않고 현재 화면만 교체.
      // 게임 종료 후 메뉴로 돌아오는 등 "기록 없이 전환"할 때 사용.
    } else if (!skipHistory) {
      // 일반 네비게이션: 현재 화면을 히스토리 스택에 추가
      this.historyStack.push(this.state.current);
    } else {
      // skipHistory: true 이면 현재 화면을 스택에 추가하지 않고,
      // 스택 top(게임 진입 직전에 push된 항목)도 제거한다.
      // 결과: back() 호출 시 게임 화면 이전 화면으로 올바르게 돌아간다.
      this.historyStack.pop();
    }

    const stackTop = this.historyStack[this.historyStack.length - 1] ?? null;

    this.state = {
      previous: stackTop,
      current: to,
      subject: subject ?? this.state.subject,
      levelId: levelId ?? this.state.levelId,
      highlightLevelId: highlightLevelId ?? null,
    };

    this.showScreen(to);
  }

  back(): void {
    if (this.historyStack.length === 0) return;
    const target = this.historyStack.pop()!;

    this.hideScreen(this.state.current);

    const newPrevious = this.historyStack[this.historyStack.length - 1] ?? null;

    this.state = {
      ...this.state,
      current: target,
      previous: newPrevious,
      highlightLevelId: null,
    };

    this.showScreen(target);
  }

  showScreen(id: ScreenId): void {
    const screen = this.screens[id];
    if (screen) screen.show();
  }

  hideScreen(id: ScreenId): void {
    const screen = this.screens[id];
    if (screen) screen.hide();
  }

  hideAll(): void {
    for (const id of Object.keys(this.screens) as ScreenId[]) {
      this.hideScreen(id);
    }
  }
}

export const appRouter = new AppRouter();
