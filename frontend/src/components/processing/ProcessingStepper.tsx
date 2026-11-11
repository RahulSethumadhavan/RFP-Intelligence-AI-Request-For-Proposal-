import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Zap,
  Cpu,
  FileSearch,
  Layers,
  GitBranch,
  ShieldCheck,
  FileJson,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ProcessingStageId, StageState } from '../../types';

interface StageConfig {
  id: ProcessingStageId;
  label: string;
  description: string;
  category: 'Ingestion' | 'Parsing' | 'Hierarchy' | 'Extraction' | 'Validation' | 'Resolution';
  icon: React.ReactNode;
}

export const STAGES: StageConfig[] = [
  {
    id: 'documents_discovered',
    label: 'Documents Discovered',
    description: 'Scanning solicitation files and checking PDF/HTML integrity',
    category: 'Ingestion',
    icon: <FileSearch className="w-4 h-4" />,
  },
  {
    id: 'pdf_text_extracted',
    label: 'PDF Text Extracted',
    description: 'PyMuPDF spatial block layout extraction preserving typography',
    category: 'Parsing',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'html_content_cleaned',
    label: 'HTML Content Cleaned',
    description: 'Stripping portal boilerplate & extracting tables with BeautifulSoup',
    category: 'Parsing',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'documents_grouped',
    label: 'Documents Grouped & Ranked',
    description: 'Assigning legal authority weights: Addendum N > Addendum 1 > Main RFP',
    category: 'Hierarchy',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: 'salient_sections_identified',
    label: 'Salient Sections Identified',
    description: 'Keyword scoring for deadlines, bonds, scopes & spec sheets',
    category: 'Hierarchy',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'extracting_procurement_fields',
    label: 'Groq LPU LLM Extraction',
    description: 'High-speed 120B parameter inference extracting 20 structured fields',
    category: 'Extraction',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'validating_structured_output',
    label: 'Validating Structured Output',
    description: 'Enforcing strict Pydantic v2 20-field completeness & zero-hallucination',
    category: 'Validation',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'resolving_conflicts',
    label: 'Resolving Addendum Conflicts',
    description: 'Overriding superseded terms with latest authoritative amendments',
    category: 'Resolution',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: 'preparing_json',
    label: 'Preparing Standardized JSON',
    description: 'Assembling RFC 8259 output and audit provenance records',
    category: 'Resolution',
    icon: <FileJson className="w-4 h-4" />,
  },
];

interface ProcessingStepperProps {
  stages: Record<ProcessingStageId, StageState>;
  currentStage: ProcessingStageId;
}

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  stages,
  currentStage,
}) => {
  const currentIdx = STAGES.findIndex((s) => s.id === currentStage);
  const completedCount = Object.values(stages).filter((s) => s === 'completed').length;
  const progressPercent = Math.round((completedCount / STAGES.length) * 100);

  return (
    <div className="space-y-8">
      {/* Visual Pipeline High-Tech Flow Diagram */}
      <div className="p-5 rounded-2xl bg-[#080b12] border border-slate-800/90 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Pipeline Architecture Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Pipeline Architecture Flow
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Pipeline Nodes Animation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 relative">
          {[
            { label: 'INGESTION', desc: 'Scan & Clean', active: currentIdx >= 0 },
            { label: 'PARSING', desc: 'PyMuPDF Spatial', active: currentIdx >= 1 },
            { label: 'HIERARCHY', desc: 'Precedence Tree', active: currentIdx >= 3 },
            { label: 'GROQ LPU', desc: '120B Extraction', active: currentIdx >= 5 },
            { label: 'VALIDATION', desc: 'Pydantic v2', active: currentIdx >= 6 },
            { label: 'RESOLVER', desc: 'JSON Output', active: currentIdx >= 7 },
          ].map((node, i) => {
            const isCurrent = (
              (i === 0 && currentIdx === 0) ||
              (i === 1 && (currentIdx === 1 || currentIdx === 2)) ||
              (i === 2 && (currentIdx === 3 || currentIdx === 4)) ||
              (i === 3 && currentIdx === 5) ||
              (i === 4 && currentIdx === 6) ||
              (i === 5 && (currentIdx === 7 || currentIdx === 8))
            );

            return (
              <div
                key={i}
                className={`p-3 rounded-xl border text-center transition-all duration-300 relative ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-300 glow-border-green scale-102'
                    : node.active
                    ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-900/30 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                {/* Connecting glowing laser beam between nodes */}
                {i < 5 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-2 h-0.5 bg-emerald-500/40 z-10"></div>
                )}

                <div className="flex justify-center mb-1.5">
                  {isCurrent ? (
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative p-1 rounded-full bg-emerald-400 text-slate-950">
                        <Zap className="w-3 h-3 fill-slate-950" />
                      </span>
                    </div>
                  ) : node.active ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-600">
                      <Circle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-bold font-mono tracking-wider">{node.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 truncate">{node.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Animated Flow Progress Line */}
        <div className="mt-6 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/60 blur-xs animate-pipeline-flow"></div>
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Detailed Timeline Cards */}
      <div className="space-y-3">
        {STAGES.map((st, idx) => {
          const state = stages[st.id] || (st.id === currentStage ? 'in_progress' : 'pending');
          const isCurrent = state === 'in_progress';
          const isDone = state === 'completed';

          return (
            <div
              key={st.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#0d171d] to-[#0e131f] border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                  : isDone
                  ? 'bg-[#0e131f]/90 border-slate-800/80'
                  : 'bg-slate-900/20 border-slate-800/40 opacity-50'
              }`}
            >
              {/* Stage Icon */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center animate-pulse shadow-md shadow-emerald-400/40">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-800/60 border border-slate-700 text-slate-500 flex items-center justify-center">
                    <Circle className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-bold tracking-tight ${
                        isCurrent
                          ? 'text-emerald-300 font-bold'
                          : isDone
                          ? 'text-slate-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </h4>
                    <span className="text-[9px] font-semibold px-2 py-0.2 rounded-full uppercase bg-slate-900 border border-slate-800 text-slate-400">
                      {st.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-emerald-400 text-slate-950 font-bold animate-pulse'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDone ? 'Completed' : isCurrent ? 'Active Stage' : `Step ${idx + 1}`}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{st.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
