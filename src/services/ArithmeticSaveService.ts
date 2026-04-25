const STORAGE_KEY = 'arithmetic-progress-v1';

export interface LevelBestStars {
  easy: 0 | 1 | 2 | 3;
  normal: 0 | 1 | 2 | 3;
  hard: 0 | 1 | 2 | 3;
}

interface LevelProgress {
  unlocked: boolean;
  bestStars: LevelBestStars;
}

interface ArithmeticProgress {
  levels: Record<number, LevelProgress>;
}

const TOTAL_LEVELS = 10;

function makeInitial(): ArithmeticProgress {
  const levels: Record<number, LevelProgress> = {};
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    levels[i] = {
      unlocked: i === 1,
      bestStars: { easy: 0, normal: 0, hard: 0 },
    };
  }
  return { levels };
}

export class ArithmeticSaveService {
  private data: ArithmeticProgress;

  constructor() {
    this.data = this.load();
  }

  private load(): ArithmeticProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return makeInitial();
      const parsed = JSON.parse(raw) as ArithmeticProgress;
      // ensure all levels exist
      for (let i = 1; i <= TOTAL_LEVELS; i++) {
        if (!parsed.levels[i]) {
          parsed.levels[i] = { unlocked: i === 1, bestStars: { easy: 0, normal: 0, hard: 0 } };
        }
      }
      return parsed;
    } catch {
      return makeInitial();
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore storage errors
    }
  }

  get(): ArithmeticProgress {
    return this.data;
  }

  saveResult(levelId: number, diff: 'easy' | 'normal' | 'hard', stars: 0 | 1 | 2 | 3): void {
    const level = this.data.levels[levelId];
    if (!level) return;
    const prev = level.bestStars[diff];
    level.bestStars[diff] = Math.max(prev, stars) as 0 | 1 | 2 | 3;

    if (stars >= 1 && levelId < TOTAL_LEVELS) {
      const next = this.data.levels[levelId + 1];
      if (next) next.unlocked = true;
    }
    this.save();
  }

  isUnlocked(levelId: number): boolean {
    return this.data.levels[levelId]?.unlocked ?? false;
  }

  getBestStars(levelId: number): LevelBestStars {
    return this.data.levels[levelId]?.bestStars ?? { easy: 0, normal: 0, hard: 0 };
  }

  reset(): void {
    this.data = makeInitial();
    this.save();
  }
}

export const arithmeticSaveService = new ArithmeticSaveService();
