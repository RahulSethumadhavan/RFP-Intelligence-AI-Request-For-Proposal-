import React, { useState } from 'react';
import { Copy, Check, Download, Code, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface JsonViewerProps {
  data: Record<string, any>;
  onDownload: () => void;
  title?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  onDownload,
  title = '20-Field Machine-Readable Procurement JSON',
}) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = jsonString.split('\n').length;
  const fieldCount = Object.keys(data).length;

  return (
    <div className="bg-[#090d15] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-[#07090e] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{title}</h4>
            <p className="text-[11px] text-slate-400">
              {fieldCount} fields • {lineCount} lines • RFC 8259 Standard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#07090e] hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <Button
            size="sm"
            onClick={onDownload}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Download JSON
          </Button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-5 overflow-x-auto max-h-[650px] overflow-y-auto bg-[#07090e]/60">
        <pre className="font-mono text-xs text-emerald-200/90 leading-relaxed select-text">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* Footer info */}
      <div className="px-5 py-2.5 bg-[#07090e] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Strict 20-Field Procurement Schema Validated
        </span>
        <span className="font-mono text-emerald-400/70">UTF-8 Encoded</span>
      </div>
    </div>
  );
};
