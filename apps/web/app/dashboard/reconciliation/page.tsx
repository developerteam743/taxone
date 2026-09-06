'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Item = { bookInvoiceNumber: string | null; returnInvoiceNumber: string | null; supplierGstin: string | null; status: string; score: number; taxDifference: string; taxableDifference: string };
type RunResult = { reconciliationId: string; counts: Record<string, number>; items: Item[] };
type Exceptions = { mismatches: { bookRecordKey: string | null; status: string; taxDifference: string }[]; missingInReturn: { bookRecordKey: string | null }[]; extraInReturn: { returnInvoiceNumber: string | null }[] };

export default function ReconciliationPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState<RunResult | null>(null);
  const [exceptions, setExceptions] = useState<Exceptions | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);

  async function run() {
    setRunning(true); setError(''); setExceptions(null);
    try {
      const r = await api<RunResult>(`/businesses/${bizId}/gst/reconciliation/${period}/run`, { method: 'POST' });
      setResult(r);
      setExceptions(await api<Exceptions>(`/businesses/${bizId}/gst/reconciliation/${period}/exceptions`));
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  }

  async function import2b() {
    setError('');
    try {
      const raw = prompt('Paste GSTR-2B records JSON (array of {supplierGstin, invoiceNumber, invoiceDate, taxableValue, cgst, sgst, igst, cess})');
      if (!raw) return;
      const records = JSON.parse(raw);
      const res = await api<{ imported: number }>(`/businesses/${bizId}/gst/returns/${period}/import`, { method: 'POST', body: JSON.stringify({ records }) });
      alert(`Imported ${res.imported} records into ${period}`);
    } catch (e) { setError(String(e)); }
  }

  const badge = (s: string) => {
    const colors: Record<string, string> = { MATCHED: 'bg-green-100 text-green-700', PROBABLE: 'bg-blue-100 text-blue-700', PARTIAL: 'bg-yellow-100 text-yellow-700', MISSING: 'bg-orange-100 text-orange-700', EXTRA: 'bg-purple-100 text-purple-700', MISMATCH: 'bg-red-100 text-red-700', REVIEW: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? 'bg-slate-100'}`}>{s}</span>;
  };

  return (
    <Shell title="GSTR-2B Reconciliation">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <select value={bizId} onChange={e => setBizId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
        </select>
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        <button onClick={import2b} className="border border-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50">Import 2B records</button>
        <button onClick={run} disabled={running || !bizId} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">{running ? 'Running…' : 'Run reconciliation'}</button>
      </div>
      {result && (
        <div className="mb-6 grid gap-3 md:grid-cols-6">
          {Object.entries(result.counts).filter(([, n]) => n > 0).map(([k, n]) => (
            <div key={k} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs uppercase text-slate-500">{k}</p><p className="text-xl font-bold">{n}</p>
            </div>
          ))}
        </div>
      )}
      {result && <div className="mb-8"><Table head={['Book invoice', '2B invoice', 'GSTIN', 'Status', 'Score', 'Tax diff']}
        rows={result.items.map(i => [i.bookInvoiceNumber ?? '—', i.returnInvoiceNumber ?? '—', i.supplierGstin ?? '—', badge(i.status), i.score, i.taxDifference])} /></div>}
      {exceptions && (exceptions.mismatches.length || exceptions.missingInReturn.length || exceptions.extraInReturn.length) > 0 && (
        <section>
          <h2 className="font-bold text-slate-900 mb-2">Exceptions needing review</h2>
          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
            {exceptions.mismatches.map((m, i) => <li key={`m${i}`}>Amount mismatch on book invoice {m.bookRecordKey} (tax diff {m.taxDifference})</li>)}
            {exceptions.missingInReturn.map((m, i) => <li key={`k${i}`}>{m.bookRecordKey} is in your books but missing from GSTR-2B</li>)}
            {exceptions.extraInReturn.map((e, i) => <li key={`e${i}`}>{e.returnInvoiceNumber} is in GSTR-2B but not in your books</li>)}
          </ul>
        </section>
      )}
    </Shell>
  );
}
