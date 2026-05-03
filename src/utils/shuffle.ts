/** Fisher-Yates shuffle (순수 함수) — 시드 옵션 지원 */
export function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const copy = [...arr];
  const rand = seed !== undefined ? seededRandom(seed) : Math.random;
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
