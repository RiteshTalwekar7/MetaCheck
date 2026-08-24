import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Search, PlusCircle, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export function InspectionListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: ['inspections-list', search, status, page],
    queryFn: () => api.get(`/inspections?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=10`),
  });

  const inspections = res?.data || [];
  const meta = res?.meta || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Inspection History Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Search, filter, and review historical Legal Metrology compliance records.</p>
        </div>
        <Link
          to="/inspections/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Inspection
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Inspection ID, Establishment Name, Commodity..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="FINALIZED">Finalized</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="px-6 py-3.5">Reference ID</th>
              <th className="px-6 py-3.5">Establishment</th>
              <th className="px-6 py-3.5">Commodity Category</th>
              <th className="px-6 py-3.5">Compliance Status</th>
              <th className="px-6 py-3.5">Score</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">Loading directory...</td>
              </tr>
            ) : inspections.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">No inspections matching criteria.</td>
              </tr>
            ) : (
              inspections.map((insp) => (
                <tr key={insp._id || insp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">{insp.referenceNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{insp.establishmentName}</td>
                  <td className="px-6 py-4 text-slate-400">{insp.commodityCategory || 'General'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={insp.summary?.overallStatus || insp.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-300">{insp.summary?.score ?? 0}%</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{new Date(insp.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/inspections/${insp._id || insp.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Workspace
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Page {meta.page} of {meta.totalPages || 1}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= meta.totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

