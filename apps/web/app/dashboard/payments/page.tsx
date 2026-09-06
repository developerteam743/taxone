'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Payment = { id: string; type: string; date: string; amount: string; method: string; reference?: string | null; status: string; allocations: { invoiceId: string; amount: string }[] };

export default function PaymentsPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [rows, setRows] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'RECEIPT', amount: '', method: 'BANK', reference: '' });

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => { if (bizId) api<Payment[]>(`/businesses/${bizId}/payments`).then(setRows).catch(e => setError(String(e))); }, [bizId]);

  async function create() {
    setError('');
    try {
      await api(`/businesses/${bizId}/payments`, { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setRows(await api<Payment[]>(`/businesses/${bizId}/payments`));
      setForm({ type: 'RECEIPT', amount: '', method: 'BANK', reference: '' });
    } catch (e) { setError(String(e)); }
  }

  return (
    <Shell title="Payments">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <select value={bizId} onChange={e => setBizId(e.target.value)} className="mb-4 border rounded-lg px-3 py-2 text-sm">
        {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
      </select>
      <div className="mb-6 grid gap-2 md:grid-cols-6 bg-white p-4 rounded-xl border border-slate-200">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
          <option value="RECEIPT">Receipt</option><option value="PAYMENT">Payment</option>
        </select>
        <input placeholder="Amount*" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
          <option value="BANK">Bank</option><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="OTHER">Other</option>
        </select>
        <input placeholder="Reference" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <button onClick={create} disabled={!form.amount} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">Record</button>
      </div>
      <Table head={['Type', 'Date', 'Amount', 'Method', 'Reference', 'Allocations', 'Status']}
        rows={rows.map(p => [p.type, p.date?.slice(0, 10), money(p.amount), p.method, p.reference ?? '—', p.allocations?.length ?? 0, <span key="s" className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{p.status}</span>])} />
    </Shell>
  );
}
