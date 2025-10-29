import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Objecao {
  id: string;
  lead_id: string;
  categoria: 'preco' | 'timing' | 'concorrente' | 'funcionalidade' | 'decisao' | 'outros';
  texto_original: string;
  resposta_sugerida?: string;
  foi_resolvida: boolean;
  created_at: string;
}

interface EstatisticasObjecoes {
  total: number;
  por_categoria: Record<string, number>;
  taxa_resolucao: number;
  objecoes_recorrentes: Array<{
    categoria: string;
    count: number;
    exemplos: string[];
  }>;
  tendencia_mensal: Array<{
    mes: string;
    total: number;
  }>;
}

export const useAnaliseObjecoes = (leadId?: string) => {
  const [objecoes, setObjecoes] = useState<Objecao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasObjecoes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObjecoes();
    fetchEstatisticas();
  }, [leadId]);

  const fetchObjecoes = async () => {
    try {
      const endpoint = leadId
        ? `${API_BASE_URL}/api/objecoes/lead/${leadId}`
        : `${API_BASE_URL}/api/objecoes`;

      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error('Erro ao buscar objeções');

      const { success, data } = await response.json();
      
      if (success) {
        setObjecoes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar objeções:', error);
      setObjecoes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objecoes/estatisticas`);
      
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');

      const { success, data } = await response.json();
      
      if (success) {
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const registrarObjecao = async (dados: {
    lead_id: string;
    categoria: string;
    texto_original: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objecoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!response.ok) throw new Error('Erro ao registrar objeção');

      const { success, data } = await response.json();
      
      if (success) {
        await fetchObjecoes();
        await fetchEstatisticas();
        return data;
      }
    } catch (error) {
      console.error('Erro ao registrar objeção:', error);
      throw error;
    }
  };

  const marcarResolvida = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objecoes/${id}/resolver`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Erro ao marcar objeção como resolvida');

      await fetchObjecoes();
      await fetchEstatisticas();
    } catch (error) {
      console.error('Erro ao marcar objeção:', error);
      throw error;
    }
  };

  return {
    objecoes,
    estatisticas,
    loading,
    registrarObjecao,
    marcarResolvida,
    refetch: fetchObjecoes
  };
};

export const getCategoriaObjecaoConfig = (categoria: string) => {
  const configs = {
    preco: {
      color: 'bg-red-100 text-red-800',
      label: '💰 Preço',
      icon: '💰'
    },
    timing: {
      color: 'bg-yellow-100 text-yellow-800',
      label: '⏰ Timing',
      icon: '⏰'
    },
    concorrente: {
      color: 'bg-purple-100 text-purple-800',
      label: '🏢 Concorrente',
      icon: '🏢'
    },
    funcionalidade: {
      color: 'bg-blue-100 text-blue-800',
      label: '⚙️ Funcionalidade',
      icon: '⚙️'
    },
    decisao: {
      color: 'bg-orange-100 text-orange-800',
      label: '👥 Decisão',
      icon: '👥'
    },
    outros: {
      color: 'bg-gray-100 text-gray-800',
      label: '📝 Outros',
      icon: '📝'
    }
  };
  return configs[categoria as keyof typeof configs] || configs.outros;
};
