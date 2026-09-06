'use client';
let token: string | null = null;
export function setToken(t: string | null) {
  token = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('taxone_token', t);
    else localStorage.removeItem('taxone_token');
  }
}
export function getToken(): string | null {
  if (!token && typeof window !== 'undefined') token = localStorage.getItem('taxone_token');
  return token;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const t = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => res.statusText)}`);
  return res.json() as Promise<T>;
}

export const money = (v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
