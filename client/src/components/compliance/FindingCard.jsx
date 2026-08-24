import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { BookOpen, AlertCircle, Eye } from 'lucide-react';

export function FindingCard({ finding, onInspectEvidence }) {
  const hasEvidence = finding.evidenceRefs && finding.evidenceRefs.length > 0;
  const isViolation = finding.status === 'FAIL';
  const isReview = finding.status === 'REVIEW' || finding.status === 'UNKNOWN';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isViolation
        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
        : isReview
        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {finding.ruleId}
            </span>
            <h4 className="font-semibold text-slate-100 text-sm">{finding.ruleTitle}</h4>
          </div>
          <p className="text-xs text-brand-400/90 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {finding.legalSource?.rule} — {finding.legalSource?.clause || finding.legalSource?.instrument}
          </p>
        </div>
        <StatusBadge status={finding.status} size="sm" />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">{finding.explanation}</p>

      {(finding.expected || finding.observed) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 mb-3">
          {finding.expected && (
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Legal Requirement</span>
              <span className="text-slate-300">{finding.expected}</span>
            </div>
          )}
          {finding.observed && (
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Observed Evidence</span>
              <span className={isViolation ? 'text-rose-300 font-medium' : 'text-slate-300'}>{finding.observed}</span>
            </div>
          )}
        </div>
      )}

      {hasEvidence && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-[11px] text-slate-400">
            {finding.evidenceRefs.length} Visual Evidence Region(s) linked
          </span>
          <button
            onClick={() => onInspectEvidence(finding.evidenceRefs[0])}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-medium border border-brand-500/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Locate on Evidence
          </button>
        </div>
      )}
    </div>
  );
}

