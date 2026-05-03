import { describe, it, expect } from 'vitest';
import { formatTimer } from '@/utils/formatTimer';
import { renderStar } from '@/utils/renderStar';

// ─────────────────────────────────────────────
// formatTimer
// ─────────────────────────────────────────────
describe('formatTimer', () => {
  describe('60초 이하 — 정수 초 반환', () => {
    it('0을 반환', () => {
      expect(formatTimer(0)).toBe('0');
    });

    it('정확히 60초 반환', () => {
      expect(formatTimer(60)).toBe('60');
    });

    it('소수점 올림 처리 (29.1 → 30)', () => {
      expect(formatTimer(29.1)).toBe('30');
    });

    it('소수점 올림 처리 (29.9 → 30)', () => {
      expect(formatTimer(29.9)).toBe('30');
    });

    it('정수 30 → "30"', () => {
      expect(formatTimer(30)).toBe('30');
    });

    it('1 → "1"', () => {
      expect(formatTimer(1)).toBe('1');
    });
  });

  describe('음수 입력 — 0으로 클램핑', () => {
    it('-1 → "0"', () => {
      expect(formatTimer(-1)).toBe('0');
    });

    it('-999 → "0"', () => {
      expect(formatTimer(-999)).toBe('0');
    });
  });

  describe('60초 초과 — M:SS 포맷', () => {
    it('61초 → "1:01"', () => {
      expect(formatTimer(61)).toBe('1:01');
    });

    it('90초 → "1:30"', () => {
      expect(formatTimer(90)).toBe('1:30');
    });

    it('120초 → "2:00"', () => {
      expect(formatTimer(120)).toBe('2:00');
    });

    it('125.4초 → "2:06" (올림 후 126 → 2:06)', () => {
      expect(formatTimer(125.4)).toBe('2:06');
    });

    it('초 한 자리수는 0 패딩 — 65초 → "1:05"', () => {
      expect(formatTimer(65)).toBe('1:05');
    });

    it('초 두 자리수는 패딩 없음 — 75초 → "1:15"', () => {
      expect(formatTimer(75)).toBe('1:15');
    });

    it('정확히 3분 → "3:00"', () => {
      expect(formatTimer(180)).toBe('3:00');
    });

    it('경계값 60.01 → "1:01" (올림으로 61초)', () => {
      expect(formatTimer(60.01)).toBe('1:01');
    });
  });
});

// ─────────────────────────────────────────────
// renderStar
// ─────────────────────────────────────────────
describe('renderStar', () => {
  describe('SVG 구조 기본 검증', () => {
    it('svg 태그를 포함한다', () => {
      const html = renderStar(1, true);
      expect(html).toContain('<svg');
      expect(html).toContain('</svg>');
    });

    it('path 태그를 포함한다', () => {
      const html = renderStar(1, true);
      expect(html).toContain('<path');
    });

    it('data-n 속성이 n 값과 일치한다', () => {
      expect(renderStar(1, true)).toContain('data-n="1"');
      expect(renderStar(2, false)).toContain('data-n="2"');
      expect(renderStar(3, true)).toContain('data-n="3"');
    });
  });

  describe('크기 규칙', () => {
    it('n=2일 때 width/height가 80', () => {
      const html = renderStar(2, true);
      expect(html).toContain('width="80"');
      expect(html).toContain('height="80"');
    });

    it('n=1일 때 width/height가 64', () => {
      const html = renderStar(1, true);
      expect(html).toContain('width="64"');
      expect(html).toContain('height="64"');
    });

    it('n=3일 때 width/height가 64', () => {
      const html = renderStar(3, false);
      expect(html).toContain('width="64"');
      expect(html).toContain('height="64"');
    });
  });

  describe('filled 상태 — 클래스 및 그라디언트', () => {
    it('filled=true 이면 rs-star--empty 클래스가 없다', () => {
      const html = renderStar(1, true);
      expect(html).not.toContain('rs-star--empty');
    });

    it('filled=false 이면 rs-star--empty 클래스를 포함한다', () => {
      const html = renderStar(1, false);
      expect(html).toContain('rs-star--empty');
    });

    it('filled=true 이면 그라디언트 fill url을 사용한다', () => {
      const html = renderStar(2, true);
      expect(html).toContain('url(#rs-star-grad-2)');
    });

    it('filled=false 이면 반투명 흰색 fill을 사용한다', () => {
      const html = renderStar(2, false);
      expect(html).toContain('rgba(255,255,255,0.25)');
    });
  });

  describe('그라디언트 ID 고유성', () => {
    it('각 n마다 별도의 그라디언트 ID를 가진다', () => {
      expect(renderStar(1, true)).toContain('rs-star-grad-1');
      expect(renderStar(2, true)).toContain('rs-star-grad-2');
      expect(renderStar(3, true)).toContain('rs-star-grad-3');
    });
  });

  describe('rs-star 클래스 공통 포함', () => {
    it('filled=true 이면 rs-star 클래스 포함', () => {
      expect(renderStar(1, true)).toContain('rs-star');
    });

    it('filled=false 이면 rs-star 클래스 포함', () => {
      expect(renderStar(3, false)).toContain('rs-star');
    });
  });
});
