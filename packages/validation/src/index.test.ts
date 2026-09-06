import { describe, expect, it } from 'vitest';
import { isPAN, sanitizeFilename } from './index';

describe('isPAN', () => {
  it('accepts valid PAN', () => {
    expect(isPAN('ABCDE1234F')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(isPAN('abcde1234f')).toBe(true);
  });
  it('rejects invalid PAN', () => {
    expect(isPAN('ABCD1234F')).toBe(false);
    expect(isPAN('ABCDE12345')).toBe(false);
    expect(isPAN('')).toBe(false);
  });
});

describe('sanitizeFilename', () => {
  it('replaces unsafe characters', () => {
    expect(sanitizeFilename('invoice #12/a.pdf')).toBe('invoice__12_a.pdf');
  });
  it('keeps safe names intact', () => {
    expect(sanitizeFilename('inv-001_2.pdf')).toBe('inv-001_2.pdf');
  });
  it('limits length to 180 chars', () => {
    expect(sanitizeFilename('a'.repeat(300)).length).toBe(180);
  });
});
