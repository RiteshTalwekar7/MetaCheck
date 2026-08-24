import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export function FieldCorrectionModal({ isOpen, onClose, fieldPath, currentFact, onSave, isSubmitting }) {
  if (!isOpen) return null;

  const [value, setValue] = useState(
    typeof currentFact === 'object' && currentFact !== null ? currentFact.raw || currentFact.value || '' : currentFact || ''
  );
  const [unit, setUnit] = useState(currentFact?.unit || 'g');
  const [reason, setReason] = useState('Physical packaging verification confirmed legible declaration');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      fieldPath,
      value,
      unit: fieldPath === 'netQuantity' ? unit : undefined,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-100">Officer Field Verification & Correction</h3>
            <p className="text-xs text-slate-400">Target Field: <span className="font-mono text-brand-400">{fieldPath}</span></p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Human officer corrections are recorded with timestamp and reason in the audit trail. The deterministic compliance engine will automatically re-evaluate all affected rules.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Verified Value
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter verified value"
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
              {fieldPath === 'netQuantity' && (
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-brand-500 font-mono"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="N">N (Units)</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Verification Justification / Audit Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-brand-500 mb-2"
            >
              <option value="Physical packaging verification confirmed legible declaration">Physical packaging verification confirmed declaration</option>
              <option value="OCR misread low-contrast text on curved panel">OCR misread low-contrast text on curved panel</option>
              <option value="Corrected metric unit abbreviation">Corrected metric unit abbreviation</option>
              <option value="Clarified manufacturer complete address">Clarified manufacturer complete address</option>
              <option value="Other officer verification reason">Other officer verification reason</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Re-evaluating...' : 'Apply Correction & Re-evaluate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

