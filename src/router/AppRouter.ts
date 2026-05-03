import type { SubjectId } from '../game-data/subjectConfig';

export type ScreenId =
  | 'brand-home'
  | 'profile-setup'
  | 'home-b'
  | 'subject-select'
  // ── 레거시 (테스트 호환용, 런타임 미사용) ──
  | 'level-select'
  | 'game-math'
  | 'math-menu'
  | 'english-menu'
  | 'korean-menu'
  | 'level-intro'
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
  | 'game-creativity'
  | 'game-korean'
  | 'arithmetic-menu'
  | 'game-arithmetic'
  | 'game-matrix-reasoning'
  | 'game-odd-one-out'
  | 'game-sentence-order'
  | 'reasoning-menu'
  | 'game-reasoning'
  | 'admin';

export interface NavigationPayload {
  to: ScreenId;
  subject?: SubjectId;
  levelId?: string;
  highlightLevelId?: string;
  skipHistory?: boolean;
  /** replace: true — 현재 화면을 교체만 하고 히스토리 스택을 변경하지 않는다.
   *  게임 종료 후 메뉴로 돌아갈 때처럼 "게임 화면을 기록하지 않고 조용히 전환"할 때 사용. */
  replace?: boolean;
  difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
}

export interface NavigationState {
  current: ScreenId;
  previous: ScreenId | null;
  subject: SubjectId | null;
  levelId: string | null;
  highlightLevelId?: string | null;
  difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
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
    const { to, subject, levelId, highlightLevelId, skipHistory, replace, difficulty } = payload;

    this.hideScreen(this.state.current);

    if (replace) {
      // replace: true — 히스토리 스택을 건드리지 않고 현재 화면만 교체.
      // 게임 종료 후 메뉴로 돌아오는 등 "기록 없이 전환"할 때 사용.
    } else if (!skipHistory) {
      // 일반 네비게이션: 현재 화면을 히스토리 스택에 추가
      this.historyStack.push(this.state.current);
    }
    // skipHistory: true 는 현재 화면을 스택에 push하지 않는 것으로 충분.
    // 스택 top은 그대로 두어 back() 시 이전 화면으로 돌아간다.

    const stackTop = this.historyStack[this.historyStack.length - 1] ?? null;

    this.state = {
      previous: stackTop,
      current: to,
      subject: subject ?? this.state.subject,
      levelId: levelId ?? this.state.levelId,
      highlightLevelId: highlightLevelId ?? null,
      difficulty: difficulty ?? this.state.difficulty,
    };

    this.showScreen(to);
  }

  /**
   * 히스토리 스택에서 targetId와 그 이후에 쌓인 항목을 모두 제거한다.
   * 게임 완료 후 메뉴로 복귀할 때 이전 메뉴 항목이 스택에 중복으로 남는 것을 방지한다.
   * 예: showMathMenu() 호출 전에 clearHistoryAfter('math-menu')를 실행하면
   * math-menu → back() → math-menu 루프가 발생하지 않는다.
   */
  clearHistoryAfter(targetId: ScreenId): void {
    const idx = this.historyStack.lastIndexOf(targetId);
    if (idx !== -1) {
      this.historyStack.splice(idx);
    }
  }

  back(): void {
    if (this.historyStack.length === 0) {
      // home-b가 등록되ていれば home-b로, 없으면 brand-home으로 폴백
      const fallback: ScreenId = this.screens['home-b'] ? 'home-b' : 'brand-home';
      this.navigate({ to: fallback, replace: true });
      return;
    }
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
