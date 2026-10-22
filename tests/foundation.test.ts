import { describe, it, expect } from 'vitest';
import en from '../messages/en.json';
import ar from '../messages/ar.json';
import { cn } from '../src/lib/utils';
describe('foundation', () => {
  it('keeps Arabic and English keys in sync', () =>
    expect(Object.keys(en).sort()).toEqual(Object.keys(ar).sort()));
  it('resolves conflicting utility styles', () => expect(cn('p-2', 'p-4')).toBe('p-4'));
});
