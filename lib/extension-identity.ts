import { createHash } from 'node:crypto';
import {
  DEV_EXTENSION_ID_ENV_KEY,
  EXTENSION_PUBLIC_KEY_ENV_KEY,
} from './constants';

/** Stable public key for consistent Chrome extension IDs in this template. */
export const DEFAULT_EXTENSION_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy7A6REf8Zp6XNZPeZ4nsdpCUynHhxsL5aRQBNd4L0erH0uxNA7CJr3V2zd/ECnx8snuVmoonLWahc2JvWDTdIW92kswXhXp701mOdkS30iZpg6Jdk1rHrkvAczc2ziDlJpN2Qk//C/pnawiaEMciJ2hC9Y2jWsxohA8c5sxZEgy6vwzGU5VyGxw8RYViK7oRqLg4Qt0ZOEpyLsmXkfVKCyKRjxy4zSH14oQrRINwiLkGVKYz4ghm0nBhvDvb/yLaf0wOPgCgFfHDTAXey6mGT/PJIibeuNtPD3UyHi7VtEgJtvx7idPz7imxyIawMk2bqlHVPEAHggaITu7ti67aUwIDAQAB';

export function extensionIdFromPublicKey(publicKeyBase64: string): string {
  const der = Buffer.from(publicKeyBase64, 'base64');
  const hash = createHash('sha256').update(der).digest();
  let id = '';
  for (let i = 0; i < 16; i += 1) {
    id += String.fromCharCode(97 + (hash[i] >> 4));
    id += String.fromCharCode(97 + (hash[i] & 0xf));
  }
  return id;
}

export function resolveExtensionPublicKey(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromEnv = env[EXTENSION_PUBLIC_KEY_ENV_KEY]?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_EXTENSION_PUBLIC_KEY;
}

export function resolveDevExtensionId(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromEnv = env[DEV_EXTENSION_ID_ENV_KEY]?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return extensionIdFromPublicKey(resolveExtensionPublicKey(env));
}
