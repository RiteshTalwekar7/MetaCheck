import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export function RulesDirectoryPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['rules-registry'],
    queryFn: () => api.get('/rules'),
  });

  const rulesData = res?.data || {};
  const rules = rulesData.rules || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Legal Metrology Rules Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Active versioned legal ruleset: <span className="font-mono text-brand-400 font-bold">{rulesData.ruleSetVersion || 'PCR-INDIA-2026-08-v1'}</span>
          </p>
        </div>
        <a
          href="https://consumeraffairs.nic.in/acts-and-rules/legal-metrology"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <span>Official DCA Repository</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-slate-500">Loading legal rules...</div>
        ) : (
          rules.map((r) => (
            <div key={r.id} className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  {r.id}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded">
                  {r.severity}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100">{r.title}</h3>
              <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <div><b>Statute:</b> {r.legalSource?.instrument}</div>
                <div><b>Rule Ref:</b> {r.legalSource?.rule}</div>
                <div><b>Requirement:</b> {r.legalSource?.clause}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

