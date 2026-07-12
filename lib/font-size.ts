import {
  BASE_FONT_SIZE_PX,
  DEFAULT_FONT_SIZE_SCALE,
  FONT_SIZE_SCALES,
  type FontSizeScaleName,
} from './constants';

export function resolveFontSizeScale(
  name: FontSizeScaleName = DEFAULT_FONT_SIZE_SCALE,
): number {
  return FONT_SIZE_SCALES[name];
}

export function toRem(px: number, scale = resolveFontSizeScale()): string {
  return `${(px / BASE_FONT_SIZE_PX) * scale}rem`;
}

export function applyFontSizeScale(
  name: FontSizeScaleName,
  root: HTMLElement = document.documentElement,
): void {
  const scale = resolveFontSizeScale(name);
  root.dataset.fontSize = name;
  root.style.setProperty('--font-size-scale', String(scale));
  root.style.fontSize = `${BASE_FONT_SIZE_PX * scale}px`;
}

/** Extension action UI uses md only — no font-size control on the icon surface. */
export function applyExtensionUiFontSize(
  root: HTMLElement = document.documentElement,
): void {
  applyFontSizeScale(DEFAULT_FONT_SIZE_SCALE, root);
}

export function isFontSizeScaleName(value: unknown): value is FontSizeScaleName {
  return typeof value === 'string' && value in FONT_SIZE_SCALES;
}
