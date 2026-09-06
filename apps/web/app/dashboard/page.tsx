'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string; tradeName?: string | null };
type Pnl = { totalIncome: string; totalExpense: string; netProfit: string };
type Invoice = { total: string; status: string };
type Purchase = { taxableValue: string };

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [stats, setStats] = useState<{ income: string; purchases: string; invoices: number; netProfit: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => {
    if (!bizId) return;
    Promise.all([
      api<Pnl>(`/businesses/${bizId}/reports/pnl`),
      api<Invoice[]>(`/businesses/${bizId}/invoices`),
      api<Purchase[]>(`/businesses/${bizId}/purchases`),
    ]).then(([pnl, invoices, purchases]) => {
      setStats({
        income: pnl.totalIncome,
        netProfit: pnl.netProfit,
        invoices: invoices.length,
        purchases: purchases.reduce((s, p) => s + Number(p.taxableValue), 0).toFixed(2),
      });
    }).catch(e => setError(String(e)));
  }, [bizId]);

  const cards = stats ? [
    ['Income (this FY)', money(stats.income), '/dashboard/reports'],
    ['Purchases (booked)', money(stats.purchases), '/dashboard/purchases'],
    ['Sales invoices', String(stats.invoices), '/dashboard/sales'],
    ['Net profit', money(stats.netProfit), '/dashboard/reports'],
  ] as const : [];

  return (
    <Shell title="Dashboard">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <div className="mb-6">
        <select value={bizId} onChange={e => setBizId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <p className="text-xs uppercase text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink href="/dashboard/sales" title="Create a sales invoice" desc="GST-aware invoicing with automatic posting to the ledger." />
        <QuickLink href="/dashboard/reconciliation" title="Reconcile GSTR-2B" desc="Match your purchase book against imported return data." />
        <QuickLink href="/dashboard/documents" title="Process documents" desc="Upload invoices, review OCR extraction, book them in one click." />
      </div>
    </Shell>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <p className="font-semibold text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-500">{desc}</p>
    </Link>
  );
}

