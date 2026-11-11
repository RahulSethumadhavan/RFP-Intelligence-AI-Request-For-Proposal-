import React, { useState } from 'react';
import {
  FileText,
  Globe,
  Download,
  Copy,
  Check,
  ArrowRight,
  Folder,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FileExtractionItem } from '../../types';
import { useToast } from '../common/Toast';

interface OrderedFilesFlowProps {
  bidId: string;
  files: FileExtractionItem[];
  onDownloadZip?: () => void;
}

export const OrderedFilesFlow: React.FC<OrderedFilesFlowProps> = ({
  bidId,
  files,
  onDownloadZip,
}) => {
  const { showToast } = useToast();
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [expandedFile, setExpandedFile] = useState<number | null>(files.length > 0 ? 1 : null);

  const handleCopyJson = (file: FileExtractionItem) => {
    const text = JSON.stringify(file.fields, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedFile(file.json_filename);
    showToast(`Copied ${file.json_filename} to clipboard.`, 'success');
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadSingleJson = (file: FileExtractionItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(file.fields, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', file.json_filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Downloaded ${file.json_filename}`, 'success');
  };

  if (!files || files.length === 0) {
    return (
      <div className="bg-[#0e131f] rounded-2xl border border-slate-800 p-8 text-center space-y-3">
        <Folder className="w-10 h-10 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">No per-file breakdown available for this package</h4>
        <p className="text-xs text-slate-400">
          Re-analyze the bid folder to automatically generate individual JSON extractions for each file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Flow Header */}
      <div className="bg-[#0e131f] rounded-2xl border border-slate-800/90 p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Bid Folder Ordered Extraction Flow
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All <strong className="text-emerald-400">{files.length} documents</strong> inside folder{' '}
              <span className="font-mono text-slate-200">"{bidId}"</span> were analyzed in order, generating corresponding JSONs.
            </p>
          </div>

          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer self-start sm:self-center"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download All Folder JSONs (.ZIP)
            </button>
          )}
        </div>

        {/* Stepper / Flow Diagram */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max py-2">
            <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Input: {bidId}/</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {files.map((file, idx) => {
              const isPdf = file.file_type === 'PDF';
              const isText = file.file_type === 'TEXT';
              const isExpanded = expandedFile === file.order;

              return (
                <React.Fragment key={file.order}>
                  <button
                    onClick={() => setExpandedFile(isExpanded ? null : file.order)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white shadow-md'
                        : 'bg-[#090d15] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                      {file.order}
                    </span>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-slate-200 truncate max-w-[140px]" title={file.filename}>
                        {file.filename}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        → {file.json_filename}
                      </div>
                    </div>
                  </button>

                  {idx < files.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ordered File Detail Cards */}
      <div className="space-y-4">
        {files.map((file) => {
          const isPdf = file.file_type === 'PDF';
          const isText = file.file_type === 'TEXT';
          const isExpanded = expandedFile === file.order;
          const fieldsCount = Object.keys(file.fields || {}).length;
          const verifiedCount = Object.values(file.fields || {}).filter((v) => v && v !== 'Not Specified').length;

          return (
            <div
              key={file.order}
              className={`bg-[#0e131f] rounded-xl border transition-all overflow-hidden ${
                isExpanded ? 'border-emerald-500/50 shadow-lg' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedFile(isExpanded ? null : file.order)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer bg-slate-900/60 hover:bg-slate-900/90 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                    #{file.order}
                  </span>

                  <div className={`p-2 rounded-lg shrink-0 ${
                    isPdf
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      : isText
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                  }`}>
                    {isPdf ? <FileText className="w-4 h-4" /> : isText ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate" title={file.filename}>
                        {file.filename}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {file.file_type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        {file.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>
                        Output JSON: <strong className="font-mono text-emerald-400">{file.json_filename}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        <strong className="text-white">{verifiedCount}</strong> / {fieldsCount || 20} fields extracted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyJson(file);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    title="Copy JSON to clipboard"
                  >
                    {copiedFile === file.json_filename ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingleJson(file);
                    }}
                    className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    title="Download individual JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download JSON</span>
                  </button>

                  <div className="p-1 text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Field Table & JSON preview */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 space-y-4 bg-[#090d15]/90">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      20 Procurement Fields Extracted from {file.filename}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      File #{file.order} of {files.length} in {bidId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(file.fields || {}).map(([key, val]) => {
                      const isNotSpec = !val || val === 'Not Specified';
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            isNotSpec
                              ? 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                              : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-400">{label}</span>
                            <span className="font-mono text-[10px] text-slate-500">{key}</span>
                          </div>
                          <div className={`font-medium break-words ${isNotSpec ? 'italic text-slate-500' : 'text-white'}`}>
                            {val || 'Not Specified'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
