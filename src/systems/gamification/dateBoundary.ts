/**
 * dateBoundary.ts
 * 로컬 타임존 기준 날짜 경계 유틸리티.
 * 모든 dayKey 는 "YYYY-MM-DD" 형식의 문자열이다.
 */

/**
 * 주어진 Date(기본값: 현재 시각) 를 로컬 타임존 기준 "YYYY-MM-DD" 문자열로 반환한다.
 */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * dayKey 에서 n 일 전의 dayKey 를 반환한다.
 * 로컬 타임존 기준으로 계산한다.
 */
export function subtractDays(key: string, n: number): string {
  const [y, mo, d] = key.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  date.setDate(date.getDate() - n);
  return dayKey(date);
}

/**
 * a - b 의 일 수 차이를 반환한다.
 * a 가 b 보다 n 일 앞이면 +n, 뒤이면 -n.
 */
export function daysDiff(a: string, b: string): number {
  const toMs = (k: string): number => {
    const [y, mo, d] = k.split('-').map(Number);
    return new Date(y, mo - 1, d).getTime();
  };
  return Math.round((toMs(a) - toMs(b)) / 86_400_000);
}
