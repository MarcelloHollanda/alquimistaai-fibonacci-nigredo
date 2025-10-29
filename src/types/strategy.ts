export interface LeadProfile {
  lead_id: string;
  razao_social: string;
  faturamento_estimado?: number;
  porte?: 'MEI' | 'ME' | 'EPP' | 'MEDIO' | 'GRANDE';
  socios?: string[];
  maturidade_mercado?: number; // anos
  historico_comercial?: {
    ultimo_contato?: string;
    interacoes_anteriores?: number;
    taxa_resposta?: number;
  };
  valor_comercial?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'PREMIUM';
}

export interface ABTestVariant {
  id: string;
  name: string;
  template: string;
  metrics?: {
    sent: number;
    opened: number;
    replied: number;
    open_rate: number;
    reply_rate: number;
  };
  status: 'draft' | 'running' | 'completed' | 'winner';
}

export interface ABTest {
  id: string;
  name: string;
  stage: 'TOPO' | 'MEIO' | 'FUNDO';
  variants: ABTestVariant[];
  sample_size: number;
  created_at: string;
  completed_at?: string;
}

export interface ABMAccount {
  lead_id: string;
  razao_social: string;
  faturamento_estimado: number;
  score_abm: number; // 0-100
  custom_strategy?: string;
  assigned_to?: string;
  status: 'identified' | 'strategy_created' | 'approved' | 'in_progress';
}

export interface CampaignPlanning {
  estrategia_id: string;
  lote_id: string;
  channel_strategy: {
    whatsapp_leads: number;
    email_leads: number;
    reasoning: string;
  };
  pacing_plan: {
    daily_limit: number;
    hourly_distribution: number[];
    natural_delays: {
      min_seconds: number;
      max_seconds: number;
    };
  };
  risk_analysis: {
    overall_score: number; // 0-100 (menor é melhor)
    warnings: string[];
    recommendations: string[];
  };
}

export interface StrategyMetrics {
  estrategia_id: string;
  templates_sent: number;
  total_opened: number;
  total_replied: number;
  avg_open_rate: number;
  avg_reply_rate: number;
  best_performing_stage: 'TOPO' | 'MEIO' | 'FUNDO';
  learnings: string[];
}
