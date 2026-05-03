/**
 * SVG 별 렌더링 유틸리티 (ResultScreen에서 추출)
 * n: 1~3 순서, filled: 채움 여부
 */
export function renderStar(n: number, filled: boolean): string {
  const size = n === 2 ? 80 : 64;
  const fill = filled ? `url(#rs-star-grad-${n})` : 'rgba(255,255,255,0.25)';
  return `
    <svg class="rs-star ${filled ? '' : 'rs-star--empty'}" data-n="${n}" width="${size}" height="${size}" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="rs-star-grad-${n}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FDE68A"/>
          <stop offset="1" stop-color="#F59E0B"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L50 32 L78 36 L58 54 L64 80 L40 66 L16 80 L22 54 L2 36 L30 32 Z" fill="${fill}" stroke="#fff" stroke-width="2"/>
    </svg>`;
}
