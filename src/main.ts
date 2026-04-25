import '@/style.css';
import { gameBus } from './game-bus';
import { confirmExit } from './utils/confirmExit';
import { LevelIntro } from './components/LevelIntro';
import { HUD } from './components/HUD';
import { ResultScreen } from './components/ResultScreen';
import { BrandHome } from './components/BrandHome';
import { SubjectSelect } from './components/SubjectSelect';
import { MathMenu } from './components/MathMenu';
import { KoreanMenu } from './components/KoreanMenu';
import { EnglishMenu } from './components/EnglishMenu';
import { LevelTestMath } from './components/LevelTestMath';
import { LevelTestEnglish } from './components/LevelTestEnglish';
import { WatermelonGame } from './components/games/WatermelonGame';
import { MathGame } from './components/games/MathGame';
import { MathQuizGame } from './components/games/MathQuizGame';
import { EquationFillGame } from './components/games/EquationFillGame';
import { PatternFinderGame } from './components/games/PatternFinderGame';
import { LogicMenu } from './components/LogicMenu';
import { CreativityMenu } from './components/CreativityMenu';
import { LogicGame } from './components/games/LogicGame';
import { CreativityGame } from './components/games/CreativityGame';
import { EnglishGame } from './components/games/EnglishGame';
import { KoreanGame } from './components/games/KoreanGame';
import { ArithmeticGame } from './components/games/ArithmeticGame';
import { ArithmeticMenu } from './components/ArithmeticMenu';
import { appRouter } from './router/AppRouter';
import { G1_LEVELS } from './game-data/g1Levels';
import { getEqFillLevel } from './game-data/equationFillLevels';
import { getPatternLevel } from './game-data/patternFinderLevels';
import { getLogicLevel } from './game-data/logicLevels';
import { selectWallPuzzle } from './systems/creativity/wallPuzzleSelector';
import { saveService, userMathStatusService } from './services/SaveService';

// ── 1. DOM 루트 ─────────────────────────────────────────────────────────────
const app = document.getElementById('app') as HTMLElement;

// ── 2. 게임 캔버스 컨테이너 (WatermelonGame / MathGame용) ──────────────────
const g1Container = document.createElement('div');
g1Container.id = 'g1-container';
g1Container.style.cssText = `
  position: fixed; inset: 0;
  display: none; flex-direction: column;
  background: linear-gradient(160deg, #166534 0%, #16A34A 60%, #4ADE80 100%);
  z-index: 10;
`;
app.appendChild(g1Container);

const mathContainer = document.createElement('div');
mathContainer.id = 'math-container';
mathContainer.style.cssText = `
  position: fixed; inset: 0;
  display: none; flex-direction: column;
  background: linear-gradient(160deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%);
  z-index: 10;
`;
app.appendChild(mathContainer);

const mathQuizContainer = document.createElement('div');
mathQuizContainer.id = 'math-quiz-container';
app.appendChild(mathQuizContainer);

const eqFillContainer = document.createElement('div');
eqFillContainer.id = 'eq-fill-container';
app.appendChild(eqFillContainer);

const patternFinderContainer = document.createElement('div');
patternFinderContainer.id = 'pattern-finder-container';
app.appendChild(patternFinderContainer);

const logicContainer = document.createElement('div');
logicContainer.id = 'logic-container';
app.appendChild(logicContainer);

const creativityContainer = document.createElement('div');
creativityContainer.id = 'creativity-container';
app.appendChild(creativityContainer);

const englishContainer = document.createElement('div');
englishContainer.id = 'english-container';
app.appendChild(englishContainer);

const koreanContainer = document.createElement('div');
koreanContainer.id = 'korean-game-container';
app.appendChild(koreanContainer);


// ── 3. 게임 컴포넌트 ─────────────────────────────────────────────────────────
const watermelonGame = new WatermelonGame(g1Container);
const mathGame = new MathGame(mathContainer);
const mathQuizGame = new MathQuizGame(mathQuizContainer);
const equationFillGame = new EquationFillGame(eqFillContainer);
const patternFinderGame = new PatternFinderGame(patternFinderContainer);
const logicGame = new LogicGame(logicContainer);
const creativityGame = new CreativityGame(creativityContainer);
const englishGame = new EnglishGame(englishContainer);
const koreanGame = new KoreanGame(koreanContainer);
const arithmeticGame = new ArithmeticGame(app);

