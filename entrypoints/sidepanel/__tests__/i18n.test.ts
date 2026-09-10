import { describe, expect, it } from 'vitest';
import { flattenMessages } from '../i18n';

describe('flattenMessages', () => {
  it('flattens nested catalogs to react-intl dot-notation ids', () => {
    expect(
      flattenMessages({
        download: { missingUrl: 'URL is required.', fetchFailed: 'Failed {status}.' },
        sidepanel: { title: 'Download', submit: 'Go' },
      }),
    ).toEqual({
      'download.missingUrl': 'URL is required.',
      'download.fetchFailed': 'Failed {status}.',
      'sidepanel.title': 'Download',
      'sidepanel.submit': 'Go',
    });
  });

  it('keeps already-flat catalogs and skips non-string leaves', () => {
    expect(flattenMessages({ title: 'T' })).toEqual({ title: 'T' });
    expect(flattenMessages({ count: 1, flag: null })).toEqual({});
  });
});
