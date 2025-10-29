import { useState, useEffect } from 'react';
import { Insight, CicloAprendizado, AgenteLearningMetrics, AgenteType } from '@/types/learning';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useLearningSystem = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const registrarInsight = async (insight: Omit<Insight, 'id' | 'created_at' | 'status'>) => {
    try {
      const response = await fetch(`${API_BASE}/learning/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...insight,
          status: 'identificado',
        }),
      });

      if (!response.ok) throw new Error('Erro ao registrar insight');

      const novoInsight = await response.json();
      setInsights(prev => [...prev, novoInsight]);
      return novoInsight;
    } catch (error) {
      console.error('Erro ao registrar insight:', error);
      
      // Fallback local
      const novoInsight: Insight = {
        ...insight,
        id: `insight_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'identificado',
      };
      setInsights(prev => [...prev, novoInsight]);
      return novoInsight;
    }
  };

  const aplicarInsight = async (insightId: string) => {
    try {
      await fetch(`${API_BASE}/learning/insights/${insightId}/aplicar`, {
        method: 'POST',
      });

      setInsights(prev =>
        prev.map(i => i.id === insightId ? { ...i, status: 'aplicado' as const } : i)
      );
    } catch (error) {
      console.error('Erro ao aplicar insight:', error);
    }
  };

  const validarInsight = async (insightId: string, metricasDepois: Record<string, number>) => {
    try {
      await fetch(`${API_BASE}/learning/insights/${insightId}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metricas_depois: metricasDepois }),
      });

      setInsights(prev =>
        prev.map(i =>
          i.id === insightId
            ? { ...i, status: 'validado' as const, metricas_depois: metricasDepois, validated_at: new Date().toISOString() }
            : i
        )
      );
    } catch (error) {
      console.error('Erro ao validar insight:', error);
    }
  };

  return {
    insights,
    loading,
    registrarInsight,
    aplicarInsight,
    validarInsight,
  };
};

export const useCicloAprendizado = (agente: AgenteType) => {
  const [ciclo, setCiclo] = useState<CicloAprendizado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCiclo();
  }, [agente]);

  const fetchCiclo = async () => {
    try {
      const response = await fetch(`${API_BASE}/learning/ciclos/${agente}`);
      
      if (!response.ok) throw new Error('Erro ao buscar ciclo');

      const data = await response.json();
      setCiclo(data);
    } catch (error) {
      console.error('Erro ao buscar ciclo:', error);
      
      // Mock data para demonstração
      setCiclo({
        agente,
        periodo: new Date().toISOString().slice(0, 7),
        insights_gerados: Math.floor(Math.random() * 15) + 5,
        insights_aplicados: Math.floor(Math.random() * 10) + 3,
        melhoria_percentual: Math.random() * 25 + 5,
        metricas_evolucao: {
          mes_anterior: { taxa_sucesso: 72, qualidade: 85 },
          mes_atual: { taxa_sucesso: 78, qualidade: 89 },
          tendencia: 'crescente',
        },
        proximas_acoes: [
          'Testar novo framework de mensagem',
          'Ajustar timing de disparo',
          'Melhorar detecção de sentimento',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return { ciclo, loading, refetch: fetchCiclo };
};

export const useAgentesMetrics = () => {
  const [metricas, setMetricas] = useState<AgenteLearningMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricas();
  }, []);

  const fetchMetricas = async () => {
    try {
      const response = await fetch(`${API_BASE}/learning/agentes/metrics`);
      
      if (!response.ok) throw new Error('Erro ao buscar métricas');

      const data = await response.json();
      setMetricas(data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      
      // Mock data
      const agentes: AgenteType[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const nomes = {
        T1: 'Higienização',
        T2: 'Estratégia',
        T3: 'Disparo',
        T4: 'Atendimento',
        T5: 'Qualificação',
        T6: 'Agendamento',
        T7: 'Relatórios',
      };

      setMetricas(
        agentes.map(agente => ({
          agente,
          nome: nomes[agente],
          total_insights: Math.floor(Math.random() * 50) + 10,
          insights_ativos: Math.floor(Math.random() * 20) + 5,
          taxa_aplicacao: Math.random() * 40 + 60,
          impacto_medio: Math.random() * 30 + 70,
          ultima_melhoria: `${Math.floor(Math.random() * 15) + 1} dias atrás`,
          evolucao_ultimos_30d: Array.from({ length: 30 }, (_, i) => ({
            data: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            metrica_principal: 70 + Math.random() * 20 + i * 0.3,
          })),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  return { metricas, loading, refetch: fetchMetricas };
};
