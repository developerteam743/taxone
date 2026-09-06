import { describe, expect, it } from 'vitest';
import { lineTotal, invoiceTotal } from './index';
import Decimal from 'decimal.js';

describe('lineTotal', () => {
  it('multiplies quantity by rate', () => {
    expect(lineTotal(3, 100).toFixed(2)).toBe('300.00');
  });
  it('subtracts discount', () => {
    expect(lineTotal(3, 100, 50).toFixed(2)).toBe('250.00');
  });
  it('handles decimal amounts', () => {
    expect(lineTotal('1.5', '33.33').toFixed(2)).toBe('50.00'); // 49.995 rounds
  });
});

describe('invoiceTotal', () => {
  it('sums taxable value and all taxes', () => {
    const t = invoiceTotal(1000, 90, 90, 0, 0);
    expect(t.toFixed(2)).toBe('1180.00');
  });
  it('includes cess and igst', () => {
    const t = invoiceTotal(500, 0, 0, 90, 10);
    expect(t.toFixed(2)).toBe('600.00');
  });
  it('returns a Decimal', () => {
    expect(invoiceTotal(1, 0, 0, 0, 0)).toBeInstanceOf(Decimal);
  });
});
