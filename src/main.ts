import '@/style.css';
import { gameBus } from './game-bus';
import { confirmExit } from './utils/confirmExit';
import { LevelIntro } from './components/LevelIntro';
import { HUD } from './components/HUD';
import { ResultScreen } from './components/ResultScreen';
import { BrandHome } from './components/BrandHome';
import { ProfileSetup } from './components/ProfileSetup';
import { HomeB } from './components/HomeB';
import { SubjectSelect } from './components/SubjectSelect';
import { MathMenu } from './components/MathMenu';
import { KoreanMenu } from './components/KoreanMenu';
import { EnglishMenu } from './components/EnglishMenu';
import { LevelTestMath } from './components/LevelTestMath';
import { LevelTestEnglish } from './components/LevelTestEnglish';
import { WatermelonGame } from './components/games/WatermelonGame';
import { MathQuizGame } from './components/games/MathQuizGame';
import { EquationFillGame } from './components/games/EquationFillGame';
import { PatternFinderGame } from './components/games/PatternFinderGame';
import { LogicMenu } from './components/LogicMenu';
import { CreativityMenu } from './components/CreativityMenu';
import { ReasoningMenu } from './components/ReasoningMenu';
import { ReasoningGame } from './components/games/ReasoningGame';
import { LogicGame } from './components/games/LogicGame';
import { CreativityGame } from './components/games/CreativityGame';
import { EnglishGame } from './components/games/EnglishGame';
import { KoreanGame } from './components/games/KoreanGame';
import { ArithmeticGame } from './components/games/ArithmeticGame';
import { ArithmeticMenu } from './components/ArithmeticMenu';
import { MatrixReasoningGame } from './components/games/MatrixReasoningGame';
import { OddOneOutGame } from './components/games/OddOneOutGame';
import { SentenceOrderingGame } from './components/games/SentenceOrderingGame';
import { AdminPage } from './components/AdminPage';
import { getMatrixLevel, getFirstMatrixLevelId } from './game-data/matrixReasoningLevels';
import { getOddOneOutLevel, getFirstOddLevelId } from './game-data/oddOneOutLevels';
import { appRouter } from './router/AppRouter';
import { G1_LEVELS } from './game-data/g1Levels';
import { getEqFillLevel } from './game-data/equationFillLevels';
import { getPatternLevel } from './game-data/patternFinderLevels';
import { getLogicLevel } from './game-data/logicLevels';
import { selectWallPuzzle } from './systems/creativity/wallPuzzleSelector';
import { saveService, userMathStatusService } from './services/SaveService';

// ── 1. DOM 루트 ─────────────────────────────────────────────────────────────
const app = document.getElementById('app') as HTMLElement;

// ── 2. 게임 캔버스 컨테이너 (WatermelonGame용) ──────────────────────────────
const g1Container = document.createElement('div');
g1Container.id = 'g1-container';
g1Container.style.cssText = `
  position: fixed; inset: 0;
  display: none; flex-direction: column;
  background: linear-gradient(160deg, #166534 0%, #16A34A 60%, #4ADE80 100%);
  z-index: 10;
`;
app.appendChild(g1Container);

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

const matrixContainer = document.createElement('div');
matrixContainer.id = 'matrix-reasoning-container';
app.appendChild(matrixContainer);

const oddOneOutContainer = document.createElement('div');
oddOneOutContainer.id = 'odd-one-out-container';
app.appendChild(oddOneOutContainer);

const creativityContainer = document.createElement('div');
creativityContainer.id = 'creativity-container';
app.appendChild(creativityContainer);

const reasoningContainer = document.createElement('div');
reasoningContainer.id = 'reasoning-container';
app.appendChild(reasoningContainer);

const englishContainer = document.createElement('div');
englishContainer.id = 'english-container';
app.appendChild(englishContainer);

const koreanContainer = document.createElement('div');
koreanContainer.id = 'korean-game-container';
app.appendChild(koreanContainer);

const sentenceOrderContainer = document.createElement('div');
sentenceOrderContainer.id = 'sentence-order-container';
app.appendChild(sentenceOrderContainer);


// ── 3. 게임 컴포넌트 ─────────────────────────────────────────────────────────
const watermelonGame = new WatermelonGame(g1Container);
const mathQuizGame = new MathQuizGame(mathQuizContainer);
const equationFillGame = new EquationFillGame(eqFillContainer);
const patternFinderGame = new PatternFinderGame(patternFinderContainer);
const logicGame = new LogicGame(logicContainer);
const matrixGame = new MatrixReasoningGame(matrixContainer);
const oddOneOutGame = new OddOneOutGame(oddOneOutContainer);
const creativityGame = new CreativityGame(creativityContainer);
const reasoningGame = new ReasoningGame(reasoningContainer, appRouter, saveService);
const englishGame = new EnglishGame(englishContainer);
const koreanGame = new KoreanGame(koreanContainer);
const arithmeticGame = new ArithmeticGame(app);
const sentenceOrderingGame = new SentenceOrderingGame(sentenceOrderContainer);

// ── 4. UI 레이어 컴포넌트 ────────────────────────────────────────────────────
const brandHome      = new BrandHome(app, appRouter, saveService);
const profileSetup   = new ProfileSetup(app, appRouter, saveService);
const homeB          = new HomeB(app, appRouter, saveService);
const subjectSelect  = new SubjectSelect(app, appRouter);
const mathMenu       = new MathMenu(app, appRouter, saveService);
const koreanMenu     = new KoreanMenu(app, appRouter);
const englishMenu    = new EnglishMenu(app, appRouter, saveService);
const logicMenu = new LogicMenu(app, appRouter, saveService);
const creativityMenu = new CreativityMenu(app, appRouter, saveService);
const reasoningMenu = new ReasoningMenu(app, appRouter, saveService);
const arithmeticMenu = new ArithmeticMenu(app, appRouter);
const levelTestMath  = new LevelTestMath(app);
const levelTestEnglish = new LevelTestEnglish(app, appRouter, saveService);
const levelIntro    = new LevelIntro(app, gameBus);
const hud           = new HUD(app);
const resultScreen  = new ResultScreen(app, gameBus);
const adminPage     = new AdminPage(app, appRouter);

