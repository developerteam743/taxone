'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Purchase = { id: string; invoiceNumber: string; invoiceDate: string; supplier: { name: string }; taxableValue: string; cgst: string; sgst: string; igst: string; itcEligible: boolean; status: string };

export default function PurchasesPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [rows, setRows] = useState<Purchase[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ supplierId: '', invoiceNumber: '', taxableValue: '', cgst: '', sgst: '', igst: '' });

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => { if (bizId) api<Purchase[]>(`/businesses/${bizId}/purchases`).then(setRows).catch(e => setError(String(e))); }, [bizId]);

  async function create() {
    setError('');
    try {
      await api(`/businesses/${bizId}/purchases`, { method: 'POST', body: JSON.stringify({ ...form, taxableValue: Number(form.taxableValue), cgst: Number(form.cgst || 0), sgst: Number(form.sgst || 0), igst: Number(form.igst || 0) }) });
      setRows(await api<Purchase[]>(`/businesses/${bizId}/purchases`));
      setForm({ supplierId: '', invoiceNumber: '', taxableValue: '', cgst: '', sgst: '', igst: '' });
    } catch (e) { setError(String(e)); }
  }

  return (
    <Shell title="Purchases">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <select value={bizId} onChange={e => setBizId(e.target.value)} className="mb-4 border rounded-lg px-3 py-2 text-sm">
        {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
      </select>
      <div className="mb-6 grid gap-2 md:grid-cols-7 bg-white p-4 rounded-xl border border-slate-200">
        <input placeholder="Supplier ID*" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Invoice #*" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Taxable*" type="number" value={form.taxableValue} onChange={e => setForm({ ...form, taxableValue: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="CGST" type="number" value={form.cgst} onChange={e => setForm({ ...form, cgst: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="SGST" type="number" value={form.sgst} onChange={e => setForm({ ...form, sgst: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="IGST" type="number" value={form.igst} onChange={e => setForm({ ...form, igst: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <button onClick={create} disabled={!form.supplierId || !form.invoiceNumber || !form.taxableValue} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">Record purchase</button>
      </div>
      <Table head={['Invoice #', 'Date', 'Supplier', 'Taxable', 'CGST', 'SGST', 'IGST', 'ITC', 'Status']}
        rows={rows.map(p => [p.invoiceNumber, p.invoiceDate?.slice(0, 10), p.supplier?.name ?? '—', money(p.taxableValue), money(p.cgst), money(p.sgst), money(p.igst), p.itcEligible ? 'Yes' : 'No', <span key="s" className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{p.status}</span>])} />
    </Shell>
  );
}
