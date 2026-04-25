export type GameEvents = {
  'game:start': { levelId: string };
  'scene:startLevel': { levelId: string }; // internal: tells scene to init (bypasses intro gate)
  'game:paused': Record<string, never>;
  'game:resumed': Record<string, never>;
  'tile:selected': { col: number; row: number; value: number };
  'pair:correct': { score: number; combo: number; pairsLeft: number };
  'pair:wrong': Record<string, never>;
  'timer:tick': { remaining: number };
  'level:clear': { score: number; stars: number; timeLeft: number };
  'level:timeover': { score: number; pairsCompleted: number };
  'ui:retry': Record<string, never>;
  'ui:nextLevel': { levelId: string };
  'ui:mainMenu': Record<string, never>;
  'math:startLevel': { levelId: string };
  'math:pairCorrect': { score: number; combo: number; pairsLeft: number };
  'math:pairWrong': Record<string, never>;
  'math:orderError': Record<string, never>;
  'math:levelClear': { levelId: string; score: number; stars: number };
  'math:levelFail': { levelId: string; score: number; pairsCompleted: number };
  'math:quiz:ready': { status: import('./systems/math/UserMathStatus').UserMathStatus };
  'math:quiz:correct': { streak: number; totalCorrect: number };
  'math:quiz:wrong': { totalAttempts: number };
  'math:quiz:levelUp': { grade: number; semester: number };
  'math:quiz:operationChange': { operation: import('./systems/math/UserMathStatus').MathOperation };
  'english:levelClear': { score: number; stars: number; difficulty: string };
  'arithmetic:levelClear': { stars: number; correctCount: number; totalCount: number };
};

type EventHandler<T> = (data: T) => void;

class TypedEventBus {
  private handlers: { [K in keyof GameEvents]?: Array<EventHandler<GameEvents[K]>> } = {};

  on<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    (this.handlers[event] as Array<EventHandler<GameEvents[K]>>).push(handler);
  }

  off<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    const list = this.handlers[event] as Array<EventHandler<GameEvents[K]>> | undefined;
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const list = this.handlers[event] as Array<EventHandler<GameEvents[K]>> | undefined;
    if (!list) return;
    list.slice().forEach((h) => h(data));
  }
}

export type GameBus = TypedEventBus;
export const gameBus = new TypedEventBus();
