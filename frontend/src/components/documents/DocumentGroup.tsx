import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Globe, CheckCircle2, AlertTriangle, Layers, Play } from 'lucide-react';
import { DocumentItem } from '../../types';
import { Button } from '../common/Button';

interface DocumentGroupProps {
  groupId: string;
  documents: DocumentItem[];
  onAnalyzeGroup?: (groupId: string) => void;
  isAnalyzing?: boolean;
}

export const DocumentGroup: React.FC<DocumentGroupProps> = ({
  groupId,
  documents,
  onAnalyzeGroup,
  isAnalyzing = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const hasAddenda = documents.some((d) => d.role === 'ADDENDUM');
  const addendaCount = documents.filter((d) => d.role === 'ADDENDUM').length;

  return (
    <div className="bg-[#0e131f] rounded-xl border border-slate-800/90 overflow-hidden shadow-xs transition-all">
      {/* Group Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 bg-[#090d15]/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md cursor-pointer transition-colors"
          >
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white capitalize font-mono">
                  Package: {groupId.toUpperCase()}
                </h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                  {documents.length} documents
                </span>
                {hasAddenda && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {addendaCount} Addenda (Contains Overrides)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-document solicitation with legal authority weighting (Addenda &gt; Main RFP).
              </p>
            </div>
          </div>
        </div>

        {onAnalyzeGroup && (
          <Button
            size="sm"
            onClick={() => onAnalyzeGroup(groupId)}
            loading={isAnalyzing}
            icon={<Play className="w-3.5 h-3.5 fill-slate-950" />}
          >
            Analyze Package
          </Button>
        )}
      </div>

      {/* Group Document Items */}
      {isOpen && (
        <div className="divide-y divide-slate-800/60">
          {documents.map((doc) => {
            const isPdf = doc.type === 'PDF';
            const isAddendum = doc.role === 'ADDENDUM';
            const isMain = doc.role === 'MAIN_SOLICITATION';

            return (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isPdf ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40' : 'bg-blue-950/40 text-blue-400 border border-blue-800/40'
                    }`}
                  >
                    {isPdf ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-slate-200 truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      {/* Role Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isAddendum
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                            : isMain
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {doc.role.replace('_', ' ')}
                      </span>
                      {isAddendum && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          Contains updated information
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {doc.type} • {doc.formatted_size} {doc.pages ? `• ${doc.pages} page(s)` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Processed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
