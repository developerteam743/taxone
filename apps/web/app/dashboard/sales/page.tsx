'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Invoice = { id: string; invoiceNumber: string; invoiceDate: string; customer?: { name: string } | null; taxableValue: string; cgst: string; sgst: string; igst: string; total: string; status: string };

export default function SalesPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [rows, setRows] = useState<Invoice[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ invoiceNumber: '', customerId: '', placeOfSupply: '', interState: false, itemsJson: '' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e)));
  }, []);
  useEffect(() => {
    if (!bizId) return;
    api<Invoice[]>(`/businesses/${bizId}/invoices`).then(setRows).catch(e => setError(String(e)));
  }, [bizId]);

  async function createInvoice() {
    setPosting(true); setError('');
    try {
      const items = JSON.parse(form.itemsJson || '[]');
      await api(`/businesses/${bizId}/invoices`, { method: 'POST', body: JSON.stringify({ invoiceNumber: form.invoiceNumber, customerId: form.customerId || undefined, placeOfSupply: form.placeOfSupply || undefined, interState: form.interState, items }) });
      setRows(await api<Invoice[]>(`/businesses/${bizId}/invoices`));
      setForm({ invoiceNumber: '', customerId: '', placeOfSupply: '', interState: false, itemsJson: '' });
    } catch (e) { setError(String(e)); } finally { setPosting(false); }
  }

  return (
    <Shell title="Sales Invoices">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <div className="mb-4 flex gap-2 items-center">
        <select value={bizId} onChange={e => setBizId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
        </select>
        <a href={`${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1')}/businesses/${bizId}/reports/exports/invoices.csv`}
          target="_blank" rel="noreferrer"
          className="text-sm text-red-600 hover:underline">Export CSV</a>
      </div>
      <div className="mb-6 grid gap-2 md:grid-cols-6 bg-white p-4 rounded-xl border border-slate-200">
        <input placeholder="Invoice #*" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder='Items JSON, e.g. [{"itemId":"...","description":"Widget","quantity":2,"rate":500,"gstRate":18}]' value={form.itemsJson} onChange={e => setForm({ ...form, itemsJson: e.target.value })} className="md:col-span-3 border rounded-lg px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.interState} onChange={e => setForm({ ...form, interState: e.target.checked })} /> Inter-state (IGST)</label>
        <button onClick={createInvoice} disabled={posting || !form.invoiceNumber || !form.itemsJson} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
          {posting ? 'Creating…' : 'Create invoice'}
        </button>
      </div>
      <Table head={['Invoice #', 'Date', 'Customer', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total', 'Status']}
        rows={rows.map(i => [i.invoiceNumber, i.invoiceDate?.slice(0, 10), i.customer?.name ?? '—', money(i.taxableValue), money(i.cgst), money(i.sgst), money(i.igst), money(i.total), <span key="s" className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{i.status}</span>])} />
    </Shell>
  );
}
