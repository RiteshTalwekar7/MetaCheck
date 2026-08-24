import React from 'react';

export function ConfidenceBadge({ confidence }) {
  if (confidence === null || confidence === undefined) return null;

  const percentage = Math.round(confidence * 100);
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let band = 'High';

  if (percentage < 70) {
    color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    band = 'Low';
  } else if (percentage < 90) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    band = 'Medium';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${color}`} title={`AI extraction confidence: ${percentage}% (${band})`}>
      OCR Conf: {percentage}%
    </span>
  );
}

