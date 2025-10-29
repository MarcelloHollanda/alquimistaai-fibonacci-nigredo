export type AgenteType = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7';

export interface Insight {
  id: string;
  agente: AgenteType;
  categoria: 'performance' | 'qualidade' | 'eficiencia' | 'otimizacao' | 'erro';
  titulo: string;
  descricao: string;
  metricas_antes: Record<string, number>;
  metricas_depois?: Record<string, number>;
  impacto_estimado: number; // 0-100
  status: 'identificado' | 'aplicado' | 'validado' | 'descartado';
  created_at: string;
  validated_at?: string;
  aplicado_em?: string[];
}

export interface CicloAprendizado {
  agente: AgenteType;
  periodo: string; // "2025-10" 
  insights_gerados: number;
  insights_aplicados: number;
  melhoria_percentual: number;
  metricas_evolucao: {
    mes_anterior: Record<string, number>;
    mes_atual: Record<string, number>;
    tendencia: 'crescente' | 'estavel' | 'decrescente';
  };
  proximas_acoes: string[];
}

export interface AgenteLearningMetrics {
  agente: AgenteType;
  nome: string;
  total_insights: number;
  insights_ativos: number;
  taxa_aplicacao: number; // %
  impacto_medio: number; // 0-100
  ultima_melhoria: string;
  evolucao_ultimos_30d: {
    data: string;
    metrica_principal: number;
  }[];
}
