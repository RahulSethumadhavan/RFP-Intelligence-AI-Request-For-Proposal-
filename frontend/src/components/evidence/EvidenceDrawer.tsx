import React, { useState } from 'react';
import { X, FileText, Copy, Check, ExternalLink, HelpCircle, GitCommit, SplitSquareVertical } from 'lucide-react';
import { ExtractionField } from '../../types';
import { StatusBadge } from '../extraction/StatusBadge';
import { Button } from '../common/Button';

interface EvidenceDrawerProps {
  field: ExtractionField | null;
  onClose: () => void;
  onOpenSideBySide?: (field: ExtractionField) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  field,
  onClose,
  onOpenSideBySide,
}) => {
  const [copied, setCopied] = useState(false);

  if (!field) return null;

  const handleCopyEvidence = () => {
    if (field.evidence_text) {
      navigator.clipboard.writeText(field.evidence_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuperseded = Boolean(field.updated_from);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#090d15] shadow-2xl border-l border-slate-800 h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07090e]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              Provenance & Grounding Trace
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{field.label}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Field Name */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e131f] border border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Schema Field Name</p>
              <code className="text-xs font-mono text-emerald-300 font-semibold">{field.field_name}</code>
            </div>
            <StatusBadge status={field.status} />
          </div>

          {/* Extracted Value Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Extracted Value
            </label>
            <div className="p-4 rounded-xl bg-[#0e131f] border border-slate-800 text-sm font-medium text-slate-100 leading-relaxed break-words">
              {field.value}
            </div>
          </div>

          {/* Conflict Override Banner if applicable */}
          {isSuperseded && field.updated_from && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <GitCommit className="w-4 h-4 text-amber-400" />
                <span>Authoritative Addendum Override</span>
              </div>
              <div className="text-xs text-amber-200 space-y-1.5 pl-6 border-l-2 border-amber-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Original Value:</span>
                  <p className="font-mono text-[11px] text-slate-200 bg-black/60 p-2 rounded border border-amber-800/40 mt-0.5">
                    {field.updated_from.previous_value}
                  </p>
                  <p className="text-[10px] text-amber-300/80 mt-0.5">From: {field.updated_from.previous_source}</p>
                </div>
                <div className="pt-1 text-[11px] text-amber-300 italic">
                  ↳ {field.updated_from.reason}
                </div>
              </div>
            </div>
          )}

          {/* Source Document Details */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Source Attribution
            </label>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0e131f] space-y-2">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white break-words">{field.source_document}</p>
                  {field.page_number && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      Page number: <span className="font-mono text-emerald-300 font-bold">{field.page_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verbatim Grounded Evidence Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Verbatim Evidence Snippet
              </label>
              {field.evidence_text && (
                <button
                  onClick={handleCopyEvidence}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Evidence'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#07090e] text-slate-100 text-xs font-mono leading-relaxed border border-emerald-500/20 shadow-inner relative">
              <div className="text-[10px] text-emerald-400 font-sans uppercase font-bold mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-emerald-400" />
                Document Grounding Trace
              </div>
              {field.evidence_text ? (
                <p className="whitespace-pre-wrap text-emerald-200/90 leading-relaxed pl-3 border-l-2 border-emerald-500/40">
                  "{field.evidence_text}"
                </p>
              ) : (
                <p className="text-slate-500 italic">No direct text quote captured for 'Not Specified' field.</p>
              )}
            </div>
          </div>

          {/* Rationale / Resolution Reason */}
          {field.resolution_reason && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Resolution Reasoning
              </label>
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                {field.resolution_reason}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#07090e] flex items-center justify-between gap-3">
          {onOpenSideBySide && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenSideBySide(field)}
              icon={<SplitSquareVertical className="w-4 h-4" />}
            >
              Side-by-Side Verify
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
