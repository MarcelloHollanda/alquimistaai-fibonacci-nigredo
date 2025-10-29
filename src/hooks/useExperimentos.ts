import { useState, useEffect } from 'react';

const EXPERIMENTS_API = import.meta.env.VITE_REPORTS_URL || 'http://localhost:5000/api';

interface ExperimentoVariante {
  id: string;
  nome: string;
  enviados: number;
  abertos: number;
  respondidos: number;
  taxa_conversao: number;
}

interface Experimento {
  id: string;
  nome: string;
  tipo: 'template' | 'horario' | 'canal';
  status: 'ativo' | 'concluido' | 'pausado';
  criado_em: string;
  variantes: ExperimentoVariante[];
  significancia_estatistica?: number;
  vencedor?: string;
  aplicado_automaticamente?: boolean;
}

interface ResultadoExperimento {
  id: string;
  nome: string;
  vencedor: {
    variante: string;
    taxa_conversao: number;
    melhoria: number; // % vs controle
  };
  significancia: number; // p-value
  confianca: number; // %
  recomendacao: string;
}

export const useExperimentos = () => {
  const [experimentos, setExperimentos] = useState<Experimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperimentos();
  }, []);

  const fetchExperimentos = async () => {
    try {
      const response = await fetch(`${EXPERIMENTS_API}/experimentos`);
      
      if (!response.ok) throw new Error('Erro ao buscar experimentos');

      const result = await response.json();
      setExperimentos(result);
    } catch (error) {
      console.error('Erro ao buscar experimentos:', error);
      
      // Fallback com dados mock
      setExperimentos([
        {
          id: 'exp_001',
          nome: 'Template TOPO - Variação de Abertura',
          tipo: 'template',
          status: 'ativo',
          criado_em: '2024-10-01',
          variantes: [
            {
              id: 'v1',
              nome: 'Controle - Formal',
              enviados: 500,
              abertos: 245,
              respondidos: 89,
              taxa_conversao: 17.8
            },
            {
              id: 'v2',
              nome: 'Variante A - Casual',
              enviados: 500,
              abertos: 312,
              respondidos: 127,
              taxa_conversao: 25.4
            },
            {
              id: 'v3',
              nome: 'Variante B - Pergunta',
              enviados: 500,
              abertos: 289,
              respondidos: 103,
              taxa_conversao: 20.6
            }
          ],
          significancia_estatistica: 0.023,
          vencedor: 'v2'
        },
        {
          id: 'exp_002',
          nome: 'Horário de Envio - MEIO',
          tipo: 'horario',
          status: 'concluido',
          criado_em: '2024-09-15',
          variantes: [
            {
              id: 'v1',
              nome: 'Manhã (9h-12h)',
              enviados: 300,
              abertos: 198,
              respondidos: 67,
              taxa_conversao: 22.3
            },
            {
              id: 'v2',
              nome: 'Tarde (14h-17h)',
              enviados: 300,
              abertos: 234,
              respondidos: 89,
              taxa_conversao: 29.7
            }
          ],
          significancia_estatistica: 0.018,
          vencedor: 'v2',
          aplicado_automaticamente: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { experimentos, loading, refetch: fetchExperimentos };
};

export const useResultadoExperimento = (id: string) => {
  const [resultado, setResultado] = useState<ResultadoExperimento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchResultado();
  }, [id]);

  const fetchResultado = async () => {
    try {
      const response = await fetch(`${EXPERIMENTS_API}/experimentos/${id}/resultado`);
      
      if (!response.ok) throw new Error('Erro ao buscar resultado');

      const result = await response.json();
      setResultado(result);
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return { resultado, loading, refetch: fetchResultado };
};

export const useVencedoresExperimentos = () => {
  const [vencedores, setVencedores] = useState<ResultadoExperimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVencedores();
  }, []);

  const fetchVencedores = async () => {
    try {
      const response = await fetch(`${EXPERIMENTS_API}/experimentos/vencedores`);
      
      if (!response.ok) throw new Error('Erro ao buscar vencedores');

      const result = await response.json();
      setVencedores(result);
    } catch (error) {
      console.error('Erro ao buscar vencedores:', error);
      setVencedores([]);
    } finally {
      setLoading(false);
    }
  };

  return { vencedores, loading, refetch: fetchVencedores };
};

export const getSignificanciaLabel = (pValue: number): { label: string; color: string } => {
  if (pValue < 0.01) {
    return { label: 'Altamente Significativo', color: 'bg-green-100 text-green-800' };
  } else if (pValue < 0.05) {
    return { label: 'Significativo', color: 'bg-blue-100 text-blue-800' };
  } else if (pValue < 0.1) {
    return { label: 'Marginalmente Significativo', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Não Significativo', color: 'bg-gray-100 text-gray-800' };
  }
};
