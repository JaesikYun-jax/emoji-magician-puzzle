/**
 * 남은 시간(초)을 표시 문자열로 변환
 * 60초 초과: "M:SS" 포맷
 * 60초 이하: 정수 초
 */
export function formatTimer(remaining: number): string {
  const s = Math.max(0, Math.ceil(remaining));
  if (s > 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }
  return String(s);
}
