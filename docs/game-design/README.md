# Imoji Magician Puzzle 기획 허브

## 프로젝트 요약
- 장르: 이모지 기반 퍼즐 (매치/스왑/연결 계열)
- 핵심 구조: 레벨별 목표 달성형 퍼즐 — 제한된 이동/시간 내 목표 수치 달성
- 현재 목표: 코어 퍼즐 규칙과 레벨 1~N의 난이도 곡선 고정

## Decision Snapshot
- 보드 형태: `TBD` (e.g. 8×8 그리드, 또는 가변)
- 이동 제한: `TBD` (moves / time / both)
- 레벨 목표: `TBD` (점수 / 아이템 수집 / 장애물 제거 / 복합)
- 아트 방향: 모든 퍼즐 오브젝트를 이모지 기반으로 구성
- 힌트 / 실행 취소 정책: `TBD`

## 문서 인덱스
- [01-product-core.md](./01-product-core.md) — 게임 정체성과 코어 경험
- [02-puzzle-mechanics.md](./02-puzzle-mechanics.md) — 매칭 규칙, 보드 상태, 승패 판정
- [03-content-level-balance.md](./03-content-level-balance.md) — 레벨/난이도 커브, 목표 수치
- [04-emoji-art-ui.md](./04-emoji-art-ui.md) — 시각 규칙과 UI 우선순위
- [05-tech-test-ops.md](./05-tech-test-ops.md) — 기술 제약, 테스트(TDD), 운영

## 문서 운영 규칙
- 변경은 작은 단위로 수행하고, 변경 이유를 명확히 기록한다.
- 숫자/룰 변경 시 관련 문서 2개 이상을 반드시 교차 점검한다.
- 구현 반영 전에는 테스트 시나리오 섹션을 먼저 갱신한다.

## 초기 작업 체크리스트
- [ ] 5개 문서 초안 확정 (특히 `TBD` 항목)
- [ ] 보드 크기·타일 종류·매칭 규칙 확정
- [ ] 레벨 1~10 목표/제약 테이블 확정
- [ ] 파워업/부스터 초기 세트 확정
- [ ] 어드민 튜닝 파라미터(Min/Max/Step) 합의

## Change Log
- (초기 템플릿) | Imoji_Magician_Puzzle 문서 체계 수립
