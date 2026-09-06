'use client';
export default function Table({ head, rows, empty = 'No records yet' }: { head: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>{head.map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td colSpan={head.length} className="px-4 py-8 text-center text-slate-400">{empty}</td></tr>
          ) : rows.map((r, i) => <tr key={i} className="hover:bg-slate-50">{r.map((c, j) => <td key={j} className="px-4 py-3 text-slate-700">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
