'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Pnl = { totalIncome: string; totalExpense: string; netProfit: string; income: { code: string; name: string; amount: string }[]; expense: { code: string; name: string; amount: string }[] };
type BS = { totalAssets: string; totalLiabilities: string; totalEquity: string; netProfit: string; ASSET: { code: string; name: string; amount: string }[]; LIABILITY: { code: string; name: string; amount: string }[]; EQUITY: { code: string; name: string; amount: string }[] };

function List({ title, rows }: { title: string; rows: { code: string; name: string; amount: string }[] }) {
  return (
    <div className="bg-white rounded-xl border-slate-200 p-4">
      <h3 className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">{title}</h3>
      {rows.length === 0 ? <p className="text-slate-400 text-sm">—</p> : rows.map(r => (
        <div key={r.code} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
          <span className="text-slate-600">{r.code} · {r.name}</span><span className="font-medium">{money(r.amount)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [pnl, setPnl] = useState<Pnl | null>(null);
  const [bs, setBs] = useState<BS | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => {
    if (!bizId) return;
    api<Pnl>(`/businesses/${bizId}/reports/pnl`).then(setPnl).catch(e => setError(String(e)));
    api<BS>(`/businesses/${bizId}/reports/balance-sheet`).then(setBs).catch(e => setError(String(e)));
  }, [bizId]);

  return (
    <Shell title="Reports">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <select value={bizId} onChange={e => setBizId(e.target.value)} className="mb-6 border rounded-lg px-3 py-2 text-sm">
        {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
      </select>
      <section className="mb-8">
        <h2 className="font-bold text-slate-900 mb-3">Profit &amp; Loss</h2>
        {pnl && (
          <>
            <div className="grid gap-4 md:grid-cols-2 mb-3">
              <List title="Income" rows={pnl.income} />
              <List title="Expense" rows={pnl.expense} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Stat label="Total Income" value={money(pnl.totalIncome)} />
              <Stat label="Total Expense" value={money(pnl.totalExpense)} />
              <Stat label="Net Profit" value={money(pnl.netProfit)} highlight />
            </div>
          </>
        )}
      </section>
      <section>
        <h2 className="font-bold text-slate-900 mb-3">Balance Sheet</h2>
        {bs && (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-3">
              <List title="Assets" rows={bs.ASSET} />
              <List title="Liabilities" rows={bs.LIABILITY} />
              <List title="Equity (incl. net profit)" rows={bs.EQUITY} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Stat label="Total Assets" value={money(bs.totalAssets)} />
              <Stat label="Total Liabilities" value={money(bs.totalLiabilities)} />
              <Stat label="Total Equity" value={money(bs.totalEquity)} highlight />
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
      <p className="text-xs uppercase text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
