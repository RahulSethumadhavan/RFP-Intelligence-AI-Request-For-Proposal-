import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, GitCommit, SplitSquareVertical } from 'lucide-react';
import { api } from '../services/api';
import { ExtractionRecord, ExtractionField, FieldStatus } from '../types';
import { ExtractionHeader } from '../components/extraction/ExtractionHeader';
import { FieldGroup } from '../components/extraction/FieldGroup';
import { FilterBar } from '../components/extraction/FilterBar';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { ConflictResolutionModal } from '../components/evidence/ConflictResolutionModal';
import { SideBySideModal } from '../components/evidence/SideBySideModal';
import { JsonViewer } from '../components/json/JsonViewer';
import { OrderedFilesFlow } from '../components/extraction/OrderedFilesFlow';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';

const GROUP_ORDER = [
  'Bid Information',
  'Schedule & Logistics',
  'Financial & Compliance',
  'Procurement Details',
  'Organization & Summary',
] as const;

export const ExtractionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [record, setRecord] = useState<ExtractionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'files_order' | 'json'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | FieldStatus>('all');

  // Drawer and Modals state
  const [selectedField, setSelectedField] = useState<ExtractionField | null>(null);
  const [isConflictsOpen, setIsConflictsOpen] = useState(false);
  const [sideBySideField, setSideBySideField] = useState<ExtractionField | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await api.getExtraction(id);
        setRecord(data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load extraction', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  // Download raw JSON
  const handleDownloadJson = () => {
    if (!record) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record.raw_json, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${record.bid_id}_procurement_fields.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded 20-field procurement JSON.', 'success');
  };

  // Download entire folder as ZIP
  const handleDownloadZip = () => {
    if (!record) return;
    const url = api.getZipExportUrl(record.bid_id);
    window.open(url, '_blank');
    showToast(`Downloading ZIP archive for bid folder ${record.bid_id}...`, 'info');
  };


  // Filter and search logic
  const filteredFields = useMemo(() => {
    if (!record) return [];
    return record.fields.filter((f) => {
      // Status filter
      if (selectedFilter !== 'all' && f.status !== selectedFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.field_name.toLowerCase().includes(q) || f.label.toLowerCase().includes(q);
        const matchVal = f.value.toLowerCase().includes(q);
        const matchSrc = f.source_document.toLowerCase().includes(q);
        return matchName || matchVal || matchSrc;
      }
      return true;
    });
  }, [record, selectedFilter, searchQuery]);

  // Group filtered fields
  const fieldsByGroup = useMemo(() => {
    const map: Record<string, ExtractionField[]> = {};
    GROUP_ORDER.forEach((g) => (map[g] = []));
    filteredFields.forEach((f) => {
      if (!map[f.group]) map[f.group] = [];
      map[f.group].push(f);
    });
    return map;
  }, [filteredFields]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-16 space-y-3">
        <h3 className="text-base font-bold text-white">Extraction record not found</h3>
        <p className="text-xs text-slate-400">The requested procurement extraction record does not exist.</p>
        <Link to="/extractions" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline">
          Return to Extractions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to="/extractions" className="hover:text-emerald-400 transition-colors">Extractions</Link>
        <span>/</span>
        <span className="font-mono font-bold text-emerald-400 uppercase">{record.bid_id}</span>
      </div>

      {/* Main Header Component */}
      <ExtractionHeader
        record={record}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onDownloadJson={handleDownloadJson}
        onDownloadZip={handleDownloadZip}
        onOpenConflictsModal={() => setIsConflictsOpen(true)}
      />

      {/* Table vs Ordered Files vs JSON View */}
      {viewMode === 'table' ? (
        <div className="space-y-5">
          {/* Search and Filters Bar */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            counts={{
              total: record.summary.total_fields,
              verified: record.summary.verified,
              needs_review: record.summary.needs_review,
              not_specified: record.summary.not_specified,
            }}
          />

          {/* Grouped Fields Sections */}
          <div className="space-y-4">
            {GROUP_ORDER.map((groupName, idx) => {
              const groupFields = fieldsByGroup[groupName] || [];
              if (groupFields.length === 0 && searchQuery) return null;

              return (
                <FieldGroup
                  key={groupName}
                  title={groupName}
                  fields={groupFields}
                  defaultOpen={idx === 0 || Boolean(searchQuery)}
                  onSelectField={(f) => setSelectedField(f)}
                  onViewResolution={() => setIsConflictsOpen(true)}
                />
              );
            })}
          </div>
        </div>
      ) : viewMode === 'files_order' ? (
        <OrderedFilesFlow
          bidId={record.bid_id}
          files={record.files_in_order || []}
          onDownloadZip={handleDownloadZip}
        />
      ) : (
        <JsonViewer
          data={record.raw_json}
          onDownload={handleDownloadJson}
        />
      )}


      {/* Evidence Drawer */}
      <EvidenceDrawer
        field={selectedField}
        onClose={() => setSelectedField(null)}
        onOpenSideBySide={(f) => {
          setSelectedField(null);
          setSideBySideField(f);
        }}
      />

      {/* Addendum Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={isConflictsOpen}
        onClose={() => setIsConflictsOpen(false)}
        resolutions={record.conflict_resolutions || []}
        title={`Addendum Precedence & Conflict Trail: ${record.bid_id.toUpperCase()}`}
      />

      {/* Side-by-Side Verification Modal */}
      <SideBySideModal
        isOpen={Boolean(sideBySideField)}
        onClose={() => setSideBySideField(null)}
        field={sideBySideField}
      />
    </div>
  );
};
