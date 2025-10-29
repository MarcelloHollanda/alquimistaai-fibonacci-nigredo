import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

// Tipos baseados na spec do backend C3
interface FitComercial {
  score: string;
  pontos: number;
  criterios: Record<string, { valor: string; pontos: number }>;
}

interface AnaliseSentimento {
  sentimento: string;
  tom: string;
  intensidade: number;
}

export interface ResumoComercial {
  fit_comercial: FitComercial;
  analise_sentimento_t5: AnaliseSentimento;
  intencoes_detectadas_t4: Array<{ intencao: string; confianca: number }>;
  historico_t3: {
    mensagens_enviadas: number;
    ultimas_datas: string[];
  };
  estrategia_t2: {
    campanha: string;
    abm: boolean;
    touch_sequence: string;
  };
  total_interacoes: number;
  eventos_recentes: string[];
  insights: string[];
  recomendacoes: string[];
}

export interface Agendamento {
  id: string;
  lead_id: string;
  contato_nome: string;
  empresa_nome: string;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'remarcado';
  scheduled_at: string;
  resumo_comercial?: ResumoComercial;
}

// Função para buscar agendamentos do backend real
async function fetchAgendamentos(): Promise<Agendamento[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agendamentos`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.warn('Erro ao buscar agendamentos do backend:', error);
    throw error;
  }
}

// Função para buscar detalhes de um agendamento específico
async function fetchAgendamentoById(id: string): Promise<Agendamento | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agendamentos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamento: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return null;
  }
}

// Hook para listar agendamentos
export function useAgendamentosV2() {
  return useQuery({
    queryKey: ['agendamentos-v2'],
    queryFn: fetchAgendamentos,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}

// Hook para um agendamento específico com resumo comercial completo
export function useAgendamentoV2(id: string) {
  return useQuery({
    queryKey: ['agendamento-v2', id],
    queryFn: () => fetchAgendamentoById(id),
    enabled: !!id,
    staleTime: 60000, // Dados válidos por 1 minuto
  });
}
