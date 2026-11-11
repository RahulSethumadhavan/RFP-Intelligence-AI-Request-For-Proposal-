import React from 'react';
import { BookOpen, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export interface BenchmarkBannerProps {
  hasLoadedSamples: boolean;
  isLoading: boolean;
  onLoadSamples: () => void | Promise<void>;
  onClearSamples: () => void | Promise<void>;
  variant?: 'document' | 'extraction' | 'general';
  className?: string;
}

export const BenchmarkBanner: React.FC<BenchmarkBannerProps> = ({
  hasLoadedSamples,
  isLoading,
  onLoadSamples,
  onClearSamples,
  variant = 'general',
  className = '',
}) => {
  const getDescriptions = () => {
    if (variant === 'document') {
      return {
        activeTitle: 'Benchmark Reference Bids Active in Documents',
        availableTitle: 'Benchmark Reference Sample Bids Available',
        activeDesc:
          'Currently displaying benchmark solicitation packages (Bid 1: Dallas ISD JA-207652 & Bid 2: MD Treasurer Dell Laptops) with 7 solicitation files and addenda.',
        availableDesc:
          'Want to explore multi-document procurement files before uploading custom RFPs? Load the pre-configured Dallas ISD and MD Treasurer benchmark document packages.',
        loadBtnText: 'Load Benchmark Documents',
        clearBtnText: 'Clear Reference Documents',
      };
    }
    if (variant === 'extraction') {
      return {
        activeTitle: 'Benchmark Reference Extractions Active',
        availableTitle: 'Benchmark Reference Sample Bids Available',
        activeDesc:
          'Currently viewing benchmark 20-field intelligence records (Bid 1: Dallas ISD JA-207652 & Bid 2: MD Treasurer Dell Laptops) with provenance audit trails and addendum conflict overrides.',
        availableDesc:
          'Want to inspect structured 20-field intelligence before uploading custom RFPs? Load the pre-configured Dallas ISD and MD Treasurer benchmark extraction records.',
        loadBtnText: 'Load Benchmark Extractions',
        clearBtnText: 'Clear Reference Extractions',
      };
    }
    return {
      activeTitle: 'Benchmark Reference Bids Active',
      availableTitle: 'Benchmark Reference Sample Bids Available',
      activeDesc:
        'Currently viewing benchmark sample packages (Bid 1: Dallas ISD JA-207652 & Bid 2: MD Treasurer Dell Laptops).',
      availableDesc:
        'Want to test the pipeline before uploading custom RFPs? Load the pre-configured Dallas ISD and MD Treasurer benchmark packages.',
      loadBtnText: 'Load Benchmark Bids (Bid 1 & Bid 2)',
      clearBtnText: 'Clear Reference Bids',
    };
  };

  const info = getDescriptions();

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        hasLoadedSamples
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-sm shadow-amber-500/5'
          : 'bg-[#0e131f] border-slate-800 text-slate-300 hover:border-slate-700/80 shadow-sm'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              hasLoadedSamples ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800/80 text-emerald-400'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-white">
                {hasLoadedSamples ? info.activeTitle : info.availableTitle}
              </p>
              {hasLoadedSamples && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Loaded
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              {hasLoadedSamples ? info.activeDesc : info.availableDesc}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
          {hasLoadedSamples ? (
            <Button
              size="sm"
              variant="outline"
              loading={isLoading}
              onClick={onClearSamples}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              {info.clearBtnText}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              loading={isLoading}
              onClick={onLoadSamples}
              icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            >
              {info.loadBtnText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
