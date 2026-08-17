export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'es', label: 'Español' },
  { code: 'zh-Hans', label: '简体中文' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const FALLBACK: LanguageCode = 'en';

// Merge all pack fragments per language at build time.
const modules = import.meta.glob<{ default: Record<string, string> }>('../data/i18n/*/*.json', {
  eager: true,
});

const tables: Record<string, Record<string, string>> = {};
for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/i18n\/([^/]+)\//);
  if (!match) continue;
  const lang = match[1];
  tables[lang] = { ...(tables[lang] ?? {}), ...mod.default };
}

let current: LanguageCode = FALLBACK;

export function setLanguage(lang: string) {
  current = (SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : FALLBACK) as LanguageCode;
}

export function getLanguage(): LanguageCode {
  return current;
}

export function detectLanguage(): LanguageCode {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
  if (nav.startsWith('vi')) return 'vi';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('zh')) return 'zh-Hans';
  return 'en';
}

/** Resolve an i18n key in the current language, falling back to English, then the key itself. */
export function t(key: string, params?: (string | number)[]): string {
  let s = tables[current]?.[key] ?? tables[FALLBACK]?.[key] ?? key;
  if (params) {
    params.forEach((p, i) => {
      s = s.replaceAll(`{${i}}`, String(p));
    });
  }
  return s;
}

export function hasKey(key: string, lang: string = FALLBACK): boolean {
  return tables[lang]?.[key] !== undefined;
}

export function allTables() {
  return tables;
}