// ── 4. UI 레이어 컴포넌트 ────────────────────────────────────────────────────
const brandHome      = new BrandHome(app, appRouter);
const subjectSelect  = new SubjectSelect(app, appRouter);
const mathMenu       = new MathMenu(app, appRouter, saveService);
const koreanMenu     = new KoreanMenu(app, appRouter);
const englishMenu    = new EnglishMenu(app, appRouter, saveService);
const logicMenu = new LogicMenu(app, appRouter, saveService);
const creativityMenu = new CreativityMenu(app, appRouter, saveService);
const arithmeticMenu = new ArithmeticMenu(app, appRouter);
const levelTestMath  = new LevelTestMath(app);
const levelTestEnglish = new LevelTestEnglish(app, appRouter, saveService);
const levelIntro    = new LevelIntro(app, gameBus);
const hud           = new HUD(app);
const resultScreen  = new ResultScreen(app, gameBus);

// ── 5. 라우터 등록 ────────────────────────────────────────────────────────────
appRouter.register('brand-home',         brandHome);
appRouter.register('subject-select',     subjectSelect);
appRouter.register('math-menu',          mathMenu);
appRouter.register('korean-menu',        koreanMenu);
appRouter.register('english-menu',       englishMenu);
appRouter.register('logic-menu',         logicMenu);
appRouter.register('creativity-menu',    creativityMenu);
appRouter.register('level-test-math',    levelTestMath);
appRouter.register('level-test-english', levelTestEnglish);
appRouter.register('arithmetic-menu',    arithmeticMenu);
appRouter.register('game-arithmetic', {
  show() {
    const state = appRouter.getState();
    const lvId = parseInt((state.levelId ?? '1').replace('arithmetic-', ''), 10);
    const diff = currentDifficulty;
    arithmeticGame.setBackHandler(() => {
      arithmeticGame.hide();
      appRouter.navigate({ to: 'arithmetic-menu', subject: 'math', replace: true });
    });
    arithmeticGame.startLevel(lvId, diff);
  },
  hide() {
    arithmeticGame.hide();
  },
});
appRouter.register('math-quiz-game', {
  show() { mathQuizGame.show(); },
  hide() { mathQuizGame.hide(); },
});

// ── 6. 상태 ──────────────────────────────────────────────────────────────────
const unlockedLevels = new Set<number>([1]);
let currentLevelId: string = '';
let currentDifficulty: 'easy' | 'normal' | 'hard' = 'easy';
let currentScore = 0;
let currentPairsLeft = 10;
let currentTimeRemaining = 60;
let mathGameActive = false; // game-math show() 재진입 방지용

function showMathMenu(): void {
  hud.hide();
  resultScreen.hide();
  levelIntro.hide();
  watermelonGame.hide();
  mathGame.hide();
  // back()으로 히스토리 스택의 'math-menu'를 정상 pop하여 복귀.
  // navigate({ replace/skipHistory })를 쓰면 스택에 'math-menu'가 잔류해
  // math-menu → back() → math-menu 루프 버그가 발생한다.
  appRouter.back();
}

function launchG1Level(levelId: number): void {
  const level = G1_LEVELS.find((l) => l.levelId === levelId) ?? G1_LEVELS[0];
  currentLevelId = String(levelId);
  currentPairsLeft = level.targetPairs;
  currentScore = 0;
  currentTimeRemaining = level.timeLimit;

  mathGame.hide();
  mathContainer.style.display = "none";
  g1Container.style.display = "flex";
  watermelonGame.show();

  hud.show(levelId, () => {
    watermelonGame.pause();
    confirmExit(
      () => {
        watermelonGame.hide();
        g1Container.style.display = 'none';
        hud.hide();
        appRouter.back();
      },
      () => {
        watermelonGame.resume();
      }
    );
  });
  hud.update(level.timeLimit, 0, level.targetPairs);
  watermelonGame.startLevel(level);
}

