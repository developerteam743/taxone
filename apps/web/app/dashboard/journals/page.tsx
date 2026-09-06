'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Journal = { id: string; entryNumber: number; date: string; narration: string; status: string; lines: { account: { code: string; name: string }; debit: string; credit: string }[] };

export default function JournalsPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [rows, setRows] = useState<Journal[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ narration: '', linesJson: '' });

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => { if (bizId) api<Journal[]>(`/businesses/${bizId}/journals`).then(setRows).catch(e => setError(String(e))); }, [bizId]);

  async function create() {
    setError('');
    try {
      await api(`/businesses/${bizId}/journals`, { method: 'POST', body: JSON.stringify({ narration: form.narration, lines: JSON.parse(form.linesJson || '[]') }) });
      setRows(await api<Journal[]>(`/businesses/${bizId}/journals`));
      setForm({ narration: '', linesJson: '' });
    } catch (e) { setError(String(e)); }
  }

  return (
    <Shell title="Journal Entries">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <select value={bizId} onChange={e => setBizId(e.target.value)} className="mb-4 border rounded-lg px-3 py-2 text-sm">
        {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
      </select>
      <div className="mb-6 grid gap-2 md:grid-cols-4 bg-white p-4 rounded-xl border border-slate-200">
        <input placeholder="Narration*" value={form.narration} onChange={e => setForm({ ...form, narration: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder='Lines JSON: [{"accountId":"...","debit":100,"credit":0},{"accountId":"...","debit":0,"credit":100}]' value={form.linesJson} onChange={e => setForm({ ...form, linesJson: e.target.value })} className="md:col-span-2 border rounded-lg px-3 py-2 text-sm" />
        <button onClick={create} disabled={!form.narration || !form.linesJson} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">Post journal</button>
      </div>
      <Table head={['#', 'Date', 'Narration', 'Lines', 'Status']}
        rows={rows.map(j => [`#${j.entryNumber}`, j.date?.slice(0, 10), j.narration,
        <span key="l" className="text-xs text-slate-500">{j.lines?.map(l => `${l.account.code} D${Number(l.debit).toFixed(0)}/C${Number(l.credit).toFixed(0)}`).join(' · ')}</span>,
        <span key="s" className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{j.status}</span>])} />
    </Shell>
  );
}
