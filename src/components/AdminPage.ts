/**
 * AdminPage.ts
 * 관리자 페이지 — 문제 은행 뷰어
 *
 * 진입 방법:
 *   1. URL hash: #admin  → 앱 로드 시 자동 감지
 *   2. BrandHome 버전 텍스트 5회 탭 (main.ts에서 처리)
 *
 * 기능:
 *   - 은행형 게임 목록 탭 (현재: 추리 5문)
 *   - 문제 ID / 종류 / 난이도 / 문제 / 보기 / 정답 테이블
 *   - 난이도 필터 버튼
 *   - 향후 다른 은행도 탭으로 추가 가능
 */

import type { AppRouter } from '../router/AppRouter';
import { REASONING_BANK } from '../game-data/banks/reasoningBank';
import type { ReasoningDifficulty } from '../game-data/banks/reasoningBank';

type BankTab = 'reasoning';

const ADMIN_STYLE = `
#admin-page {
  position: fixed; inset: 0;
  background: #0F172A;
  color: #E2E8F0;
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', ui-monospace, monospace;
  z-index: 50;
  display: flex; flex-direction: column;
  overflow: hidden;
}
#admin-page .adm-header {
  background: #1E293B;
  border-bottom: 1px solid #334155;
  padding: 16px 20px;
  display: flex; align-items: center; gap: 14px;
  flex-shrink: 0;
}
#admin-page .adm-back {
  background: #334155; border: none; color: #94A3B8;
  border-radius: 8px; padding: 6px 12px; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: background 150ms;
}
#admin-page .adm-back:hover { background: #475569; color: #E2E8F0; }
#admin-page .adm-title {
  font-size: 18px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.01em;
}
#admin-page .adm-badge {
  background: #7C3AED; color: #fff;
  font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
  padding: 3px 8px; border-radius: 999px; text-transform: uppercase;
}

#admin-page .adm-tabs {
  display: flex; gap: 4px;
  padding: 12px 20px 0;
  border-bottom: 1px solid #334155;
  background: #1E293B;
  flex-shrink: 0;
}
#admin-page .adm-tab {
  padding: 8px 16px;
  border: none; background: transparent;
  color: #64748B; font-size: 13px; font-weight: 600;
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color 150ms, border-color 150ms;
  font-family: inherit;
}
#admin-page .adm-tab:hover { color: #CBD5E1; }
#admin-page .adm-tab.active {
  color: #A78BFA; border-bottom-color: #7C3AED;
}

#admin-page .adm-toolbar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 20px;
  background: #0F172A;
  border-bottom: 1px solid #1E293B;
  flex-shrink: 0;
}
#admin-page .adm-filter-label {
  font-size: 11px; font-weight: 700; color: #64748B;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-right: 4px;
}
#admin-page .adm-filter-btn {
  padding: 4px 12px; border-radius: 999px;
  border: 1px solid #334155; background: transparent;
  color: #94A3B8; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 120ms;
  font-family: inherit;
}
#admin-page .adm-filter-btn:hover { border-color: #64748B; color: #E2E8F0; }
#admin-page .adm-filter-btn.active {
  background: #312E81; border-color: #7C3AED; color: #C4B5FD;
}
#admin-page .adm-count {
  margin-left: auto; font-size: 12px; color: #64748B;
}

#admin-page .adm-body {
  flex: 1; overflow-y: auto; overflow-x: auto;
  padding: 0;
}
#admin-page .adm-table {
  width: 100%; border-collapse: collapse;
  font-size: 12px;
  min-width: 720px;
}
#admin-page .adm-table th {
  position: sticky; top: 0;
  background: #1E293B; color: #94A3B8;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 10px 14px; text-align: left;
  border-bottom: 1px solid #334155;
  white-space: nowrap;
}
#admin-page .adm-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #1E293B;
  vertical-align: top;
  line-height: 1.45;
}
#admin-page .adm-table tr:hover td { background: rgba(255,255,255,0.02); }

#admin-page .adm-id { color: #64748B; font-size: 11px; font-family: monospace; white-space: nowrap; }
#admin-page .adm-kind {
  display: inline-block; border-radius: 6px;
  padding: 2px 8px; font-size: 10px; font-weight: 700; white-space: nowrap;
}
#admin-page .adm-kind--commonality { background: #0C4A6E; color: #7DD3FC; }
#admin-page .adm-kind--oddOneOut   { background: #4C1D95; color: #C4B5FD; }
#admin-page .adm-diff {
  display: inline-block; border-radius: 6px;
  padding: 2px 8px; font-size: 10px; font-weight: 700; white-space: nowrap;
}
#admin-page .adm-diff--easy   { background: #14532D; color: #86EFAC; }
#admin-page .adm-diff--normal { background: #713F12; color: #FCD34D; }
#admin-page .adm-diff--hard   { background: #7F1D1D; color: #FCA5A5; }
#admin-page .adm-prompt { color: #E2E8F0; max-width: 260px; }
#admin-page .adm-choices { color: #94A3B8; }
#admin-page .adm-choices span { display: block; }
#admin-page .adm-choices .correct { color: #4ADE80; font-weight: 700; }
#admin-page .adm-correct-idx {
  text-align: center; font-weight: 700;
  color: #4ADE80; font-size: 14px;
}
`;

