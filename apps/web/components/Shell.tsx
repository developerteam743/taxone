'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { getToken } from '@/lib/api';

const NAV = [
  ['Dashboard', '/dashboard'],
  ['Sales', '/dashboard/sales'],
  ['Purchases', '/dashboard/purchases'],
  ['Payments', '/dashboard/payments'],
  ['Journals', '/dashboard/journals'],
  ['GST', '/dashboard/gst'],
  ['Reconciliation', '/dashboard/reconciliation'],
  ['Documents', '/dashboard/documents'],
  ['Reports', '/dashboard/reports'],
] as const;

export default function Shell({ children, title }: { children: ReactNode; title: string }) {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => { if (!getToken()) router.replace('/login'); }, [router]);
  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="flex min-h-screen">
        <aside className="hidden md:block w-64 bg-slate-950 text-white p-5">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="text-2xl font-bold text-white hover:text-red-400 transition-colors">TaxOne</Link>
          </div>
          <nav className="space-y-1">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href}
                className={`block px-3 py-2 rounded-lg transition-colors ${path === href ? 'bg-red-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'}`}>
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 p-6 md:p-10">
          <header className="md:hidden mb-6">
            <Link href="/dashboard" className="text-xl font-bold">TaxOne</Link>
          </header>
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
