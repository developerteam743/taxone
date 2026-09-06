'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';

type Biz = { id: string; legalName: string };
type Doc = { id: string; filename: string; mimeType: string; status: string; size: string; ocrJobs: { status: string; result?: { confidence: string; structuredJson: Record<string, unknown> } | null }[] };

export default function DocumentsPage() {
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [bizId, setBizId] = useState('');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { api<Biz[]>('/businesses').then(b => { setBusinesses(b); if (b[0]) setBizId(b[0].id); }).catch(e => setError(String(e))); }, []);
  useEffect(() => { if (bizId) api<Doc[]>(`/businesses/${bizId}/documents`).then(setDocs).catch(e => setError(String(e))); }, [bizId]);

  async function upload(file: File) {
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api(`/businesses/${bizId}/documents`, { method: 'POST', body: fd });
      setDocs(await api<Doc[]>(`/businesses/${bizId}/documents`));
    } catch (e) { setError(String(e)); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function review(docId: string, action: 'APPROVE' | 'REJECT', corrections?: Record<string, unknown>) {
    setError('');
    try {
      if (action === 'APPROVE' && !corrections) {
        const raw = prompt('Corrections JSON (optional). Example: {"invoiceNumber":"INV-9","taxableValue":5000,"cgst":450,"sgst":450,"invoiceDate":"2025-04-10"}');
        corrections = raw ? JSON.parse(raw) : undefined;
      }
      await api(`/businesses/${bizId}/documents/${docId}/review`, { method: 'POST', body: JSON.stringify({ action, corrections }) });
      setDocs(await api<Doc[]>(`/businesses/${bizId}/documents`));
    } catch (e) { setError(String(e)); }
  }

  const badge = (s: string) => {
    const colors: Record<string, string> = { UPLOADED: 'bg-slate-100', PROCESSING: 'bg-blue-100 text-blue-700', REVIEW: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? 'bg-slate-100'}`}>{s}</span>;
  };

  return (
    <Shell title="Documents & OCR">
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <div className="mb-6 flex gap-2 items-center">
        <select value={bizId} onChange={e => setBizId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
        </select>
        <input ref={fileRef} type="file" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} disabled={busy || !bizId} className="text-sm" />
        {busy && <span className="text-sm text-slate-500">Uploading…</span>}
      </div>
      <div className="space-y-3">
        {docs.length === 0 && <p className="text-slate-400 text-sm">No documents uploaded yet. Upload an invoice (plain text works with the mock OCR) to start the extraction → review → booking workflow.</p>}
        {docs.map(d => {
          const extracted = d.ocrJobs?.[0]?.result?.structuredJson;
          return (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{d.filename}</p>
                  <p className="text-xs text-slate-500">{d.mimeType} · {Number(d.size).toLocaleString()} bytes</p>
                </div>
                {badge(d.status)}
                {d.status === 'REVIEW' && (
                  <div className="flex gap-2">
                    <button onClick={() => review(d.id, 'APPROVE')} className="bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium">Approve &amp; book</button>
                    <button onClick={() => review(d.id, 'REJECT')} className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs">Reject</button>
                  </div>
                )}
              </div>
              {extracted && (
                <p className="mt-2 text-xs text-slate-500">
                  Extracted: {Object.entries(extracted).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => `${k}=${String(v)}`).join(' · ') || 'nothing'}
                  <span className="ml-2">(confidence {d.ocrJobs?.[0]?.result?.confidence ?? '0'})</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
