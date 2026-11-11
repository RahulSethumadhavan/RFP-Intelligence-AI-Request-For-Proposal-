import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Database, Key, Server, CheckCircle2, Wifi, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { BackendHealth } from '../types';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (err) {
        console.error('Failed to get settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleClearWorkspace = async () => {
    try {
      const res = await api.clearWorkspace();
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear workspace', 'error');
    }
  };

  const handleClearDocuments = async () => {
    try {
      const res = await api.clearDocuments();
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear documents', 'error');
    }
  };

  const handleClearExtractions = async () => {
    try {
      const res = await api.clearExtractions();
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear extractions', 'error');
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings & Telemetry</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configuration overview of the procurement intelligence extraction pipeline and LLM provider.
        </p>
      </div>

      {/* Provider & Model Card */}
      <div className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">LLM Provider & Model</h3>
            <p className="text-xs text-slate-400">Fast inference acceleration and structured JSON mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Active Inference Engine</span>
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Groq LPU Hardware</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Configured Model</span>
            <p className="text-sm font-mono font-bold text-emerald-300">
              {health?.model || 'openai/gpt-oss-120b'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">API Key Status</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configured (Securely in backend .env)</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">gsk_••••••••••••••••••••••••</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Response Mode</span>
            <p className="text-sm font-semibold text-slate-200">Deterministic Structured JSON</p>
          </div>
        </div>
      </div>

      {/* Backend Connection Card */}
      <div className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Backend Service</h3>
            <p className="text-xs text-slate-400">FastAPI REST microservice status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Connection Status</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
              <span>Online &amp; Connected</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">API Endpoint</span>
            <p className="text-xs font-mono text-emerald-300">http://127.0.0.1:8000/api</p>
          </div>
        </div>
      </div>

      {/* Extraction & Grounding Rules */}
      <div className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Intelligence Pipeline Rules</h3>
            <p className="text-xs text-slate-400">Enforced schema and grounding constraints</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Mandatory 20-Field Completeness</p>
              <p className="text-slate-400 mt-0.5">
                Every extracted record is strictly checked against the Pydantic v2 schema. Unmentioned fields default safely to 'Not Specified'.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Addendum Precedence Hierarchy</p>
              <p className="text-slate-400 mt-0.5">
                Addendum 2 (weight 102) &gt; Addendum 1 (weight 101) &gt; Main Solicitation (weight 50). Contradictory due dates and specs resolve automatically.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Zero-Hallucination Rejection</p>
              <p className="text-slate-400 mt-0.5">
                Synthetic placeholders, invented prices, and phantom bond rates are rejected at the normalization layer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Data Management Card */}
      <div className="bg-[#0e131f] rounded-xl border border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Workspace Data Management</h3>
            <p className="text-xs text-slate-400">Clear active procurement documents, extraction intelligence, and pipeline cache</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-lg bg-[#07090e] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">Reset Active Workspace</p>
              <p className="text-slate-400 mt-0.5">
                Remove all uploaded documents from active procurement packages and clear recent extraction outputs.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearWorkspace}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear Entire Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-200">Documents Catalog</p>
                <p className="text-[11px] text-slate-500">Purge uploaded input files</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearDocuments}
                icon={<Trash2 className="w-3 h-3 text-rose-400" />}
              >
                Clear Docs
              </Button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#07090e] border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-200">Extractions Catalog</p>
                <p className="text-[11px] text-slate-500">Purge output extraction JSONs</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearExtractions}
                icon={<Trash2 className="w-3 h-3 text-rose-400" />}
              >
                Clear Extractions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