function launchMathLevel(levelId: string): void {
  currentLevelId = levelId;
  mathGameActive = true;

  watermelonGame.hide();
  g1Container.style.display = "none";
  mathContainer.style.display = "flex";
  mathGame.show();

  // HUD를 레벨 0으로 표시 (math는 레벨 인덱스 별도 관리)
  hud.show(0, () => {
    // HUD 종료 버튼 → math-menu로 복귀
    mathGameActive = false;
    mathGame.hide();
    mathContainer.style.display = 'none';
    hud.hide();
    appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
  });
  hud.update(0, 0, 0);

  saveService.recordMathPlay(levelId);
  mathGame.startLevel(levelId);
}

// ── 7. level-intro 화면 ───────────────────────────────────────────────────────
let introFired = false;

appRouter.register('level-intro', {
  show() {
    const state = appRouter.getState();
    const mathLevelId = state.levelId ?? '';

    if (mathLevelId.startsWith('arithmetic-')) {
      currentLevelId = mathLevelId;
      currentDifficulty = (state.difficulty ?? 'easy') as 'easy' | 'normal' | 'hard';
      appRouter.navigate({ to: 'game-arithmetic', replace: true });
      return;
    }

    const g1Match = mathLevelId.match(/^math-add-single-(\d+)$/);
    if (g1Match) {
      const g1Id = parseInt(g1Match[1], 10);
      if (g1Id >= 1 && g1Id <= G1_LEVELS.length) {
        introFired = true;
        levelIntro.show(g1Id);
        return;
      }
    }

    if (mathLevelId.startsWith('math-')) {
      currentLevelId = mathLevelId;
      hud.hide();
      appRouter.navigate({ to: 'game-math', replace: true });
      return;
    }

    introFired = true;
    levelIntro.show(1);
  },
  hide() {
    levelIntro.hide();
    // G1 수박 게임은 라우터를 거치지 않고 직접 시작되므로,
    // back() 또는 navigate로 level-intro를 벗어날 때 함께 정리한다.
    hud.hide();
    watermelonGame.hide();
    g1Container.style.display = "none";
    mathGameActive = false;
  },
});

// ── 8. game-math 화면 ─────────────────────────────────────────────────────────
appRouter.register('game-math', {
  show() {
    const mathLevelId = currentLevelId;
    if (!mathLevelId || !mathLevelId.startsWith('math-')) {
      appRouter.navigate({ to: 'math-menu', subject: 'math', replace: true });
      return;
    }
    if (mathGameActive) return; // 이미 게임 진행 중이면 재시작 방지
    launchMathLevel(mathLevelId);
  },
  hide() {
    mathGame.hide();
    mathContainer.style.display = "none";
    mathGameActive = false;
    hud.hide(); // 게임 중 홈버튼 클릭 시 HUD가 math-menu 위에 잔류하는 버그 수정
  },
});

// ── 8-b. game-english 화면 ─────────────────────────────────────────────────
appRouter.register('game-english', {
  show() {
    const state = appRouter.getState();
    const difficulty = (state.levelId ?? 'beginner') as string;
    englishGame.show(difficulty);
  },
  hide() {
    englishGame.hide();
    hud.hide();
  },
});

// ── 8-b2. game-korean 화면 ────────────────────────────────────────────────────
appRouter.register('game-korean', {
  show() { koreanGame.show(); },
  hide() { koreanGame.hide(); },
});

// ── 8-c. game-math-quiz 화면 ─────────────────────────────────────────────────
appRouter.register('game-math-quiz', {
  show() {
    mathQuizGame.show();
  },
  hide() {
    mathQuizGame.hide();
  },
});

// ── 8-d. game-eq-fill 화면 (등식 완성 게임) ───────────────────────────────────
appRouter.register('game-eq-fill', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'eq-fill-1';
    const cfg     = getEqFillLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'math-menu', subject: 'math' });
      return;
    }
    equationFillGame.show(cfg);
  },
  hide() {
    equationFillGame.hide();
  },
});

// ── 8-f. game-logic 화면 ─────────────────────────────────────────────────────
appRouter.register('game-logic', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'logic-1';
    const cfg     = getLogicLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'logic-menu', subject: 'logic' });
      return;
    }
    logicGame.show(cfg);
  },
  hide() {
    logicGame.hide();
  },
});

