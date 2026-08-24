import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, MinusCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || 'UNKNOWN').toUpperCase();

  const configs = {
    PASS: {
      label: 'COMPLIANT (PASS)',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    FAIL: {
      label: 'VIOLATION (FAIL)',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: XCircle,
    },
    REVIEW: {
      label: 'REVIEW REQUIRED',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    },
    UNKNOWN: {
      label: 'NOT DETECTED / UNKNOWN',
      bg: 'bg-slate-700/20 text-slate-400 border-slate-700/50',
      icon: HelpCircle,
    },
    NOT_APPLICABLE: {
      label: 'NOT APPLICABLE',
      bg: 'bg-zinc-800/30 text-zinc-500 border-zinc-700/30',
      icon: MinusCircle,
    },
  };

  const current = configs[normalized] || configs.UNKNOWN;
  const Icon = current.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} tracking-wide`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
}

