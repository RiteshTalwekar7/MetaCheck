import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileText, Download, ShieldCheck } from 'lucide-react';

export function ReportsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['inspections-reports'],
    queryFn: () => api.get('/inspections?limit=20'),
  });

  const inspections = res?.data || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Compliance Inspection Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Export high-resolution PDF compliance assessment reports for enforcement records.</p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="px-6 py-3.5">Report / Inspection ID</th>
              <th className="px-6 py-3.5">Establishment</th>
              <th className="px-6 py-3.5">Assessment Score</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">PDF Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">Loading reports...</td></tr>
            ) : inspections.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No reports generated yet.</td></tr>
            ) : (
              inspections.map((insp) => (
                <tr key={insp._id || insp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">{insp.referenceNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{insp.establishmentName}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">{insp.summary?.score ?? 0}%</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(insp.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/api/v1/inspections/${insp._id || insp.id}/report`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

