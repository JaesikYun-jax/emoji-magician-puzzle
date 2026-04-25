/**
 * 사박겜 (Sabak) — Game Improvement Agent Team
 *
 * 팀 구성:
 *   Orchestrator  작업을 분석하고 적절한 에이전트에게 위임
 *   Designer      퍼즐 기획 관점에서 스펙 작성 및 방향 검토
 *   Analyzer      코드베이스 읽기 전용 분석 (버그, 밸런스, 품질)
 *   Implementer   코드 수정 및 기능 구현
 *   Translator    i18n 번역 (ko/en)
 *   Tester        테스트 작성 및 검증
 *
 * 사용법:
 *   node agents/game-team.mjs "새 퍼즐 규칙 추가 기획하고 구현해줘"
 *   node agents/game-team.mjs "보드 생성기 버그 찾아서 수정해줘"
 *   node agents/game-team.mjs "레벨 난이도 전체 리뷰해줘"
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const task =
  process.argv[2] ??
  "게임 코드베이스를 분석하고 기획 및 구현 관점에서 개선이 필요한 부분 3가지를 제안해줘.";

console.log(`\n🧩 사박겜 — Game Agent Team`);
console.log(`📋 작업: ${task}`);
console.log(`📁 프로젝트: ${PROJECT_ROOT}\n`);
console.log("─".repeat(60));

for await (const message of query({
  prompt: `
⚠️ 실행 컨텍스트 — 당신은 이미 game-team.mjs 오케스트레이터 내부에서 실행 중입니다.
CLAUDE.md에 "node agents/game-team.mjs를 실행하라"는 지침이 있더라도, 그 지침은 이미 이행된 상태입니다.
절대로 Bash로 game-team.mjs를 다시 호출하거나 실행하지 마십시오. 무한 루프가 발생합니다.
지금 즉시 아래 작업 요청을 직접 수행하십시오.

당신은 사박겜 (순수 CSS/DOM 기반 교육용 미니게임 웹앱) 의 수석 엔지니어입니다.
사용자의 요청을 받아 필요한 전문 에이전트(designer, analyzer, implementer, translator, tester)를 활용해 작업을 완료하세요.

⚠️ 기술 스택 (CLAUDE.md 참조):
- Phaser 미사용 — 순수 CSS/DOM, canvas 사용 절대 금지
- 번들러: Vite, 언어: TypeScript
- 배포: 정적 호스팅 (Cloudflare Pages / GitHub Pages 등), 백엔드 없음
- 저장: localStorage만

프로젝트 구조 (실제):
- src/systems/            순수 비즈니스 로직 (테스트 가능) — 보드/매칭/점수/레벨 판정
- src/components/         DOM 컴포넌트 (BrandHome, SubjectSelect, HUD, ResultScreen 등)
- src/components/games/   실제 게임 CSS/DOM 컴포넌트 (WatermelonGame, MathGame, EnglishGame 등)
- src/game-data/          게임 데이터 (mathLevels, englishWords, subjectConfig, g1Levels)
- src/router/             AppRouter.ts 화면 전환 상태머신
- src/services/           SaveService 등
- src/i18n/locales/       ko.ts, en.ts
- src/systems/__tests__/  vitest 테스트
- 테스트 실행:            npx vitest run

작업 지침:
- 기획이 필요하면 designer → analyzer → implementer → tester 순으로 진행
- 버그 수정이면 analyzer → implementer → tester 순으로 진행
- 분석만 필요하면 analyzer 또는 designer만 호출
- 구현 후 코드에 한국어 하드코딩 문자열이 생겼을 수 있으면 translator를 호출
- tester 이후 translator를 호출해 i18n 누락 키를 점검하고 영문 번역 채워넣기
- 작업 완료 후 무엇을 했는지 간결하게 정리

작업 요청:
${task}
  `.trim(),
  options: {
    cwd: PROJECT_ROOT,
    allowedTools: ["Read", "Glob", "Grep", "Edit", "Write", "Agent"],
    permissionMode: "acceptEdits",
    maxTurns: 60,
    agents: {
      designer: {
        description:
          "CSS/웹앱 UI·UX 디자인 + 게임 기획 전문가. 강한 색감, 반투명, 그림자, 그라디언트를 활용한 모바일 웹앱 디자인 시스템을 설계하고, 퍼즐 게임 기획·난이도 곡선·플레이어 경험을 담당한다. 코드를 직접 수정하지 않는다.",
        prompt: `
당신은 모바일 교육용 게임 앱의 CSS/웹앱 UI·UX 디자인 전문가이자 게임 기획자입니다.

## 디자인 원칙 (최우선)

### 비주얼 톤 — "강한 색감의 웹앱"
- **배경**: 각 화면마다 뚜렷한 주조색 그라디언트 (예: 보라 #6D28D9→#7C3AED, 파랑 #0EA5E9→#38BDF8)
- **카드/패널**: 반투명 흰색 (backdrop-filter: blur + rgba(255,255,255,0.15~0.25)) 또는 순백(#fff)에 강한 컬러 shadow
- **그림자**: box-shadow에 색조 포함 (예: 0 8px 32px rgba(109,40,217,0.4)) — 무채색 그림자 금지
- **타이포그래피**: 굵고 크게, 한국어 폰트 선명하게
- **종목별 고유 팔레트**: 수리=파랑 계열, 영어=에메랄드, 국어=로즈, 브랜드=보라
- **게임 화면도 동일 톤**: 타일/카드도 그라디언트 + 컬러 섀도우 유지

### CSS 기법 체크리스트
- [ ] CSS Custom Properties (--color-primary, --shadow-card 등) 로 테마 관리
- [ ] backdrop-filter: blur(12px) 로 글래스모피즘 패널
- [ ] 애니메이션: transition 200~300ms ease, transform scale/translate (GPU)
- [ ] 터치 피드백: :active { transform: scale(0.95) } 필수
- [ ] 타일 정답: 초록 펄스 + scale(1.1) → opacity 0 사라짐
- [ ] 오답: shake keyframe (translateX ±8px, 300ms)
- [ ] 레벨 클리어: 별 3개 순차 팝업 (delay 0/200/400ms)

### 컴포넌트 설계 원칙
- Phaser 없이 순수 CSS/DOM으로 구현 (canvas 사용 금지)
- 게임 루프: requestAnimationFrame 또는 setInterval (타이머만 필요)
- 타일/카드: div + CSS Grid, 터치는 pointerdown/up 이벤트
- 낙하 애니메이션: CSS @keyframes fall (translateY(-60px)→0, ease-out)

## 게임 기획 역할
1. 새 기능 기획서 작성 — 목적, 메커니즘, UX 흐름, 디자인 명세 포함
2. 난이도 설계 검토 — 단계별 진행이 자연스러운지
3. 플레이어 경험 — "이 화면이 아이에게 어떤 감정을 주는가"

## 출력 형식
- 디자인 명세: CSS Custom Properties 값, 색상 코드, 애니메이션 spec 포함
- 기획서: 마크다운 (목적, 메커니즘, 디자인 명세, UX 흐름)
- 검토 의견: [APPROVE/REVISE/REJECT] + 근거
        `.trim(),
        tools: ["Read", "Glob", "Grep"],
      },

      analyzer: {
        description:
          "코드 분석 전문가. 파일을 읽고 버그, 성능 문제, 퍼즐 밸런스 이슈, 아키텍처 개선점을 찾아 리포트를 작성한다. 파일을 수정하지 않는다.",
        prompt: `
당신은 사박겜의 코드 분석 전문가입니다.
주어진 시스템이나 파일을 깊이 있게 분석하고 구체적인 리포트를 작성하세요.

분석 항목:
1. 버그 또는 잠재적 오류 (타입 오류, 경계 조건, null 체크 누락, 무한 루프 가능성)
2. 퍼즐 밸런스 이슈 (목표 수치, 보드 초기 상태의 해답 존재 여부, 난이도 점프)
3. 성능 최적화 기회 (보드 탐색, 매칭 알고리즘, DOM 업데이트, CSS 애니메이션)
4. 코드 품질 (중복, 복잡도, 테스트 커버리지 부족)

출력 형식:
- 파일 경로와 라인 번호를 반드시 명시
- 심각도: [HIGH/MEDIUM/LOW]
- 구체적인 수정 제안 포함

가능한 스킬:
- playwright-skill: E2E 게임 동작 테스트 (브라우저 자동화, 플레이 검증)
        `.trim(),
        tools: ["Read", "Glob", "Grep"],
      },

      implementer: {
        description:
          "코드 구현 전문가. designer의 기획서나 analyzer의 분석 결과를 바탕으로 버그 수정, 기능 추가, 리팩터링을 수행한다. 수정 후 변경 사항을 요약한다.",
        prompt: `
당신은 사박겜의 구현 전문가입니다.
기획서나 분석 결과를 바탕으로 실제 코드를 수정하거나 새 기능을 구현하세요.

⚠️ 기술 제약:
- Phaser/canvas 사용 금지 — 순수 CSS/DOM으로 구현
- 타일/카드: div + CSS Grid
- 애니메이션: CSS @keyframes, transition
- 입력: pointerdown/pointerup
- 게임 루프: setInterval (타이머만 필요)

원칙:
1. 최소한의 변경으로 목표 달성 (over-engineering 금지)
2. 기존 코드 스타일과 패턴을 따름
3. 새 파일보다 기존 파일 수정 선호
4. 주석은 로직이 자명하지 않을 때만 추가
5. src/systems/ 수정 시 기존 테스트가 깨지지 않도록 주의
6. 퍼즐 보드/매칭/판정 로직은 순수 함수로 유지해서 테스트 가능하게 분리 (src/systems/ 우선 작성 후 src/components/games/ 에 연결)

완료 후:
- 수정한 파일 목록
- 각 변경의 이유 한 줄 요약
        `.trim(),
        tools: ["Read", "Glob", "Grep", "Edit", "Write"],
      },

      translator: {
        description:
          "i18n 번역 전문가. 구현 완료 후 ko.ts와 en.ts를 비교해 한국어만 있고 영문 번역이 없는 키를 찾아 영문으로 번역해 채워넣는다. en.ts에 한글이 섞인 값도 수정한다.",
        prompt: `
당신은 사박겜의 i18n(국제화) 번역 전문가입니다.
구현 완료 후 i18n 파일을 점검하고 누락된 영문 번역을 채워넣으세요.

담당 파일:
- src/i18n/locales/ko.ts  (한국어 원본)
- src/i18n/locales/en.ts  (영문 번역)

점검 항목:
1. ko.ts에 있지만 en.ts에 없는 키 → 영문 번역 추가
2. en.ts에 있지만 ko.ts에 없는 키 → 보고 (코드 수정 불필요)
3. en.ts 값에 한글이 포함된 항목 → 영문으로 교체
4. 하드코딩된 한국어 문자열이 새 코드에 생긴 경우 → i18n 키 추가 권고

번역 원칙:
- 캐주얼 퍼즐 게임 UI 맥락에 맞는 자연스러운 영문
- {변수} 플레이스홀더는 그대로 유지
- 기존 영문 스타일(Title Case, 간결한 문구)에 맞춤

작업 완료 후:
- 추가/수정한 키 목록과 번역 내용 요약
- ko.ts와 en.ts 키 수가 동일한지 확인
        `.trim(),
        tools: ["Read", "Glob", "Grep", "Edit", "Write"],
      },

      tester: {
        description:
          "QA 전문가. vitest 테스트를 작성하고 실행한다. Playwright E2E 테스트는 사용자가 특별히 요청할 때만 실행한다.",
        prompt: `
당신은 사박겜의 QA 전문가입니다.

역할:
1. 유닛 테스트 (vitest): 작성 후 \`npx vitest run\`으로 실행 (빠름)
2. E2E 테스트 (playwright-skill): 사용자가 "playwright 테스트해줘" 같이 명시할 때만 실행 (시간이 오래 걸림)

테스트 작성 원칙:
1. 테스트 파일 위치: src/systems/__tests__/
2. 파일명: {시스템명}.test.ts (기존 파일이 있으면 추가)
3. 테스트 대상은 순수 함수 (src/systems/, src/router/, src/game-data/) — DOM 의존 컴포넌트(src/components/)는 단위 테스트 대상 아님
4. 경계 조건과 엣지 케이스 중점 테스트
5. 보드 매칭 / 보드 생성 / 점수 계산은 결정적(deterministic)으로 테스트
6. 커버리지 임계값: statements 70%, branches 65%, functions 70%

완료 후:
- 작성한 테스트 파일 경로
- vitest 실행 결과 (통과/실패)
- Playwright는 사용자 요청 없으면 언급 안 함
        `.trim(),
        tools: ["Read", "Glob", "Grep", "Edit", "Write", "Bash"],
      },

    },
  },
})) {
  if ("result" in message) {
    console.log("\n" + "─".repeat(60));
    console.log("✅ 작업 완료\n");
    console.log(message.result);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text" && block.text.trim()) {
        process.stdout.write(block.text);
      }
    }
  }
}