export class AdminPage {
  private el: HTMLElement | null = null;
  private activeTab: BankTab = 'reasoning';
  private diffFilter: ReasoningDifficulty | 'all' = 'all';

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
  ) {}

  show(): void {
    this.hide();

    if (!document.getElementById('admin-page-style')) {
      const style = document.createElement('style');
      style.id = 'admin-page-style';
      style.textContent = ADMIN_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'admin-page';
    el.innerHTML = `
      <div class="adm-header">
        <button class="adm-back">← 뒤로</button>
        <span class="adm-title">Admin</span>
        <span class="adm-badge">문제 은행</span>
      </div>

      <div class="adm-tabs">
        <button class="adm-tab active" data-tab="reasoning">추리 5문 (Reasoning Bank)</button>
      </div>

      <div class="adm-toolbar" id="adm-toolbar"></div>
      <div class="adm-body" id="adm-body"></div>
    `;

    el.querySelector('.adm-back')!.addEventListener('pointerdown', () => {
      this.router.back();
    });

    el.querySelectorAll('.adm-tab').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        this.activeTab = (btn as HTMLElement).dataset['tab'] as BankTab;
        el.querySelectorAll('.adm-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.diffFilter = 'all';
        this._renderContent(el);
      });
    });

    this.container.appendChild(el);
    this.el = el;
    this._renderContent(el);
  }

  hide(): void {
    if (this.el) { this.el.remove(); this.el = null; }
  }

  private _renderContent(el: HTMLElement): void {
    if (this.activeTab === 'reasoning') {
      this._renderReasoningBank(el);
    }
  }

  private _renderReasoningBank(el: HTMLElement): void {
    const toolbar = el.querySelector('#adm-toolbar') as HTMLElement;
    const body    = el.querySelector('#adm-body')    as HTMLElement;

    // ── 툴바 ─────────────────────────────────────────────────────────────────
    const filtered = this.diffFilter === 'all'
      ? REASONING_BANK
      : REASONING_BANK.filter(q => q.difficulty === this.diffFilter);

    toolbar.innerHTML = `
      <span class="adm-filter-label">난이도</span>
      ${(['all', 'easy', 'normal', 'hard'] as const).map(d => `
        <button class="adm-filter-btn ${this.diffFilter === d ? 'active' : ''}" data-diff="${d}">
          ${d === 'all' ? '전체' : d === 'easy' ? '쉬움' : d === 'normal' ? '보통' : '어려움'}
        </button>
      `).join('')}
      <span class="adm-count">${filtered.length}문제 / 전체 ${REASONING_BANK.length}문제</span>
    `;

    toolbar.querySelectorAll('.adm-filter-btn').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        this.diffFilter = (btn as HTMLElement).dataset['diff'] as ReasoningDifficulty | 'all';
        this._renderReasoningBank(el);
      });
    });

    // ── 테이블 ────────────────────────────────────────────────────────────────
    const kindLabel = (kind: string) =>
      kind === 'commonality' ? '공통점' : '다른 하나';

    const diffLabel = (d: string) =>
      d === 'easy' ? '쉬움' : d === 'normal' ? '보통' : '어려움';

    const choicesHtml = (choices: readonly string[], correctIndex: number) =>
      choices.map((c, i) => `
        <span class="${i === correctIndex ? 'correct' : ''}">
          ${String.fromCharCode(65 + i)}. ${c}${i === correctIndex ? ' ✓' : ''}
        </span>
      `).join('');

    body.innerHTML = `
      <table class="adm-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>종류</th>
            <th>난이도</th>
            <th>문제</th>
            <th>선택지 (정답 ✓)</th>
            <th>정답 번호</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(q => `
            <tr>
              <td class="adm-id">${q.id}</td>
              <td>
                <span class="adm-kind adm-kind--${q.kind}">${kindLabel(q.kind)}</span>
              </td>
              <td>
                <span class="adm-diff adm-diff--${q.difficulty}">${diffLabel(q.difficulty)}</span>
              </td>
              <td class="adm-prompt">${q.prompt}</td>
              <td class="adm-choices">${choicesHtml(q.choices, q.correctIndex)}</td>
              <td class="adm-correct-idx">${q.correctIndex + 1}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}
