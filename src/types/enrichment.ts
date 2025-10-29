export interface Inconformidade {
  linha: number;
  motivo: string;
  sugestao: string;
}

export interface EnrichmentDetail {
  linha: number;
  enrichment_sources: string[];
  adjusted_fields: string[];
  missing_fields: string[];
}

export interface EnrichmentReport {
  total_enriched: number;
  sources_used: string[];
  total_adjusted_fields: number;
  total_missing_fields: number;
  details: EnrichmentDetail[];
}

export interface CorrecaoLead {
  linha: number;
  field: 'cnpj' | 'razao_social' | 'email' | 'telefone' | 'site' | 'uf' | 'cidade';
  new_value: string;
}

export interface CorrectionsRequest {
  batch_id: string;
  corrections: CorrecaoLead[];
}

export interface CorrectionsResponse {
  ok: boolean;
  corrected: number;
  corrections: Array<{
    lead_id: string;
    linha: number;
    field: string;
    old_value: string;
    new_value: string;
  }>;
  reprocessed: number;
  reprocess_result?: object;
}

export interface EnrichmentConfig {
  enable_receita_federal: boolean;
  enable_google_places: boolean;
  enable_web_search: boolean;
  google_places_api_key?: string;
  enable_auto_reprocess: boolean;
}

export interface LeadEnrichmentInfo {
  enriched_from?: string[];
  last_enrichment_date?: string;
  enrichment_quality_score?: number;
}

export interface QualityMetrics {
  total_leads_imported: number;
  total_enriched: number;
  enrichment_rate: number;
  sources_breakdown: {
    receita_federal: number;
    google_places: number;
    web_search: number;
  };
  avg_fields_per_lead: number;
  missing_data_rate: number;
}
