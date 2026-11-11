import React from 'react';
import { ArrowDown, GitCommit, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConflictResolutionItem } from '../../types';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolutions: ConflictResolutionItem[];
  title?: string;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  resolutions,
  title = 'Addendum Precedence & Conflict Audit',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Automated resolution of superseded terms based on legal document hierarchy"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            When addenda or amendments are issued for a solicitation, they legally supersede prior provisions.
            The engine evaluates legal authority weights (<span className="font-mono font-semibold text-emerald-300">Addendum 2 (102) &gt; Addendum 1 (101) &gt; Main Solicitation (50)</span>) to eliminate contradictions.
          </p>
        </div>

        {resolutions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-[#0e131f] border border-slate-800 rounded-xl">
            No contradictory terms or addendum overrides were detected in this procurement package.
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {resolutions.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-800 bg-[#0e131f] shadow-sm space-y-4"
              >
                {/* Field Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-400">
                      <GitCommit className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                      {item.field.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#07090e] border border-slate-800 text-slate-400 font-mono">
                    {item.resolution_type}
                  </span>
                </div>

                {/* Precedence Progression Flow */}
                <div className="space-y-2.5">
                  {/* Prior / Superseded Value */}
                  <div className="p-3 rounded-lg bg-[#07090e] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Prior Term (Superseded)</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[240px] text-slate-400">{item.previous_source}</span>
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 line-through decoration-rose-500/80 bg-black/50 p-2 rounded border border-slate-800/80">
                      {item.previous_value}
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Final Authoritative Value */}
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Authoritative Selected Value
                      </span>
                      <span className="flex items-center gap-1 font-normal text-slate-400">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[240px]">{item.selected_source}</span>
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-emerald-300 bg-black/60 p-2 rounded border border-emerald-500/30 shadow-xs">
                      {item.selected_value}
                    </p>
                  </div>
                </div>

                {/* Engine Rationale */}
                <div className="text-[11px] text-slate-300 bg-[#07090e] p-2.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-emerald-400">Resolution Rationale: </span>
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
