import { useEffect, useMemo, useState } from 'react';
import { detectBrowserLocale } from './detectLocale';
import { resolveAppMessages, type AppLocale, type AppMessages } from './messages';

export function useAppLocale(): {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  messages: AppMessages;
} {
  const [locale, setLocale] = useState<AppLocale>(() => detectBrowserLocale());
  const messages = useMemo(() => resolveAppMessages(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return { locale, setLocale, messages };
}