// ── 5. 라우터 등록 ────────────────────────────────────────────────────────────
appRouter.register('brand-home',         brandHome);
appRouter.register('profile-setup',      profileSetup);
appRouter.register('home-b',             homeB);
appRouter.register('subject-select',     subjectSelect);
appRouter.register('math-menu',          mathMenu);
appRouter.register('korean-menu',        koreanMenu);
appRouter.register('english-menu',       englishMenu);
appRouter.register('logic-menu',         logicMenu);
appRouter.register('creativity-menu',    creativityMenu);
appRouter.register('reasoning-menu', reasoningMenu);
appRouter.register('admin', adminPage);
appRouter.register('game-reasoning', {
  show() { reasoningGame.show(); },
  hide() { reasoningGame.hide(); },
});
// 진단은 PlacementTest로 이전됨, 레거시 호환용
appRouter.register('level-test-math',    levelTestMath);
// 진단은 PlacementTest로 이전됨, 레거시 호환용
appRouter.register('level-test-english', levelTestEnglish);
appRouter.register('arithmetic-menu',    arithmeticMenu);
appRouter.register('game-arithmetic', {
  show() {
    const state = appRouter.getState();
    const lvId = parseInt((state.levelId ?? '1').replace('arithmetic-', ''), 10);
    // state.difficulty가 있으면 우선 적용 (MathMenu 설정 버튼에서 직접 진입 시)
    if (state.difficulty) {
      currentDifficulty = state.difficulty as 'easy' | 'normal' | 'hard';
    }
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

function showMathMenu(): void {
  hud.hide();
  resultScreen.hide();
  levelIntro.hide();
  watermelonGame.hide();
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

// ── 8-h. game-matrix-reasoning 화면 ──────────────────────────────────────────
appRouter.register('game-matrix-reasoning', {
  show() {
    const state = appRouter.getState();
    const levelId = state.levelId ?? getFirstMatrixLevelId();
    const cfg = getMatrixLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'logic-menu', subject: 'logic' });
      return;
    }
    matrixGame.show(cfg);
  },
  hide() { matrixGame.hide(); },
});

// ── 8-j. game-sentence-order 화면 ────────────────────────────────────────────
appRouter.register('game-sentence-order', {
  show() { sentenceOrderingGame.show(); },
  hide() { sentenceOrderingGame.hide(); },
});

// ── 8-i. game-odd-one-out 화면 ───────────────────────────────────────────────
appRouter.register('game-odd-one-out', {
  show() {
    const state = appRouter.getState();
    const levelId = state.levelId ?? getFirstOddLevelId();
    const cfg = getOddOneOutLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'logic-menu', subject: 'logic' });
      return;
    }
    oddOneOutGame.show(cfg);
  },
  hide() { oddOneOutGame.hide(); },
});

// ── 8-g. game-creativity 화면 ────────────────────────────────────────────────
// 레벨 선택 없음 — 플레이어의 누적 클리어 수에 따라 난이도를 자동 생성한다.
appRouter.register('game-creativity', {
  show() {
    const meta = saveService.getCreativityMeta();
    const diff = appRouter.getState().difficulty;
    const forcedTier: 1 | 2 | 3 | 4 | 5 | undefined =
      diff === 'easy'   ? 2 :
      diff === 'normal' ? 3 :
      diff === 'hard'   ? 4 :
      undefined;
    const cfg = selectWallPuzzle(meta.totalClears, meta.recentPuzzleIds ?? [], 0, forcedTier);
    saveService.addRecentCreativityPuzzleId(cfg.id);
    creativityGame.show(cfg, forcedTier);
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
// #admin 해시로 접근하면 관리자 페이지를 바로 표시
if (window.location.hash === '#admin') {
  appRouter.navigate({ to: 'admin', replace: true });
} else {
  // 일반 진입: brand-home 랜딩부터 시작. CTA 버튼 클릭 시 프로필 유무에 따라 분기.
  appRouter.navigate({ to: 'brand-home', replace: true });
}

// ── 14. 브라우저/Android 뒤로가기 버튼 처리 ───────────────────────────────────
// 초기 synthetic 히스토리 항목 추가 — popstate 트리거를 위한 앵커
window.history.pushState({}, '', '/');

// 게임 진행 중으로 간주할 화면 ID 집합 (뒤로가기 시 confirmExit 표시)
const GAME_SCREENS = new Set([
  'game-english', 'game-korean',
  'game-math-quiz', 'math-quiz-game',
  'game-eq-fill', 'game-pattern-finder',
  'game-logic', 'game-creativity',
  'game-arithmetic',
  'game-matrix-reasoning',
  'game-odd-one-out',
  'game-sentence-order',
  'game-reasoning',
  'level-intro', // 수박 게임 카운트다운 포함
]);

window.addEventListener('popstate', () => {
  const current = appRouter.getState().current;

  // brand-home / home-b / profile-setup: 최상위 화면에서 뒤로가기 허용
  // synthetic 항목을 재push하지 않으면 WebView에 남은 히스토리가 없어져
  // 다음 뒤로가기에서 앱이 종료됨 (Android 앱 종료 허용)
  if (current === 'brand-home' || current === 'home-b' || current === 'profile-setup') {
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
