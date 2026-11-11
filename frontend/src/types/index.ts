export type FieldStatus = 'verified' | 'needs_review' | 'not_specified' | 'error';

export interface FieldEvidence {
  source_document: string;
  page_number?: number | null;
  evidence_text?: string | null;
  resolution_reason?: string | null;
  status: FieldStatus;
  updated_from?: {
    previous_value: string;
    previous_source: string;
    reason: string;
  } | null;
}

export interface ExtractionField {
  field_name: string;
  label: string;
  group: 'Bid Information' | 'Schedule & Logistics' | 'Financial & Compliance' | 'Procurement Details' | 'Organization & Summary';
  value: string;
  status: FieldStatus;
  source_document: string;
  page_number?: number | null;
  evidence_text?: string | null;
  resolution_reason?: string | null;
  updated_from?: {
    previous_value: string;
    previous_source: string;
    reason: string;
  } | null;
}

export interface ConflictResolutionItem {
  field: string;
  selected_value: string;
  selected_source: string;
  previous_value: string;
  previous_source: string;
  reason: string;
  resolution_type: string;
}

export interface ExtractionSummary {
  total_fields: number;
  verified: number;
  needs_review: number;
  not_specified: number;
  error: number;
}

export interface FileExtractionItem {
  order: number;
  filename: string;
  stem: string;
  json_filename: string;
  file_type: 'PDF' | 'HTML' | 'TEXT' | string;
  role: string;
  fields: Record<string, string>;
  summary?: {
    verified?: number;
    not_specified?: number;
    total?: number;
  };
  download_url?: string;
}

export interface ExtractionRecord {
  id: string;
  bid_id: string;
  title: string;
  bid_number: string;
  company_name: string;
  due_date?: string;
  status: 'completed' | 'processing' | 'failed';
  source_documents: string[];
  summary: ExtractionSummary;
  fields: ExtractionField[];
  files_in_order?: FileExtractionItem[];
  total_files_count?: number;
  conflict_resolutions: ConflictResolutionItem[];
  raw_json: Record<string, string>;
  audit_json?: Record<string, any>;
  created_at: string;
}

export interface ExtractionListItem {
  id: string;
  bid_id: string;
  title: string;
  bid_number: string;
  company_name: string;
  due_date: string;
  status: string;
  field_count: number;
  conflict_resolutions_count: number;
  source_documents_count: number;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_path: string;
  type: 'PDF' | 'HTML' | 'TEXT';
  size_bytes: number;
  formatted_size: string;
  pages?: number | null;
  group: string;
  role: 'MAIN_SOLICITATION' | 'ADDENDUM' | 'SPEC_SHEET' | 'AFFIDAVIT' | 'DOCUMENT';
  status: string;
  added_at: string;
}


export interface DocumentGroupItem {
  group_id: string;
  name: string;
  documents: DocumentItem[];
  total_size: string;
  has_conflicts: boolean;
}

export interface SystemStats {
  documents_processed: number;
  fields_extracted: number;
  needs_review: number;
  successful_extractions: number;
  structured_output_rate: number;
}

export interface BackendHealth {
  status: string;
  provider: string;
  model: string;
  backend_version: string;
  groq_configured: boolean;
  demo_mode: boolean;
  timestamp: string;
}

export type ProcessingStageId =
  | 'documents_discovered'
  | 'pdf_text_extracted'
  | 'html_content_cleaned'
  | 'documents_grouped'
  | 'salient_sections_identified'
  | 'extracting_procurement_fields'
  | 'validating_structured_output'
  | 'resolving_conflicts'
  | 'preparing_json';

export type StageState = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ProcessingStatusResponse {
  job_id: string;
  group_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_stage: ProcessingStageId;
  stages: Record<ProcessingStageId, StageState>;
  extraction_id?: string;
  error?: string;
}

export interface SampleStatus {
  samples_loaded: boolean;
  bid1_loaded: boolean;
  bid2_loaded: boolean;
}
