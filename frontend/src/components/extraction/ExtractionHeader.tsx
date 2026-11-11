import React from 'react';
import { Download, Code, Table, GitCommit, Building2, Calendar, FileText, CheckCircle2, Folder, Archive } from 'lucide-react';
import { ExtractionRecord } from '../../types';
import { Button } from '../common/Button';

interface ExtractionHeaderProps {
  record: ExtractionRecord;
  viewMode: 'table' | 'files_order' | 'json';
  onToggleViewMode: (mode: 'table' | 'files_order' | 'json') => void;
  onDownloadJson: () => void;
  onDownloadZip?: () => void;
  onOpenConflictsModal: () => void;
}

export const ExtractionHeader: React.FC<ExtractionHeaderProps> = ({
  record,
  viewMode,
  onToggleViewMode,
  onDownloadJson,
  onDownloadZip,
  onOpenConflictsModal,
}) => {
  const hasConflicts = record.conflict_resolutions && record.conflict_resolutions.length > 0;
  const fileCount = record.files_in_order?.length || record.source_documents.length || 1;

  return (
    <div className="bg-[#0e131f] rounded-2xl border border-slate-800/90 p-6 shadow-md space-y-5">
      {/* Top Title & Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
              {record.bid_number || record.bid_id.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Extraction Complete
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/40">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              {fileCount} Files in Bid Folder
            </span>
            {hasConflicts && (
              <button
                onClick={onOpenConflictsModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/40 transition-colors cursor-pointer"
              >
                <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                <span>{record.conflict_resolutions.length} Addendum Overrides</span>
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
            {record.title}
          </h2>

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {record.company_name}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Due: <strong className="text-slate-300">{record.due_date || 'Not Specified'}</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {record.source_documents.length} Source Documents Evaluated
            </span>
          </div>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Table / Ordered Files / JSON Switcher */}
          <div className="p-1 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => onToggleViewMode('files_order')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'files_order' ? 'bg-emerald-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Ordered Files ({fileCount})</span>
            </button>
            <button
              onClick={() => onToggleViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'json' ? 'bg-emerald-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Consolidated JSON</span>
            </button>
          </div>

          {onDownloadZip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadZip}
              icon={<Archive className="w-4 h-4 text-emerald-400" />}
            >
              Export Folder (ZIP)
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadJson}
            icon={<Download className="w-4 h-4 text-emerald-400" />}
          >
            Download JSON
          </Button>
        </div>
      </div>


      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Fields</p>
          <p className="text-lg font-bold text-white mt-0.5 font-mono">{record.summary.total_fields} Analyzed</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Verified</p>
          <p className="text-lg font-bold text-emerald-300 mt-0.5 font-mono">{record.summary.verified}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Needs Review</p>
          <p className="text-lg font-bold text-amber-300 mt-0.5 font-mono">{record.summary.needs_review}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Not Specified</p>
          <p className="text-lg font-bold text-slate-300 mt-0.5 font-mono">{record.summary.not_specified}</p>
        </div>
      </div>
    </div>
  );
};
