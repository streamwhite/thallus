import en from '@/locales/en.json';
import zh from '@/locales/zh.json';

const catalogs = {
  en,
  zh,
} as const;

export type LocaleCode = keyof typeof catalogs;
export type DownloadMessageKey = keyof typeof en.download;

const DEFAULT_LOCALE: LocaleCode = 'en';

function resolveLocale(locale?: string): LocaleCode {
  if (locale?.toLowerCase().startsWith('zh')) {
    return 'zh';
  }
  return DEFAULT_LOCALE;
}

export function getDownloadErrorMessage(
  key: DownloadMessageKey,
  vars: Record<string, string> = {},
  locale?: string,
): string {
  const catalog = catalogs[resolveLocale(locale)];
  let message = catalog.download[key] ?? catalogs.en.download[key];
  for (const [name, value] of Object.entries(vars)) {
    message = message.replaceAll(`{${name}}`, value);
  }
  return message;
}
