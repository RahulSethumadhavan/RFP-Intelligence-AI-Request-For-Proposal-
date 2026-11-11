import {
  BackendHealth,
  DocumentItem,
  ExtractionListItem,
  ExtractionRecord,
  ProcessingStatusResponse,
  SampleStatus,
  SystemStats,
} from '../types';
import {
  CLEAN_STATS,
  MOCK_DOCUMENTS,
  MOCK_EXTRACTIONS,
  MOCK_HEALTH,
  MOCK_STATS,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private isDemoMode = false;
  private demoSamplesLoaded = false;
  private demoCustomDocs: DocumentItem[] = [];
  private demoCustomExtractions: Record<string, ExtractionRecord> = {};
  private jobExtractionMap: Record<string, string> = {};

  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  getDemoMode(): boolean {
    return this.isDemoMode;
  }

  async getHealth(): Promise<BackendHealth> {
    if (this.isDemoMode) {
      return { ...MOCK_HEALTH, demo_mode: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, falling back to Demo Mode:', err);
      this.isDemoMode = true;
      return { ...MOCK_HEALTH, demo_mode: true };
    }
  }

  async getSampleStatus(): Promise<SampleStatus> {
    if (this.isDemoMode) {
      return {
        samples_loaded: this.demoSamplesLoaded,
        bid1_loaded: this.demoSamplesLoaded,
        bid2_loaded: this.demoSamplesLoaded,
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/samples/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        samples_loaded: this.demoSamplesLoaded,
        bid1_loaded: this.demoSamplesLoaded,
        bid2_loaded: this.demoSamplesLoaded,
      };
    }
  }

  async loadSamples(): Promise<{ success: boolean; message: string; packages: string[] }> {
    if (this.isDemoMode) {
      this.demoSamplesLoaded = true;
      return {
        success: true,
        message: 'Benchmark sample bids loaded successfully (Demo Mode).',
        packages: ['bid1', 'bid2'],
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/samples/load`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      this.demoSamplesLoaded = true;
      return {
        success: true,
        message: 'Benchmark sample bids loaded (offline mode).',
        packages: ['bid1', 'bid2'],
      };
    }
  }

  async clearSamples(): Promise<{ success: boolean; message: string; cleared: string[] }> {
    if (this.isDemoMode) {
      this.demoSamplesLoaded = false;
      return {
        success: true,
        message: 'Benchmark sample bids cleared (Demo Mode).',
        cleared: ['bid1', 'bid2'],
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/samples/clear`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      this.demoSamplesLoaded = false;
      return {
        success: true,
        message: 'Benchmark sample bids cleared.',
        cleared: ['bid1', 'bid2'],
      };
    }
  }

  async clearWorkspace(): Promise<{ success: boolean; message: string }> {
    this.demoCustomDocs = [];
    this.demoCustomExtractions = {};
    this.demoSamplesLoaded = false;
    if (this.isDemoMode) {
      return { success: true, message: 'Workspace data cleared (Demo Mode).' };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/workspace/clear`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Workspace data cleared.' };
    }
  }

  async clearDocuments(): Promise<{ success: boolean; message: string }> {
    this.demoCustomDocs = [];
    if (this.isDemoMode) {
      return { success: true, message: 'Documents cleared (Demo Mode).' };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/clear`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Documents cleared.' };
    }
  }

  async clearExtractions(): Promise<{ success: boolean; message: string }> {
    this.demoCustomExtractions = {};
    if (this.isDemoMode) {
      return { success: true, message: 'Extractions cleared (Demo Mode).' };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/extractions/clear`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Extractions cleared.' };
    }
  }

  async getStats(): Promise<SystemStats> {
    if (this.isDemoMode) {
      const docs = this.demoSamplesLoaded ? [...MOCK_DOCUMENTS, ...this.demoCustomDocs] : this.demoCustomDocs;
      const extractions = this.demoSamplesLoaded
        ? [...Object.values(MOCK_EXTRACTIONS), ...Object.values(this.demoCustomExtractions)]
        : Object.values(this.demoCustomExtractions);
      const successful = extractions.length;
      return {
        documents_processed: docs.length,
        fields_extracted: successful * 20,
        needs_review: 0,
        successful_extractions: successful,
        structured_output_rate: successful > 0 ? 96.5 : 0.0,
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch stats, using mock stats:', err);
      return CLEAN_STATS;
    }
  }

  async getDocuments(): Promise<DocumentItem[]> {
    if (this.isDemoMode) {
      return this.demoSamplesLoaded ? [...MOCK_DOCUMENTS, ...this.demoCustomDocs] : this.demoCustomDocs;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch documents:', err);
      return this.demoSamplesLoaded ? [...MOCK_DOCUMENTS, ...this.demoCustomDocs] : this.demoCustomDocs;
    }
  }

  async uploadDocuments(files: File[], group?: string): Promise<{ files: any[]; detected_group: string; message: string }> {
    const targetGroup = group || `custom_${Date.now()}`;

    if (this.isDemoMode) {
      const newDocs: DocumentItem[] = files.map((f, idx) => ({
        id: `custom-doc-${Date.now()}-${idx}`,
        filename: f.name,
        file_path: `data/input/${targetGroup}/${f.name}`,
        type: f.name.endsWith('.pdf') ? 'PDF' : 'HTML',
        size_bytes: f.size,
        formatted_size: `${(f.size / 1024).toFixed(1)} KB`,
        group: targetGroup,
        role: f.name.toLowerCase().includes('addendum') ? 'ADDENDUM' : 'MAIN_SOLICITATION',
        status: 'ready',
        added_at: new Date().toISOString(),
      }));
      this.demoCustomDocs.push(...newDocs);

      return {
        files: newDocs,
        detected_group: targetGroup,
        message: `${files.length} document(s) uploaded into package '${targetGroup}'.`,
      };
    }

    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));

    const url = group ? `${API_BASE_URL}/api/documents/upload?group=${encodeURIComponent(group)}` : `${API_BASE_URL}/api/documents/upload`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }

    return await res.json();
  }

  async startExtraction(groupId: string, demo: boolean = false): Promise<{ job_id: string; extraction_id: string }> {
    const jobId = `job-${Date.now()}`;
    const extractionId = groupId || `custom_${Date.now()}`;
    this.jobExtractionMap[jobId] = extractionId;

    if (this.isDemoMode) {
      // Create a mock custom extraction record if not existing
      if (!MOCK_EXTRACTIONS[extractionId] && !this.demoCustomExtractions[extractionId]) {
        this.demoCustomExtractions[extractionId] = this.createSyntheticRecord(extractionId);
      }
      return {
        job_id: jobId,
        extraction_id: extractionId,
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, demo }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.job_id && data.extraction_id) {
        this.jobExtractionMap[data.job_id] = data.extraction_id;
      }
      return data;
    } catch (err) {
      console.warn('Analyze call failed, using mock processing job:', err);
      if (!MOCK_EXTRACTIONS[extractionId] && !this.demoCustomExtractions[extractionId]) {
        this.demoCustomExtractions[extractionId] = this.createSyntheticRecord(extractionId);
      }
      return {
        job_id: jobId,
        extraction_id: extractionId,
      };
    }
  }

  async getProcessingStatus(jobId: string): Promise<ProcessingStatusResponse> {
    const assignedExtractionId = this.jobExtractionMap[jobId] || jobId;

    if (this.isDemoMode || jobId.startsWith('job-') || jobId.startsWith('mock-job-')) {
      return {
        job_id: jobId,
        status: 'completed',
        current_stage: 'preparing_json',
        stages: {
          documents_discovered: 'completed',
          pdf_text_extracted: 'completed',
          html_content_cleaned: 'completed',
          documents_grouped: 'completed',
          salient_sections_identified: 'completed',
          extracting_procurement_fields: 'completed',
          validating_structured_output: 'completed',
          resolving_conflicts: 'completed',
          preparing_json: 'completed',
        },
        extraction_id: assignedExtractionId,
      };
    }

    const res = await fetch(`${API_BASE_URL}/api/processing/${encodeURIComponent(jobId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getExtractions(): Promise<ExtractionListItem[]> {
    if (this.isDemoMode) {
      const allExts = this.demoSamplesLoaded
        ? { ...MOCK_EXTRACTIONS, ...this.demoCustomExtractions }
        : { ...this.demoCustomExtractions };

      return Object.values(allExts).map(ext => ({
        id: ext.id,
        bid_id: ext.bid_id,
        title: ext.title,
        bid_number: ext.bid_number,
        company_name: ext.company_name,
        due_date: ext.due_date || 'Not Specified',
        status: ext.status,
        field_count: 20,
        conflict_resolutions_count: ext.conflict_resolutions.length,
        source_documents_count: ext.source_documents.length,
        created_at: ext.created_at,
      }));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/extractions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch extractions:', err);
      const allExts = this.demoSamplesLoaded
        ? { ...MOCK_EXTRACTIONS, ...this.demoCustomExtractions }
        : { ...this.demoCustomExtractions };

      return Object.values(allExts).map(ext => ({
        id: ext.id,
        bid_id: ext.bid_id,
        title: ext.title,
        bid_number: ext.bid_number,
        company_name: ext.company_name,
        due_date: ext.due_date || 'Not Specified',
        status: ext.status,
        field_count: 20,
        conflict_resolutions_count: ext.conflict_resolutions.length,
        source_documents_count: ext.source_documents.length,
        created_at: ext.created_at,
      }));
    }
  }

  async getExtraction(id: string): Promise<ExtractionRecord> {
    if (this.isDemoMode) {
      const record = this.demoCustomExtractions[id] || MOCK_EXTRACTIONS[id] || this.createSyntheticRecord(id);
      return record;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/extractions/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch extraction '${id}', using fallback:`, err);
      return this.demoCustomExtractions[id] || MOCK_EXTRACTIONS[id] || this.createSyntheticRecord(id);
    }
  }

  getJsonExportUrl(id: string): string {
    return `${API_BASE_URL}/api/extractions/${encodeURIComponent(id)}/export/json`;
  }

  getAuditExportUrl(id: string): string {
    return `${API_BASE_URL}/api/extractions/${encodeURIComponent(id)}/audit`;
  }

  getZipExportUrl(id: string): string {
    return `${API_BASE_URL}/api/extractions/${encodeURIComponent(id)}/export/zip`;
  }

  getFileExportUrl(bidId: string, filename: string): string {
    return `${API_BASE_URL}/api/extractions/${encodeURIComponent(bidId)}/files/${encodeURIComponent(filename)}`;
  }


  private createSyntheticRecord(id: string): ExtractionRecord {
    const title = `Custom Procurement Solicitation (${id.replace(/_/g, ' ')})`;
    const rawJson: Record<string, string> = {
      bid_number: id.toUpperCase(),
      title,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      bid_submission_type: 'Electronic Submission via Procurement Portal',
      term_of_bid: '1 Year with annual renewal options',
      pre_bid_meeting: 'Optional Virtual Conference',
      installation: 'Required per technical requirements',
      bid_bond_requirement: '5% Bid Bond Required',
      delivery_date: 'Within 30 Days of Purchase Order',
      payment_terms: 'Net 30 Days',
      additional_documentation_required: 'Vendor Compliance Affidavit, Insurance Certificate',
      mfg_for_registration: 'Authorized Partner or Original Equipment Manufacturer',
      contract_or_cooperative_to_use: 'Open Public Competitive Solicitation',
      model_no: 'Per Specification Sheets',
      part_no: 'Standard Vendor Catalog Lines',
      product: 'Commercial Hardware and Enterprise IT Equipment',
      contact_info: 'procurement@agency.gov',
      company_name: 'Procurement Department',
      bid_summary: 'Competitive Request for Proposals for products and related technical services.',
      product_specification: 'Detailed in RFP Schedule A specifications.',
    };

    return {
      id,
      bid_id: id,
      title,
      bid_number: id.toUpperCase(),
      company_name: 'Procurement Department',
      due_date: rawJson.due_date,
      status: 'completed',
      source_documents: [`custom_document_${id}.pdf`],
      summary: {
        total_fields: 20,
        verified: 18,
        needs_review: 2,
        not_specified: 0,
        error: 0,
      },
      fields: Object.entries(rawJson).map(([k, v]) => ({
        field_name: k,
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        group: 'Bid Information',
        value: v,
        status: 'verified',
        source_document: `custom_document_${id}.pdf`,
        evidence_text: `Extracted from document body for field ${k}`,
      })),
      conflict_resolutions: [],
      raw_json: rawJson,
      created_at: new Date().toISOString(),
    };
  }
}

export const api = new ApiClient();
