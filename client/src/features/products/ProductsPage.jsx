import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Package, ShieldCheck } from 'lucide-react';

export function ProductsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['products-catalog'],
    queryFn: () => api.get('/inspections?limit=50'),
  });

  const inspections = res?.data || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Packaged Commodity Declarations Catalog</h1>
        <p className="text-xs text-slate-400 mt-1">Indexed repository of inspected commodities and packaging declarations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading catalog...</div>
        ) : inspections.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">No packaged products indexed yet.</div>
        ) : (
          inspections.map((insp) => {
            const facts = insp.normalizedFacts || {};
            return (
              <div key={insp._id || insp.id} className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{facts.productName || insp.establishmentName}</h3>
                    <p className="text-xs text-brand-400">{facts.genericName || insp.commodityCategory}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] rounded">
                    {insp.referenceNumber}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between"><span className="text-slate-500">Net Qty:</span> <span className="text-slate-300 font-mono">{facts.netQuantity?.raw || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">MRP:</span> <span className="text-slate-300 font-mono">{facts.mrp?.raw || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Mfg Date:</span> <span className="text-slate-300 font-mono">{facts.manufactureDate?.formatted || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Origin:</span> <span className="text-slate-300">{facts.countryOfOrigin || 'India'}</span></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

