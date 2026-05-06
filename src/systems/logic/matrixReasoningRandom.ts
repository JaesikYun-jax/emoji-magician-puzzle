export type Rand = () => number;

export function makeLcg(seed: number): Rand {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function shuffleWith<T>(arr: T[], rand: Rand): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickWith<T>(arr: T[], rand: Rand): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function differentValue<T>(pool: T[], current: T, rand: Rand): T {
  const others = pool.filter(v => v !== current);
  if (others.length === 0) return current;
  return pickWith(others, rand);
}

export function pickN<T>(arr: T[], n: number, rand: Rand): T[] {
  if (arr.length === 0) return [];
  const shuffled = shuffleWith(arr, rand);
  if (shuffled.length >= n) return shuffled.slice(0, n);
  const result: T[] = [];
  for (let i = 0; i < n; i++) result.push(shuffled[i % shuffled.length]);
  return result;
}
