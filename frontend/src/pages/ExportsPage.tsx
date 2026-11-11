import React, { useState, useEffect } from 'react';
import { Download, FileJson, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { ExtractionListItem } from '../types';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';

export const ExportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [extractions, setExtractions] = useState<ExtractionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await api.getExtractions();
        setExtractions(data);
      } catch (err) {
        showToast('Failed to load export records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const handleDownload = async (id: string, type: 'json' | 'audit') => {
    try {
      const record = await api.getExtraction(id);
      const content = type === 'json' ? record.raw_json : record.audit_json || record.raw_json;
      const filename = type === 'json' ? `${id}_procurement_fields.json` : `${id}_audit_trail.json`;

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(`Exported ${filename}`, 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Exports & Artifacts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Download standardized 20-field machine-readable JSON exports and extended provenance audit trails.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : extractions.length === 0 ? (
        <div className="p-12 text-center bg-[#0e131f] rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
          No exportable extractions available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {extractions.map((item) => (
            <div
              key={item.id}
              className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <FileJson className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#07090e] border border-emerald-500/30 text-emerald-300">
                      {item.bid_id.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      20 Fields Standardized
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400">
                    File: <span className="font-mono text-slate-300">{item.bid_id}.json</span> • Created:{' '}
                    {new Date(item.created_at).toLocaleDateString()} • Format: RFC 8259 JSON
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(item.id, 'audit')}
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                >
                  Audit Trace JSON
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(item.id, 'json')}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download JSON
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
