import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';
import { ExtractionField } from '../../types';
import { FieldRow } from './FieldRow';

interface FieldGroupProps {
  title: string;
  fields: ExtractionField[];
  defaultOpen?: boolean;
  onSelectField: (field: ExtractionField) => void;
  onViewResolution?: (field: ExtractionField) => void;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  title,
  fields,
  defaultOpen = true,
  onSelectField,
  onViewResolution,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const verifiedCount = fields.filter((f) => f.status === 'verified').length;
  const reviewCount = fields.filter((f) => f.status === 'needs_review').length;
  const notSpecifiedCount = fields.filter((f) => f.status === 'not_specified').length;

  return (
    <div className="bg-[#0e131f] rounded-xl border border-slate-800/90 overflow-hidden shadow-xs">
      {/* Group Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-[#090d15] hover:bg-slate-900/60 border-b border-slate-800/80 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
          <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
            {title} ({fields.length})
          </h4>
        </div>

        {/* Group mini counts */}
        <div className="flex items-center gap-3 text-[11px]">
          {verifiedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {verifiedCount} Verified
            </span>
          )}
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {reviewCount} Review
            </span>
          )}
          {notSpecifiedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <MinusCircle className="w-3.5 h-3.5" />
              {notSpecifiedCount} Not Specified
            </span>
          )}
        </div>
      </button>

      {/* Field Rows */}
      {isOpen && (
        <div className="divide-y divide-slate-800/60">
          {fields.map((field) => (
            <FieldRow
              key={field.field_name}
              field={field}
              onSelectField={onSelectField}
              onViewResolution={onViewResolution}
            />
          ))}
        </div>
      )}
    </div>
  );
};
