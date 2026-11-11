import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, GitCommit } from 'lucide-react';
import { ExtractionListItem } from '../../types';

interface RecentExtractionProps {
  extractions: ExtractionListItem[];
}

export const RecentExtraction: React.FC<RecentExtractionProps> = ({ extractions }) => {
  if (!extractions.length) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-[#0e131f] rounded-xl border border-dashed border-slate-800">
        No processing history yet. Upload documents or analyze a package to see results.
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-800/90 rounded-xl bg-[#0e131f] shadow-xs">
      <div className="divide-y divide-slate-800/80">
        {extractions.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                    {item.bid_number || item.bid_id.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    20 Fields Extracted
                  </span>
                  {item.conflict_resolutions_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                      <GitCommit className="w-3 h-3" />
                      {item.conflict_resolutions_count} Addendum Overrides
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span>{item.company_name}</span>
                  <span>•</span>
                  <span>Due: <strong className="text-slate-300">{item.due_date}</strong></span>
                  <span>•</span>
                  <span>{item.source_documents_count} source docs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/extractions/${item.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
