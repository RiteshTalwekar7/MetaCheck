import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function NewInspectionPage() {
  const navigate = useNavigate();

  // Form State
  const [establishmentName, setEstablishmentName] = useState('');
  const [location, setLocation] = useState('');
  const [commodityCategory, setCommodityCategory] = useState('Biscuits & Confectionery');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setFiles(prev => [...prev, ...selected].slice(0, 6));

    // Generate previews
    const newPreviews = selected.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 6));
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickDemoSetup = (category, estName) => {
    setEstablishmentName(estName);
    setLocation('Connaught Place, New Delhi');
    setCommodityCategory(category);
    setNotes('Demo surveillance inspection of packaged goods');

    // Create a 1x1 demo placeholder image file
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 400;
    demoCanvas.height = 300;
    const ctx = demoCanvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(category, 30, 80);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Legal Metrology Package Inspection Evidence', 30, 120);

    demoCanvas.toBlob((blob) => {
      const demoFile = new File([blob], `${category.toLowerCase().replace(/\s+/g, '_')}_label.png`, { type: 'image/png' });
      setFiles([demoFile]);
      setPreviews([URL.createObjectURL(demoFile)]);
    }, 'image/png');
  };

  const handleSubmitAndAnalyze = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one product label photo.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Step 1: Create draft inspection
      setProgressStage('1/3: Initializing Inspection Draft...');
      const draftRes = await api.post('/inspections', {
        establishmentName,
        location,
        commodityCategory,
        notes,
      });
      const inspectionId = draftRes.data.inspection._id || draftRes.data.inspection.id;

      // Step 2: Upload evidence images
      setProgressStage('2/3: Uploading Evidence Photographs...');
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      await api.post(`/inspections/${inspectionId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 3: Run AI Multimodal Extraction & Deterministic Rule Evaluation
      setProgressStage('3/3: AI Extraction & Legal Metrology Rule Evaluation...');
      await api.post(`/inspections/${inspectionId}/analyze`);

      // Finished -> navigate to inspection workspace
      navigate(`/inspections/${inspectionId}`);
    } catch (err) {
      setError(err.message || 'An error occurred during inspection analysis.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">New Packaged Commodity Inspection</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload product photographs for automated OCR declaration extraction and legal compliance analysis.
        </p>
      </div>

      {/* Quick Demo Pre-fills */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="font-semibold">Quick Test Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoSetup('Biscuits & Confectionery', 'Royal Foods Superstore')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
          >
            ✓ Compliant FMCG Biscuit
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoSetup('Edible Oil', 'Kisan Agro Traders')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
          >
            ✗ Missing MRP / USP Oil
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoSetup('Imported Chocolates', 'Duty Free World Outlet')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
          >
            ✗ Imported without Importer
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitAndAnalyze} className="space-y-6">
        {/* Step 1: Establishment Metadata */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3">
            1. Inspection & Establishment Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Establishment / Retailer Name *
              </label>
              <input
                type="text"
                required
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                placeholder="e.g. Metro Cash & Carry Retail Ltd"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Jurisdiction / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. South Extension, New Delhi"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Commodity Category
              </label>
              <select
                value={commodityCategory}
                onChange={(e) => setCommodityCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Biscuits & Confectionery">Biscuits & Confectionery</option>
                <option value="Edible Oil">Edible Oil</option>
                <option value="Packaged Spices & Condiments">Packaged Spices & Condiments</option>
                <option value="Imported Chocolates & Food">Imported Chocolates & Food</option>
                <option value="General Packaged Commodity">General Packaged Commodity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Inspection Notes / Surveillance Ref
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Routine market check as per DCA schedule"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Evidence Upload */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>2. Upload Package Evidence Photographs (Max 6)</span>
            <span className="text-xs text-slate-400 font-normal">{files.length} / 6 selected</span>
          </h3>

          <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl p-8 text-center bg-slate-950/40 transition-colors">
            <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop product photos or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, WEBP (front, back, and side panels for complete declarations)
            </p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="mt-4 inline-block text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
            />
          </div>

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-950">
                  <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-[10px] font-mono px-1.5 rounded text-slate-300">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Run Analysis */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isProcessing || files.length === 0}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-xl shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>{progressStage}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI-Assisted Compliance Analysis</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

