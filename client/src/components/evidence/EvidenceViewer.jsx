import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Eye, Layers } from 'lucide-react';

export function EvidenceViewer({ evidenceList = [], activeEvidenceId, onSelectEvidence, highlightBbox = null }) {
  const [zoom, setZoom] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const containerRef = useRef(null);

  const activeEvidence = evidenceList.find(e => e.evidenceId === activeEvidenceId) || evidenceList[0];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="h-96 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-6 bg-slate-900/30">
        <ImageIcon className="w-12 h-12 mb-3 text-slate-600" />
        <p className="text-sm font-medium">No Evidence Images Uploaded</p>
        <p className="text-xs text-slate-600 mt-1">Upload package images to inspect visual label declarations.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Viewer Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Evidence Viewer</span>
          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono text-[10px]">
            {activeEvidence?.originalFilename || 'Image'}
          </span>
          <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded text-[10px] font-mono">
            {activeEvidence?.quality || 'GOOD'} Quality
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] border transition-colors ${showBoxes ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            title="Toggle Bounding Boxes"
          >
            <Layers className="w-3.5 h-3.5" />
            Boxes
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button onClick={handleZoomOut} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 text-[11px] font-mono text-slate-400 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleResetZoom} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Reset Zoom">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Canvas Area */}
      <div ref={containerRef} className="relative flex-1 min-h-[420px] max-h-[600px] overflow-auto flex items-center justify-center p-4 bg-slate-950/60">
        {activeEvidence ? (
          <div className="relative inline-block transition-transform duration-150" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <img
              src={activeEvidence.base64Data || `/api/v1/inspections/${activeEvidence.inspectionId}/evidence/${activeEvidence.evidenceId}`}
              alt="Evidence Package"
              className="max-w-full max-h-[520px] rounded shadow-lg object-contain select-none pointer-events-none"
            />

            {/* Bounding Box Overlay */}
            {showBoxes && highlightBbox && (
              <div
                className="absolute border-2 border-brand-400 bg-brand-500/20 rounded shadow-[0_0_15px_rgba(14,140,231,0.5)] transition-all pointer-events-none animate-pulse"
                style={{
                  top: `${highlightBbox.y * 100}%`,
                  left: `${highlightBbox.x * 100}%`,
                  width: `${highlightBbox.width * 100}%`,
                  height: `${highlightBbox.height * 100}%`,
                }}
              >
                <span className="absolute -top-6 left-0 bg-brand-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow">
                  OCR Region
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Thumbnail Bar */}
      {evidenceList.length > 1 && (
        <div className="flex items-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800 overflow-x-auto">
          {evidenceList.map((e, idx) => (
            <button
              key={e.evidenceId}
              onClick={() => onSelectEvidence(e.evidenceId)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${(activeEvidence?.evidenceId === e.evidenceId) ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
            >
              <img src={e.base64Data} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 bg-slate-900/90 text-slate-300 text-[9px] font-mono px-1 rounded-tl">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