// ── 8-g. game-creativity 화면 ────────────────────────────────────────────────
// 레벨 선택 없음 — 플레이어의 누적 클리어 수에 따라 난이도를 자동 생성한다.
appRouter.register('game-creativity', {
  show() {
    const meta = saveService.getCreativityMeta();
    const cfg  = selectWallPuzzle(meta.totalClears, meta.recentPuzzleIds ?? []);
    saveService.addRecentCreativityPuzzleId(cfg.id);
    creativityGame.show(cfg);
  },
  hide() {
    creativityGame.hide();
  },
});

// ── 8-e. game-pattern-finder 화면 (규칙 찾기 게임) ────────────────────────
appRouter.register('game-pattern-finder', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'pat-find-1';
    const cfg     = getPatternLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'math-menu', subject: 'math' });
      return;
    }
    patternFinderGame.show(cfg);
  },
  hide() {
    patternFinderGame.hide();
  },
});

// ── 9. G1 게임 시작 (카운트다운 완료 후) ─────────────────────────────────────
gameBus.on('game:start', ({ levelId }) => {
  if (introFired) {
    introFired = false;
    launchG1Level(parseInt(levelId, 10));
    return;
  }
  introFired = true;
  levelIntro.show(parseInt(levelId, 10));
});

// ── 10. Gameplay 이벤트 (G1 공통) ────────────────────────────────────────────
gameBus.on('timer:tick', ({ remaining }) => {
  currentTimeRemaining = remaining;
  hud.update(remaining, currentScore, currentPairsLeft);
});

gameBus.on('pair:correct', ({ score, combo, pairsLeft }) => {
  currentScore = score;
  currentPairsLeft = pairsLeft;
  hud.update(currentTimeRemaining, score, pairsLeft, combo);
});

gameBus.on('pair:wrong', () => {
  hud.update(currentTimeRemaining, currentScore, currentPairsLeft, 0);
});

gameBus.on('level:clear', ({ score, stars }) => {
  hud.hide();
  watermelonGame.hide();
  g1Container.style.display = "none";
  const numId = parseInt(currentLevelId, 10);
  if (numId < G1_LEVELS.length) {
    unlockedLevels.add(numId + 1);
  }
  resultScreen.show({
    cleared: true,
    score,
    stars,
    levelId: numId,
    maxLevelId: G1_LEVELS.length,
  });
});

gameBus.on('level:timeover', ({ score, pairsCompleted }) => {
  hud.hide();
  watermelonGame.hide();
  g1Container.style.display = "none";
  resultScreen.show({
    cleared: false,
    score,
    stars: 0,
    levelId: parseInt(currentLevelId, 10),
    pairsCompleted,
    maxLevelId: G1_LEVELS.length,
  });
});

// ── 11. MathGame 이벤트 ────────────────────────────────────────────────────────
gameBus.on('math:pairCorrect', ({ score, combo, pairsLeft }) => {
  currentScore = score;
  currentPairsLeft = pairsLeft;
  hud.update(currentTimeRemaining, score, pairsLeft, combo);
});

gameBus.on('math:pairWrong', () => {
  hud.update(currentTimeRemaining, currentScore, currentPairsLeft, 0);
});

gameBus.on('math:levelClear', ({ levelId, score, stars }) => {
  mathGameActive = false;
  hud.hide();
  mathGame.hide();
  mathContainer.style.display = "none";
  saveService.recordMathClear(levelId, stars, score);
  resultScreen.show({
    cleared: true,
    score,
    stars,
    levelId: 0,
    maxLevelId: 0,
  });
});

gameBus.on('math:levelFail', ({ score, pairsCompleted, levelId: _failLevelId }) => {
  mathGameActive = false;
  hud.hide();
  mathGame.hide();
  mathContainer.style.display = "none";
  resultScreen.show({
    cleared: false,
    score,
    stars: 0,
    levelId: 0,
    pairsCompleted,
    maxLevelId: 0,
  });
});

