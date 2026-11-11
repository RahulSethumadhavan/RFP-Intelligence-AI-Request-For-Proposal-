import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Globe, Search, Layers, Play, Upload, ArrowRight, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, SampleStatus } from '../types';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { BenchmarkReferenceCard } from '../components/documents/BenchmarkReferenceCard';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sampleStatus, setSampleStatus] = useState<SampleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const fetchDocs = async () => {
    try {
      const [docsData, samplesData] = await Promise.all([
        api.getDocuments(),
        api.getSampleStatus(),
      ]);
      setDocuments(docsData);
      setSampleStatus(samplesData);
    } catch (err: any) {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleLoadSamples = async () => {
    setIsSampleLoading(true);
    try {
      showToast('Loading benchmark reference bids...', 'info');
      const res = await api.loadSamples();
      showToast(res.message, 'success');
      await fetchDocs();
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
      await fetchDocs();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear samples', 'error');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleClearAllDocuments = async () => {
    try {
      const res = await api.clearDocuments();
      showToast(res.message, 'success');
      await fetchDocs();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear documents', 'error');
    }
  };

  const groups = Array.from(new Set(documents.map((d) => d.group))).filter(Boolean);

  const filteredDocs = documents.filter((doc) => {
    if (selectedGroup !== 'all' && doc.group !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return doc.filename.toLowerCase().includes(q) || doc.role.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAnalyzePackage = async (group: string) => {
    try {
      showToast(`Analyzing package '${group}'...`, 'info');
      const res = await api.startExtraction(group);
      navigate(`/processing/${res.job_id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to start analysis', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Procurement Documents</h1>
          <p className="text-sm text-slate-400 mt-1">
            Catalog of solicitation files, addenda, specification sheets, and online procurement notices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllDocuments}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear All Documents
            </Button>
          )}
          <Button onClick={() => navigate('/')} icon={<Upload className="w-4 h-4" />}>
            Upload Custom Files
          </Button>
        </div>
      </div>

      {/* Benchmark Reference Sample Bids Option */}
      <BenchmarkReferenceCard
        hasLoadedSamples={Boolean(sampleStatus?.samples_loaded)}
        isLoading={isSampleLoading}
        onLoadSamples={handleLoadSamples}
        onClearSamples={handleClearSamples}
      />

      {/* Filters Bar */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e131f] p-3 rounded-xl border border-slate-800 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by filename or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07090e] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedGroup === 'all'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#07090e] hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              All Packages ({documents.length})
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer transition-all ${
                  selectedGroup === g
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-[#07090e] hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {g} ({documents.filter((d) => d.group === g).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table */}
      {loading ? (
        <CardSkeleton />
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-[#0e131f] rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-4">
          <Upload className="w-10 h-10 mx-auto text-slate-600" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-slate-200">No documents in catalog</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Upload custom solicitation packages from the Dashboard, or load benchmark sample bids to test.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="sm" onClick={() => navigate('/')} icon={<Upload className="w-3.5 h-3.5" />}>
              Upload Custom RFPs
            </Button>
            <Button size="sm" variant="outline" loading={isSampleLoading} onClick={handleLoadSamples} icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}>
              Load Benchmark Bids
            </Button>
          </div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-[#0e131f] rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          No procurement documents match your search query "{searchQuery}".
        </div>
      ) : (
        <div className="bg-[#0e131f] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#07090e] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Package Group</th>
                  <th className="py-3 px-4">Role / Precedence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredDocs.map((doc) => {
                  const isPdf = doc.type === 'PDF';
                  const isAddendum = doc.role === 'ADDENDUM';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg shrink-0 border ${
                              isPdf
                                ? 'bg-rose-950/40 border-rose-800/50 text-rose-400'
                                : 'bg-blue-950/40 border-blue-800/50 text-blue-400'
                            }`}
                          >
                            {isPdf ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-md" title={doc.filename}>
                              {doc.filename}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {doc.formatted_size} {doc.pages ? `• ${doc.pages} page(s)` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {doc.type}
                      </td>

                      <td className="py-3.5 px-4 font-mono uppercase font-bold text-emerald-400">
                        {doc.group}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${
                            isAddendum
                              ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                              : doc.role === 'MAIN_SOLICITATION'
                              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                              : 'bg-[#07090e] border-slate-800 text-slate-400'
                          }`}
                        >
                          {doc.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Ready
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAnalyzePackage(doc.group)}
                          icon={<Play className="w-3 h-3 text-emerald-400" />}
                        >
                          Analyze
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
