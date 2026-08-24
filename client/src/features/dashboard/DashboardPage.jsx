import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  ClipboardCheck,
  AlertOctagon,
  Clock,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export function DashboardPage() {
  const { data: inspectionsData, isLoading } = useQuery({
    queryKey: ['inspections-dashboard'],
    queryFn: () => api.get('/inspections?limit=6'),
  });

  const inspections = inspectionsData?.data || [];

  // Compute live dashboard metrics
  const total = inspections.length;
  const violationsCount = inspections.filter(i => i.summary?.overallStatus === 'FAIL').length;
  const pendingReviewCount = inspections.filter(i => i.status === 'DRAFT' || i.status === 'REVIEW_REQUIRED').length;
  const avgScore = total > 0
    ? Math.round(inspections.reduce((acc, curr) => acc + (curr.summary?.score || 0), 0) / total)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Legal Metrology Inspector Workstation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated label declaration verification & deterministic compliance engine (PCR 2011 Rules)
          </p>
        </div>
        <Link
          to="/inspections/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Inspection
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inspections</span>
            <ClipboardCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100">{total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Persisted in enforcement database</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-rose-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Violations Flagged</span>
            <AlertOctagon className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-400">{violationsCount}</div>
          <p className="text-[11px] text-rose-400/70 mt-1">Packages with mandatory rule fails</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{pendingReviewCount}</div>
          <p className="text-[11px] text-amber-400/70 mt-1">Awaiting human officer verification</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Assessment Score</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{avgScore}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Software assessment metric</p>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-100">Recent Commodity Inspections</h3>
            <p className="text-xs text-slate-400 mt-0.5">Surveillance and packaged commodity label scans</p>
          </div>
          <Link to="/inspections" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View Complete History <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-6 py-3.5">Reference ID</th>
                <th className="px-6 py-3.5">Establishment / Premises</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Outcome Status</th>
                <th className="px-6 py-3.5">Score</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Loading inspections...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No inspections recorded yet. Click "Start New Inspection" to begin.
                  </td>
                </tr>
              ) : (
                inspections.map((insp) => (
                  <tr key={insp._id || insp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-400">
                      {insp.referenceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {insp.establishmentName}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {insp.commodityCategory || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={insp.summary?.overallStatus || 'UNKNOWN'} size="sm" />
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                      {insp.summary?.score ?? 0}%
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(insp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/inspections/${insp._id || insp.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

