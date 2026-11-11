import React from 'react';
import { FileText, ArrowRight, GitCommit, Copy, Check } from 'lucide-react';
import { ExtractionField } from '../../types';
import { StatusBadge } from './StatusBadge';

interface FieldRowProps {
  field: ExtractionField;
  onSelectField: (field: ExtractionField) => void;
  onViewResolution?: (field: ExtractionField) => void;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  onSelectField,
  onViewResolution,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(field.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuperseded = Boolean(field.updated_from);

  return (
    <div
      onClick={() => onSelectField(field)}
      className="group p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer border-b border-slate-800/60 last:border-0"
    >
      {/* Field Identification & Value */}
      <div className="space-y-1.5 flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">{field.label}</span>
          <span className="text-[10px] font-mono text-slate-400 bg-[#07090e] border border-slate-800 px-1.5 py-0.5 rounded">
            {field.field_name}
          </span>
          {isSuperseded && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onViewResolution && onViewResolution(field);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/60 hover:bg-amber-900/40 transition-colors cursor-pointer"
            >
              <GitCommit className="w-3 h-3 text-amber-400" />
              Updated by Addendum
            </span>
          )}
        </div>

        {/* Extracted Value with truncation / styling */}
        <p
          className={`text-xs leading-relaxed ${
            field.value === 'Not Specified'
              ? 'text-slate-500 italic'
              : 'text-slate-200 font-medium'
          }`}
        >
          {field.value}
        </p>

        {/* Source attribution line */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <FileText className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate max-w-xs text-slate-400">{field.source_document}</span>
          {field.page_number && <span className="text-slate-500">• Page {field.page_number}</span>}
        </div>
      </div>

      {/* Status & Actions Column */}
      <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
        <StatusBadge status={field.status} />

        <button
          onClick={handleCopy}
          title="Copy extracted value"
          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectField(field);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20"
        >
          <span>Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
