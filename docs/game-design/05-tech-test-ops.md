# 05 Tech / Test / Ops

## 문서 메타
- 목적: 기술 제약, 테스트 전략(TDD), 운영 체크리스트를 정의한다.
- 소유자: 클라이언트 개발
- 상태: Draft
- 관련 문서: [02-puzzle-mechanics](./02-puzzle-mechanics.md), [03-content-level-balance](./03-content-level-balance.md)

## 기술 제약
- 허용 의존성: `phaser`, `typescript`, `vite`, `vitest`
- 네이티브 앱: `@capacitor/core` + 공식 플러그인 우선
- 신규 라이브러리는 팀 합의 전 추가하지 않는다.
- 데이터 우선 구조를 사용하고 하드코딩 수치를 최소화한다 (레벨 테이블 분리).

## 레이어 분리 원칙
- `src/systems/` — 순수 함수/클래스. Phaser/DOM 의존 금지. 테스트 대상.
  - 보드 모델, 매칭 검출, 낙하/리필, 연쇄, 점수 계산, 목표 판정
- `src/scenes/` — Phaser 씬. 시스템에서 받은 상태를 애니메이션으로 렌더.
- `src/game-data/` — 레벨, 타일, 파워업, 목표 데이터 정의.
- `src/services/` — 저장, 네트워크, 광고 등 사이드이펙트.

## TDD 규칙
1. 실패 테스트를 먼저 작성한다.
2. 해당 테스트 1개를 통과시키는 최소 코드만 작성한다.
3. 리팩터링 후 전체 테스트를 다시 통과시킨다.

## 우선 테스트 목록
- BoardGenerator: 초기 보드에 즉시 매치 없음 + 최소 1수 보장
- MatchDetector: 수평/수직/교차 매치 정확히 검출
- Cascade: 제거 → 낙하 → 재매치 체인이 종결됨 (무한 루프 없음)
- SpecialTile: 4매치/5매치/T·L 매치 시 특수 타일 생성 규칙
- ScoreRule: 기본 점수 + 연쇄 배율 계산
- GoalEvaluator: 점수/수집/제거/복합 목표 판정
- ConstraintClock: 이동수/시간 소진 시 패배 판정
- ShuffleOnDeadlock: 가능한 수 없음 감지 및 셔플

## 테스트 파일 템플릿 경로
- `src/systems/__tests__/board-generator.test.ts`
- `src/systems/__tests__/match-detector.test.ts`
- `src/systems/__tests__/cascade.test.ts`
- `src/systems/__tests__/special-tile.test.ts`
- `src/systems/__tests__/score-rule.test.ts`
- `src/systems/__tests__/goal-evaluator.test.ts`
- `src/systems/__tests__/constraint-clock.test.ts`
- `src/systems/__tests__/shuffle-on-deadlock.test.ts`

## 스모크 체크리스트
- [ ] 레벨 1~3 수동 플레이 정상
- [ ] 연쇄 해소가 시각·논리 모두 어긋나지 않음
- [ ] 제약 소진 시 결과 화면으로 1회만 전이
- [ ] 가능한 수 없음 → 셔플이 1회 내에 해결

## 운영/빌드
- 웹 빌드: `npx vite build`
- 앱 빌드: `npm run build:app && npx cap sync`
- 테스트 실행: `npx vitest run`
- 어드민 튜닝 키: `A` (후속 문서에서 구체화)
