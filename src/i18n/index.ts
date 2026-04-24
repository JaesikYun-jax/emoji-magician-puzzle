import { ko } from './locales/ko';
import { en } from './locales/en';

type Locale = 'ko' | 'en';
type LocaleMap = typeof ko;

const locales: Record<Locale, LocaleMap> = { ko, en };

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(key: keyof LocaleMap, vars?: Record<string, string | number>): string {
  const map = locales[currentLocale];
  let str: string = map[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}
