import en from '../../locales/en.json';
import zh from '../../locales/zh.json';
import {
  resolveSupportedLocale,
  type LocaleCode,
} from '@/lib/download/i18n';

/** react-intl v10 expects flat `Record<string, string>` message catalogs. */
export function flattenMessages(
  messages: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const id = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      flat[id] = value;
    } else if (value != null && typeof value === 'object') {
      Object.assign(flat, flattenMessages(value as Record<string, unknown>, id));
    }
  }
  return flat;
}

const catalogs: Record<LocaleCode, Record<string, unknown>> = { en, zh };

export function resolveUiLocale(language?: string): LocaleCode {
  return resolveSupportedLocale(language ?? navigator.language);
}

export function getUiMessages(locale: LocaleCode): Record<string, string> {
  return flattenMessages(catalogs[locale]);
}
