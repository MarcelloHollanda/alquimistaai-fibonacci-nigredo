import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api';

// Tipos baseados na spec do backend C3
interface FunilMetrics {
  mensagens_planejadas: number;
  mensagens_enviadas: number;
  mensagens_entregues: number;
  respostas_recebidas: number;
  agendamentos_confirmados: number;
  taxa_entrega: number;
  taxa_resposta: number;
  taxa_agendamento: number;
}

interface PerformanceCanal {
  enviadas: number;
  entregues: number;
  falhas: number;
  taxa_entrega: number;
}

export interface RelatorioDiario {
  data: string;
  periodo: 'diario';
  funil: FunilMetrics;
  performance_canais: {
    whatsapp: PerformanceCanal;
    email: PerformanceCanal;
  };
  conversas: {
    iniciadas: number;
    ativas: number;
    intencoes: Array<{ label: string; count: number }>;
    sentimentos: Array<{ label: string; count: number }>;
  };
  agendamentos: {
    confirmados: number;
    remarcados: number;
    cancelados: number;
    distribuicao_horario: Record<string, number>;
  };
  objecoes: {
    total_objecoes: number;
    top_3: Array<{
      tipo: string;
      quantidade: number;
      percentual: string;
      exemplos: string[];
    }>;
    recomendacoes_treinamento: Array<{
      categoria: string;
      acao: string;
    }>;
  };
  experimentos: {
    experimentos_ativos: number;
    resultados_significativos: number;
    vencedores_automaticos: number;
  };
  insights: Array<{
    tipo: string;
    categoria: string;
    titulo: string;
    descricao: string;
    impacto: string;
  }>;
  recomendacoes: Array<{
    categoria: string;
    titulo: string;
    descricao: string;
    prioridade: string;
  }>;
}

export interface RelatorioSemanal {
  periodo: 'semanal';
  inicio: string;
  fim: string;
  consolidado: {
    total_enviadas: number;
    total_entregues: number;
    total_respostas: number;
    total_agendamentos: number;
  };
  tendencias: Array<{
    metrica: string;
    direcao: 'subindo' | 'descendo' | 'estavel';
    magnitude: number;
    significancia: string;
  }>;
  recomendacoes: any[];
}

export interface RelatorioMensal {
  periodo: 'mensal';
  inicio: string;
  fim: string;
  consolidado: {
    total_enviadas: number;
    total_entregues: number;
    total_respostas: number;
    total_agendamentos: number;
  };
  comparacao_mes_anterior: {
    crescimento_enviadas: number;
    crescimento_respostas: number;
    crescimento_agendamentos: number;
  };
  performance_semanal: {
    semana_1: { agendamentos: number; taxa_conversao: number };
    semana_2: { agendamentos: number; taxa_conversao: number };
    semana_3: { agendamentos: number; taxa_conversao: number };
    semana_4: { agendamentos: number; taxa_conversao: number };
  };
  destaques_mes: string[];
  recomendacoes_mensais: Array<{
    categoria: string;
    titulo: string;
    descricao: string;
  }>;
}

// Funções para buscar do backend real
async function fetchRelatorioDiario(data?: string): Promise<RelatorioDiario> {
  try {
    const url = new URL(`${API_BASE_URL}/api/relatorios/diario`);
    if (data) url.searchParams.set('data', data);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar relatório diário: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido');
    }
    
    return result.data;
  } catch (error) {
    console.error('Erro ao buscar relatório diário:', error);
    throw error;
  }
}

async function fetchRelatorioSemanal(): Promise<RelatorioSemanal> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/relatorios/semanal`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar relatório semanal: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido');
    }
    
    return result.data;
  } catch (error) {
    console.error('Erro ao buscar relatório semanal:', error);
    throw error;
  }
}

async function fetchRelatorioMensal(): Promise<RelatorioMensal> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/relatorios/mensal`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar relatório mensal: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido');
    }
    
    return result.data;
  } catch (error) {
    console.error('Erro ao buscar relatório mensal:', error);
    throw error;
  }
}

// Hooks React Query
export function useRelatorioDiarioV2(data?: string) {
  return useQuery({
    queryKey: ['relatorio-v2', 'diario', data],
    queryFn: () => fetchRelatorioDiario(data),
    refetchInterval: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export function useRelatorioSemanalV2() {
  return useQuery({
    queryKey: ['relatorio-v2', 'semanal'],
    queryFn: fetchRelatorioSemanal,
    refetchInterval: 60 * 60 * 1000, // 1 hora
    retry: 2,
  });
}

export function useRelatorioMensalV2() {
  return useQuery({
    queryKey: ['relatorio-v2', 'mensal'],
    queryFn: fetchRelatorioMensal,
    refetchInterval: 24 * 60 * 60 * 1000, // 1 dia
    retry: 2,
  });
}
