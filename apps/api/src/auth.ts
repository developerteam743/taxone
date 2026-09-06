import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import Decimal from 'decimal.js';

export type Claims = { sub: string; organizationId: string; role: string };

export function claims(h?: string): Claims {
  if (!h?.startsWith('Bearer ')) throw new UnauthorizedException();
  try {
    return jwt.verify(h.slice(7), process.env.JWT_SECRET!) as Claims;
  } catch {
    throw new UnauthorizedException();
  }
}

export function positive(n: unknown, field: string) {
  const d = new Decimal(String(n));
  if (!d.isFinite() || d.lte(0)) throw new BadRequestException(`${field} must be positive`);
  return d;
}

export function nonNegative(n: unknown, field: string) {
  const d = new Decimal(String(n));
  if (!d.isFinite() || d.lt(0)) throw new BadRequestException(`${field} cannot be negative`);
  return d;
}

export function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
}
