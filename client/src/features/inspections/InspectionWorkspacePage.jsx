import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { EvidenceViewer } from '../../components/evidence/EvidenceViewer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FindingCard } from '../../components/compliance/FindingCard';
import { FieldCorrectionModal } from './FieldCorrectionModal';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Download,
  ShieldAlert,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Building,
  User,
  History,
  Layers
} from 'lucide-react';

export function InspectionWorkspacePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [activeEvidenceId, setActiveEvidenceId] = useState(null);
  const [highlightBbox, setHighlightBbox] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'declarations' | 'audit'

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState(null);

  const { data: inspectionRes, isLoading, error } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => api.get(`/inspections/${id}`),
  });

  const inspection = inspectionRes?.data?.inspection;

  // Mutation for Field Correction
  const correctFieldMutation = useMutation({
    mutationFn: (data) => api.post(`/inspections/${id}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection', id]);
      setCorrectionTarget(null);
    },
  });

  // Mutation for Finalizing Review
  const finalizeMutation = useMutation({
    mutationFn: () => api.post(`/inspections/${id}/finalize-review`),
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection', id]);
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Loading inspection workspace...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Inspection Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Unable to locate the requested inspection record.</p>
        <Link to="/inspections" className="mt-4 inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to History
        </Link>
      </div>
    );
  }

  const findings = inspection.ruleEvaluations || [];
  const facts = inspection.normalizedFacts || {};
  const summary = inspection.summary || {};
  const evidenceList = inspection.evidence || [];

  const handleInspectEvidence = (evidenceRef) => {
    if (evidenceRef?.evidenceId) {
      setActiveEvidenceId(evidenceRef.evidenceId);
    }
    if (evidenceRef?.bbox) {
      setHighlightBbox(evidenceRef.bbox);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/v1/inspections/${id}/report`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/inspections" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-400">{inspection.referenceNumber}</span>
              <StatusBadge status={summary.overallStatus || inspection.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{inspection.establishmentName}</span> •
              <span>{inspection.commodityCategory}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Official Report
          </button>

          {inspection.status !== 'FINALIZED' && (
            <button
              onClick={() => finalizeMutation.mutate()}
              disabled={finalizeMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {finalizeMutation.isPending ? 'Finalizing...' : 'Mark Finalized'}
            </button>
          )}
        </div>
      </div>

      {/* Statutory AI Boundary Notice Banner */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 px-4 py-3 rounded-r-xl flex items-start gap-3 text-xs text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold">AI-Assisted Inspection Assessment Notice:</span> Findings are generated via optical text extraction and deterministic rule engine evaluation. This software does not issue legally binding judicial determinations under the Legal Metrology Act, 2009. Inspecting officers must verify evidence before issuing notices.
        </div>
      </div>

      {/* Two-Column Inspection Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Evidence Viewer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="h-[560px]">
            <EvidenceViewer
              evidenceList={evidenceList}
              activeEvidenceId={activeEvidenceId || evidenceList[0]?.evidenceId}
              onSelectEvidence={(eid) => {
                setActiveEvidenceId(eid);
                setHighlightBbox(null);
              }}
              highlightBbox={highlightBbox}
            />
          </div>

          {/* Quick Metadata Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Inspecting Officer:</span>
              <span className="text-slate-200 font-semibold">{inspection.officerName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Active Rule-Set:</span>
              <span className="font-mono text-brand-400">{inspection.ruleSetVersion || 'PCR-INDIA-2026-08-v1'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>AI Provider Engine:</span>
              <span className="font-mono text-slate-300">{inspection.extractionSnapshot?.provider || 'Mock Engine'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Compliance Findings & Declarations (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Assessment Score Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-2xl font-bold font-mono text-emerald-400">{summary.score || 0}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Score</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100">Deterministic Compliance Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Resolved Checks: <b className="text-slate-200">{summary.resolvedChecks || 0} / {summary.totalChecks || 10}</b>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-emerald-400 font-semibold">✓ {summary.passedChecks || 0} Passed</span>
                  <span className="text-rose-400 font-semibold">✗ {summary.failedChecks || 0} Violations</span>
                  <span className="text-amber-400 font-semibold">⚠ {(summary.reviewChecks || 0) + (summary.unknownChecks || 0)} Review</span>
                </div>
              </div>
            </div>

            <StatusBadge status={summary.overallStatus || 'UNKNOWN'} size="lg" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('findings')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${activeTab === 'findings' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Legal Rule Findings ({findings.length})
            </button>
            <button
              onClick={() => setActiveTab('declarations')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${activeTab === 'declarations' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              Extracted Declarations
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${activeTab === 'audit' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Trail ({inspection.auditTrail?.length || 0})
            </button>
          </div>

          {/* Tab 1: Findings List */}
          {activeTab === 'findings' && (
            <div className="space-y-3.5">
              {findings.map((f) => (
                <FindingCard
                  key={f.ruleId}
                  finding={f}
                  onInspectEvidence={handleInspectEvidence}
                />
              ))}
            </div>
          )}

          {/* Tab 2: Extracted Declarations Table */}
          {activeTab === 'declarations' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="font-semibold text-slate-300">Mandatory Declaration Field</span>
                <span className="font-semibold text-slate-300">Observed Value & Officer Action</span>
              </div>

              {[
                { label: 'Commodity Generic Name', key: 'genericName', fact: facts.genericName },
                { label: 'Manufacturer Declaration', key: 'manufacturer', fact: facts.manufacturer },
                { label: 'Net Quantity', key: 'netQuantity', fact: facts.netQuantity },
                { label: 'Maximum Retail Price (MRP)', key: 'mrp', fact: facts.mrp },
                { label: 'Unit Sale Price (USP)', key: 'unitSalePrice', fact: facts.unitSalePrice },
                { label: 'Manufacturing Date', key: 'manufactureDate', fact: facts.manufactureDate },
                { label: 'Consumer Helpline & Email', key: 'consumerCare', fact: facts.consumerCare },
                { label: 'Country of Origin', key: 'countryOfOrigin', fact: facts.countryOfOrigin },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{item.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {typeof item.fact === 'object' && item.fact !== null
                        ? item.fact.raw || item.fact.formatted || JSON.stringify(item.fact)
                        : item.fact || '<Not detected>'}
                    </span>
                  </div>
                  <button
                    onClick={() => setCorrectionTarget({ fieldPath: item.key, currentFact: item.fact })}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-brand-400" />
                    Verify / Correct
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Audit Trail */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              {(inspection.auditTrail || []).map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-400 font-mono">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-300">By: <b className="text-slate-100">{log.performedBy}</b></div>
                  {log.details && (
                    <pre className="text-[10px] text-slate-400 font-mono bg-slate-900 p-1.5 rounded overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Field Correction Modal */}
      <FieldCorrectionModal
        isOpen={Boolean(correctionTarget)}
        onClose={() => setCorrectionTarget(null)}
        fieldPath={correctionTarget?.fieldPath}
        currentFact={correctionTarget?.currentFact}
        onSave={(data) => correctFieldMutation.mutate(data)}
        isSubmitting={correctFieldMutation.isPending}
      />
    </div>
  );
}

