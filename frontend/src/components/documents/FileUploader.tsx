import React, { useState, useRef } from 'react';
import { Upload, FileText, Globe, X, CheckCircle2, AlertCircle, ArrowRight, Folder } from 'lucide-react';
import { Button } from '../common/Button';

interface FileUploaderProps {
  onUploadAndAnalyze: (files: File[], group?: string) => Promise<void>;
  isProcessing?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadAndAnalyze,
  isProcessing = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [packageName, setPackageName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const valid: File[] = [];
    const allowed = ['.pdf', '.html', '.htm', '.txt', '.text'];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        setErrorMsg(`Unsupported file '${file.name}'. Supported formats: PDF, HTML, and Text (.txt, .text).`);
        return;
      }
      if (selectedFiles.some((f) => f.name === file.name)) {
        return;
      }
      valid.push(file);

      // If user uploaded via webkitdirectory, auto-infer the folder name as packageName if not set
      if (!packageName && (file as any).webkitRelativePath) {
        const rootFolder = (file as any).webkitRelativePath.split('/')[0];
        if (rootFolder && rootFolder !== file.name) {
          setPackageName(rootFolder);
        }
      }
    });

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = async () => {
    if (!selectedFiles.length) return;
    await onUploadAndAnalyze(selectedFiles, packageName.trim() || undefined);
  };

  return (
    <div className="bg-[#0e131f] rounded-xl border border-slate-800/90 p-6 shadow-md space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h3 className="text-base font-bold text-white tracking-tight">Analyze Bid Folder & Documents</h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload an entire bid folder or multi-document solicitation files (PDF, HTML, and Text) for ordered per-file extraction and automated 20-field synthesis.
        </p>
      </div>

      {/* Hidden Inputs for Files and Entire Folder */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".pdf,.html,.htm,.txt,.text"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) validateAndAddFiles(e.target.files);
        }}
      />
      <input
        type="file"
        ref={folderInputRef}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) validateAndAddFiles(e.target.files);
        }}
      />

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/20 glow-border-green'
            : 'border-slate-800 bg-[#090d15]/80 hover:bg-slate-900/60'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-950/40">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          Drop your bid folder or procurement files here
        </p>
        <p className="text-xs text-slate-400 mt-1 mb-4">Supports PDF (RFPs & Addenda), HTML web portal notices, and Text files</p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
          >
            <Folder className="w-4 h-4 text-emerald-400" />
            Upload Entire Bid Folder
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            Select Files
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs font-medium text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Files List with Order Badges */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span>Files to Extract in Order</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-mono text-[10px]">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </span>
            </span>
            <button
              onClick={() => {
                setSelectedFiles([]);
                setPackageName('');
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => {
              const ext = file.name.split('.').pop()?.toLowerCase();
              const isPdf = ext === 'pdf';
              const isText = ext === 'txt' || ext === 'text';
              const typeLabel = isPdf ? 'PDF' : isText ? 'TEXT' : 'HTML';

              const formattedSize = file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                : `${(file.size / 1024).toFixed(0)} KB`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/90 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className={`p-1.5 rounded-md ${
                      isPdf
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : isText
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                    }`}>
                      {isPdf ? <FileText className="w-4 h-4" /> : isText ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {typeLabel} • {formattedSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Package / Bid Name */}
          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Bid Folder Name / Output ID <span className="text-slate-500">(e.g. "Bid1", "City_Transit_2026", or leave blank for auto ID)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bid1, Dallas Computing Devices or leave blank"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-[#07090e] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
            <div className="text-xs text-slate-400">
              Each file will produce its own JSON in order (<code className="text-emerald-400">file.json</code>) inside the bid folder.
            </div>
            <Button
              onClick={handleAnalyze}
              loading={isProcessing}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Bid Folder ({selectedFiles.length} files)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

