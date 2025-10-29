import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface AnaliseSentimentoRequest {
  texto: string;
  leadId?: string;
  conversationId?: string;
  historico?: Array<{
    direcao: 'inbound' | 'outbound';
    conteudo: string;
  }>;
}

interface AnaliseSentimentoResponse {
  sentimento: 'positivo' | 'negativo' | 'neutro' | 'irritado' | 'empolgado';
  tom: 'formal' | 'informal' | 'profissional' | 'casual';
  intensidade: number;
  intencao_oculta: string;
  contexto_emocional: string;
  emojis_detectados: string[];
  sinais_ironia: boolean;
  recomendacao_resposta: string;
  metodo: 'openai' | 'keywords';
  timestamp: string;
}

interface HistoricoAnalise {
  id: string;
  lead_id: string;
  conversation_id: string;
  texto_original: string;
  sentimento: string;
  tom: string;
  intensidade: number;
  metodo: string;
  created_at: string;
}

interface EstatisticasSentimento {
  total_analises: number;
  sentimento_predominante: string;
  tom_predominante: string;
  intensidade_media: number;
  distribuicao_sentimentos: Record<string, number>;
  evolucao_emocional: 'melhorando' | 'piorando' | 'estavel';
}

export const useSentimentAnalysis = () => {
  const analisarSentimento = async (
    request: AnaliseSentimentoRequest
  ): Promise<AnaliseSentimentoResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sentimento/analisar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error('Erro na análise');

      const { success, data } = await response.json();
      if (!success) throw new Error('Análise falhou');

      return data;
    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      
      // Fallback: análise básica
      return {
        sentimento: 'neutro',
        tom: 'casual',
        intensidade: 5,
        intencao_oculta: 'Não foi possível determinar',
        contexto_emocional: 'Análise offline',
        emojis_detectados: [],
        sinais_ironia: false,
        metodo: 'keywords',
        recomendacao_resposta: 'Resposta padrão',
        timestamp: new Date().toISOString(),
      };
    }
  };

  const buscarHistorico = async (
    leadId: string,
    limit: number = 10
  ): Promise<HistoricoAnalise[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sentimento/historico/${leadId}?limit=${limit}`
      );

      if (!response.ok) throw new Error('Erro ao buscar histórico');

      const { success, data } = await response.json();
      if (!success) throw new Error('Busca falhou');

      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  const buscarEstatisticas = async (
    leadId: string
  ): Promise<EstatisticasSentimento | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sentimento/estatisticas/${leadId}`
      );

      if (!response.ok) throw new Error('Erro ao buscar estatísticas');

      const { success, data } = await response.json();
      if (!success) throw new Error('Busca falhou');

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  };

  return {
    analisarSentimento,
    buscarHistorico,
    buscarEstatisticas,
  };
};

export const useSentimentHistory = (leadId: string, limit: number = 20) => {
  const [historico, setHistorico] = useState<HistoricoAnalise[]>([]);
  const [loading, setLoading] = useState(true);
  const { buscarHistorico } = useSentimentAnalysis();

  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      const data = await buscarHistorico(leadId, limit);
      setHistorico(data);
      setLoading(false);
    };

    if (leadId) {
      fetchHistorico();
    }
  }, [leadId, limit]);

  return { historico, loading };
};

export const useSentimentStats = (leadId: string) => {
  const [stats, setStats] = useState<EstatisticasSentimento | null>(null);
  const [loading, setLoading] = useState(true);
  const { buscarEstatisticas } = useSentimentAnalysis();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await buscarEstatisticas(leadId);
      setStats(data);
      setLoading(false);
    };

    if (leadId) {
      fetchStats();
    }
  }, [leadId]);

  return { stats, loading };
};