// ── 11-c. EnglishGame 이벤트 ─────────────────────────────────────────────────
gameBus.on('english:levelClear', ({ score, stars }) => {
  resultScreen.show({
    cleared: true,
    score,
    stars,
    levelId: 0,
    maxLevelId: 0,
  });
});

// ── 11-d. ArithmeticGame 이벤트 ──────────────────────────────────────────────
gameBus.on('arithmetic:levelClear', ({ stars, correctCount, totalCount }) => {
  arithmeticGame.hide();
  resultScreen.show({
    cleared: stars > 0,
    score: correctCount * 100,
    stars,
    levelId: 0,
    maxLevelId: 0,
    accuracy: Math.round((correctCount / totalCount) * 100),
  });
});

// ── 11-b. MathQuizGame 이벤트 ─────────────────────────────────────────────────
gameBus.on('math:quiz:ready', ({ status }) => {
  userMathStatusService.update(status);
  appRouter.navigate({ to: 'game-math-quiz', subject: 'math' });
});

gameBus.on('math:quiz:correct', ({ streak: _streak, totalCorrect: _totalCorrect }) => {
  // HUD 등 필요 시 연동
});

gameBus.on('math:quiz:levelUp', ({ grade: _grade, semester: _semester }) => {
  // 학기/학년 전환 시 상태 자동 저장은 MathQuizGame 내부에서 처리
});

// ── 12. UI 이벤트 ─────────────────────────────────────────────────────────────
gameBus.on('ui:retry', () => {
  resultScreen.hide();
  if (currentLevelId.startsWith('arithmetic-')) {
    appRouter.navigate({ to: 'game-arithmetic', replace: true });
  } else if (currentLevelId.startsWith('math-') && !currentLevelId.match(/^math-add-single-\d+$/)) {
    appRouter.navigate({ to: 'game-math', replace: true });
  } else {
    launchG1Level(parseInt(currentLevelId, 10));
  }
});

gameBus.on('ui:nextLevel', ({ levelId }) => {
  resultScreen.hide();
  introFired = true;
  levelIntro.show(parseInt(levelId, 10));
});

gameBus.on('ui:mainMenu', () => {
  if (currentLevelId.startsWith('arithmetic-')) {
    resultScreen.hide();
    appRouter.navigate({ to: 'arithmetic-menu', subject: 'math', replace: true });
  } else {
    showMathMenu();
  }
});

// ── 13. 초기 화면 ─────────────────────────────────────────────────────────────
// replace: true — 앱 최초 진입이므로 brand-home을 히스토리 스택에 push하지 않는다.
appRouter.navigate({ to: 'brand-home', replace: true });

// ── 14. 브라우저/Android 뒤로가기 버튼 처리 ───────────────────────────────────
// 초기 synthetic 히스토리 항목 추가 — popstate 트리거를 위한 앵커
window.history.pushState({}, '', '/');

// 게임 진행 중으로 간주할 화면 ID 집합 (뒤로가기 시 confirmExit 표시)
const GAME_SCREENS = new Set([
  'game-math', 'game-english', 'game-korean',
  'game-math-quiz', 'math-quiz-game',
  'game-eq-fill', 'game-pattern-finder',
  'game-logic', 'game-creativity',
  'game-arithmetic',
  'level-intro', // 수박 게임 카운트다운 포함
]);

window.addEventListener('popstate', () => {
  const current = appRouter.getState().current;

  // brand-home: 뒤로가기를 허용 → synthetic 항목을 재push하지 않으면
  // WebView에 남은 히스토리가 없어져 다음 뒤로가기에서 앱이 종료됨
  if (current === 'brand-home') {
    return;
  }

  // 다음 뒤로가기도 잡을 수 있도록 synthetic 항목 재push
  window.history.pushState({}, '', '/');

  // confirmExit 모달이 이미 열려 있으면 중복 방지
  if (document.getElementById('confirm-exit-overlay')) {
    return;
  }

  // 게임 화면이면 먼저 종료 확인 모달 표시
  if (GAME_SCREENS.has(current)) {
    confirmExit(() => {
      appRouter.back();
    });
    return;
  }

  // 그 외 화면은 즉시 뒤로가기
  appRouter.back();
});
