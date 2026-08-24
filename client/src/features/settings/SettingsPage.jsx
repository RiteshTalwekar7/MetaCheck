import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Settings, ShieldCheck, Cpu, Database } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">System & Engine Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Inspection parameters, active ruleset configuration, and officer credentials.</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Active Legal Metrology Rule Registry
          </h3>
          <p className="text-xs text-slate-400 mb-3">Version locked for reproducible legal evaluations.</p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-brand-400 font-bold">
            PCR-INDIA-2026-08-v1 (Legal Metrology Packaged Commodities Rules 2011 + Gazette Amendments)
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" />
            AI Extraction Adapter
          </h3>
          <p className="text-xs text-slate-400 mb-3">Multimodal OCR and bounding box extraction subsystem.</p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex justify-between">
            <span>Configured Engine:</span>
            <span className="text-emerald-400 font-bold">Dual Mode (Gemini 2.5 Flash + Deterministic Mock)</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            Logged-In Officer Profile
          </h3>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="text-slate-200 font-semibold">{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="text-slate-200 font-mono">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Role:</span> <span className="text-brand-400 font-bold">{user?.role}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Badge ID:</span> <span className="text-slate-200 font-mono">{user?.badgeNumber || 'LM-DEL-8942'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

