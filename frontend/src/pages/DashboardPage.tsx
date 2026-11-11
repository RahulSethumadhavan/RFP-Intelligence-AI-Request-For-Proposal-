import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Plus,
  BarChart3,
  Upload,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { SystemStats, ExtractionListItem, DocumentItem } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentExtraction } from '../components/dashboard/RecentExtraction';
import { FileUploader } from '../components/documents/FileUploader';
import { DocumentGroup } from '../components/documents/DocumentGroup';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { CardSkeleton } from '../components/common/Skeleton';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [extractions, setExtractions] = useState<ExtractionListItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsData, extractionsData, docsData] = await Promise.all([
        api.getStats(),
        api.getExtractions(),
        api.getDocuments(),
      ]);
      setStats(statsData);
      setExtractions(extractionsData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUploadAndAnalyze = async (files: File[], group?: string) => {
    setIsProcessing(true);
    try {
      showToast(`Uploading ${files.length} document(s)...`, 'info');
      const uploadRes = await api.uploadDocuments(files, group);
      showToast('Documents uploaded. Starting AI extraction...', 'success');

      const analyzeRes = await api.startExtraction(uploadRes.detected_group);
      navigate(`/processing/${analyzeRes.job_id}`);
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleAnalyzeExistingGroup = async (groupId: string) => {
    setIsProcessing(true);
    try {
      showToast(`Starting analysis for package '${groupId}'...`, 'info');
      const analyzeRes = await api.startExtraction(groupId);
      navigate(`/processing/${analyzeRes.job_id}`);
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleClearWorkspace = async () => {
    try {
      const res = await api.clearWorkspace();
      showToast(res.message, 'success');
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear workspace data', 'error');
    }
  };

  // Group documents by group ID
  const groupedDocs = documents.reduce<Record<string, DocumentItem[]>>((acc, doc) => {
    const g = doc.group || 'default';
    if (!acc[g]) acc[g] = [];
    acc[g].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Custom Procurement Intelligence Engine • Groq LPU Powered
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">RFP Intelligence Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Extract, validate, and structure procurement fields from custom RFP documents with automated addendum hierarchy resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(documents.length > 0 || extractions.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearWorkspace}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear Active Data
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/extractions')}
            icon={<Layers className="w-4 h-4" />}
          >
            View Extractions
          </Button>
          <Button
            onClick={() => uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            icon={<Plus className="w-4 h-4" />}
          >
            Analyze Custom Documents
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Documents Processed"
            value={stats?.documents_processed || 0}
            subtext="Available in procurement catalog"
            icon={<FileText className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            label="Fields Extracted"
            value={stats?.fields_extracted || 0}
            subtext="20 structured fields per RFP"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            label="Needs Review"
            value={stats?.needs_review || 0}
            subtext="Items requiring analyst verification"
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          />
          <StatCard
            label="Extraction Status"
            value={`${stats?.structured_output_rate || 0}%`}
            subtext="Schema compliance rate"
            icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
          />
        </div>
      )}

      {/* Upload Zone Section */}
      <div ref={uploadSectionRef} className="space-y-4">
        <FileUploader
          onUploadAndAnalyze={handleUploadAndAnalyze}
          isProcessing={isProcessing}
        />
      </div>

      {/* Document Packages Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Procurement Packages</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-document solicitations grouped with legal authority weighting (Addenda &gt; Main Solicitation).
            </p>
          </div>
          <Link
            to="/documents"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {Object.keys(groupedDocs).length === 0 ? (
          <div className="p-8 text-center bg-[#0e131f] rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-3">
            <Upload className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">No active procurement packages</p>
            <p className="max-w-md mx-auto text-slate-500">
              Drag &amp; drop your RFP PDF or HTML files in the upload box above to create and analyze a custom package.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedDocs).map(([groupId, docs]) => (
              <DocumentGroup
                key={groupId}
                groupId={groupId}
                documents={docs}
                onAnalyzeGroup={handleAnalyzeExistingGroup}
                isAnalyzing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Extractions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Extraction Intelligence</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Completed 20-field procurement records with provenance and conflict logs.
            </p>
          </div>
          <Link
            to="/extractions"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all extractions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RecentExtraction extractions={extractions} />
      </div>
    </div>
  );
};
