import type { AppLocale } from './messages';

/** 根据浏览器语言推断默认 locale，中文环境 → zh-CN，其余 → en-US */
export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'zh-CN';

  const languages = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean);

  for (const lang of languages) {
    const normalized = lang.toLowerCase();
    if (normalized.startsWith('zh')) return 'zh-CN';
    if (normalized.startsWith('en')) return 'en-US';
  }

  return 'en-US';
}
