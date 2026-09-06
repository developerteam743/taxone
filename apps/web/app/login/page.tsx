'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [pw, setPw] = useState('Admin@12345');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Signing in…');
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password: pw }),
        }
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? 'Login failed');
      localStorage.setItem('taxone_token', d.accessToken);
      location.href = '/dashboard';
    } catch (e) {
      // For demo convenience, redirect to dashboard if API is not running locally
      setMsg(e instanceof Error ? `${e.message} (Entering demo mode...)` : 'Login failed');
      setTimeout(() => {
        location.href = '/dashboard';
      }, 800);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] grid place-items-center p-5">
      <div className="card w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <img
              src="https://static.taxone.vyapar.com/images/taxone/logo/s_logo.svg"
              alt="Vyapar TaxOne"
              className="h-8"
            />
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-red-600 transition">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
        <p className="text-slate-500 text-sm mb-6">Sign in to your accounting & GST practice portal</p>

        <form onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            className="input mb-4 w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            className="input mb-5 w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            required
          />

          <button
            type="submit"
            className="btn w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Sign in to Workspace
          </button>

          {msg && <p className="text-sm text-center text-slate-600 mt-4">{msg}</p>}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Demo Credentials: <span className="font-mono text-slate-700">admin@example.com / Admin@12345</span>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
