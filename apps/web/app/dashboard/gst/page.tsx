'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Table from '@/components/Table';
import { api, money } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Period = { id: string; period: string; returnType: string; status: string };

export default function GstPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);

  async function load() {
    if (!bizId) return;
    // Period list comes from the reconciliation state; import/2B history lives in GSTReturnPeriod.
    try {
      const recs = await api<{ items?: Period[] }>(`/businesses/${bizId}/gst/periods`).catch(() => ({ items: [] }));
      setPeriods((recs.items ?? []) as Period[]);
    } catch (e) { setError(String(e)); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [bizId]);

  return (
    <Shell title="GST">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <select value={bizId} onChange={e => setBizId(e.target.value)} className="mb-6 border rounded-lg px-3 py-2 text-sm">
        {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
      </select>
      <p className="mb-4 text-sm text-slate-600">
        Import GSTR-2B records and run matching against your purchase book from the{' '}
        <a href="/dashboard/reconciliation" className="text-red-600 hover:underline">Reconciliation</a> page.
      </p>
      <Table head={['Period', 'Return type', 'Status']} rows={periods.map(p => [p.period, p.returnType, p.status])} empty="No return periods imported yet" />
    </Shell>
  );
}
