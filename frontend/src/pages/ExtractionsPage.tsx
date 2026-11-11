import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Download, FileText, CheckCircle2, GitCommit, Sparkles, Trash2, Upload } from 'lucide-react';
import { api } from '../services/api';
import { ExtractionListItem, SampleStatus } from '../types';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { BenchmarkExtractionBanner } from '../components/extraction/BenchmarkExtractionBanner';

export const ExtractionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [extractions, setExtractions] = useState<ExtractionListItem[]>([]);
  const [sampleStatus, setSampleStatus] = useState<SampleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const fetchExtractions = async () => {
    try {
      const [extData, samplesData] = await Promise.all([
        api.getExtractions(),
        api.getSampleStatus(),
      ]);
      setExtractions(extData);
      setSampleStatus(samplesData);
    } catch (err: any) {
      showToast('Failed to load extractions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtractions();
  }, []);

  const handleLoadSamples = async () => {
    setIsSampleLoading(true);
    try {
      showToast('Loading benchmark reference bids...', 'info');
      const res = await api.loadSamples();
      showToast(res.message, 'success');
      await fetchExtractions();
    } catch (err: any) {
      showToast(err.message || 'Failed to load samples', 'error');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleClearSamples = async () => {
    setIsSampleLoading(true);
    try {
      showToast('Clearing reference benchmark bids...', 'info');
      const res = await api.clearSamples();
      showToast(res.message, 'success');
      await fetchExtractions();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear samples', 'error');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleClearAllExtractions = async () => {
    try {
      const res = await api.clearExtractions();
      showToast(res.message, 'success');
      await fetchExtractions();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear extractions', 'error');
    }
  };

  const handleDownload = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const record = await api.getExtraction(id);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record.raw_json, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${id}_procurement_fields.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Downloaded ${id} JSON`, 'success');
    } catch (err) {
      showToast('Download failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Extraction Records</h1>
          <p className="text-sm text-slate-400 mt-1">
            Machine-readable 20-field procurement extractions validated against Pydantic schemas with full document grounding.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {extractions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllExtractions}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear Extractions
            </Button>
          )}
          <Button onClick={() => navigate('/')} icon={<Layers className="w-4 h-4" />}>
            Run Custom Analysis
          </Button>
        </div>
      </div>

      {/* Benchmark Reference Sample Bids Option */}
      <BenchmarkExtractionBanner
        hasLoadedSamples={Boolean(sampleStatus?.samples_loaded)}
        isLoading={isSampleLoading}
        onLoadSamples={handleLoadSamples}
        onClearSamples={handleClearSamples}
      />

      {/* Extractions Grid */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : extractions.length === 0 ? (
        <div className="p-12 text-center bg-[#0e131f] rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-4">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-slate-200">No extraction records yet</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Analyze your first custom RFP package to generate structured 20-field intelligence, or load benchmark sample records.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="sm" onClick={() => navigate('/')} icon={<Upload className="w-3.5 h-3.5" />}>
              Analyze Custom Documents
            </Button>
            <Button size="sm" variant="outline" loading={isSampleLoading} onClick={handleLoadSamples} icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}>
              Load Benchmark Bids
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {extractions.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/extractions/${item.id}`)}
              className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#07090e] text-emerald-300 border border-emerald-500/30">
                    {item.bid_number || item.bid_id.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    20 Fields Extracted
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-semibold text-slate-200">{item.company_name}</p>
                  <p>Due Date: <span className="font-semibold text-emerald-300">{item.due_date}</span></p>
                  <p>{item.source_documents_count} source documents evaluated</p>
                </div>

                {item.conflict_resolutions_count > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                    <GitCommit className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {item.conflict_resolutions_count} addendum amendment(s) superseded earlier solicitation values
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDownload(item.id, e)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export JSON
                </Button>

                <div className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  <span>View Full Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
