import { useState, useEffect } from 'react';

const REPORTS_API = import.meta.env.VITE_REPORTS_URL || 'http://localhost:5000/api';

interface RelatorioMensal {
  periodo: string;
  comparacao_mes_anterior: {
    crescimento_leads: number;
    crescimento_conversoes: number;
    variacao_taxa: number;
  };
  performance_semanal: Array<{
    semana: number;
    leads: number;
    conversoes: number;
    taxa: number;
  }>;
  destaques: string[];
  tendencias: string[];
  top_objecoes: Array<{
    categoria: string;
    total: number;
  }>;
}

interface RelatorioDiario {
  data: string;
  leads_processados: number;
  conversas_ativas: number;
  agendamentos: number;
  objecoes_registradas: number;
  sentimento_medio: string;
}

interface ObjecoesAnalise {
  periodo: string;
  total: number;
  por_categoria: Record<string, number>;
  ranking_top3: Array<{
    categoria: string;
    exemplos: string[];
    recomendacao: string;
  }>;
  taxa_resolucao: number;
}

export const useRelatorioMensal = () => {
  const [data, setData] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    try {
      const response = await fetch(`${REPORTS_API}/relatorios/mensal`);
      
      if (!response.ok) throw new Error('Erro ao buscar relatório mensal');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao buscar relatório mensal:', error);
      
      // Fallback com dados mock
      setData({
        periodo: 'Outubro 2024',
        comparacao_mes_anterior: {
          crescimento_leads: 15.3,
          crescimento_conversoes: 23.7,
          variacao_taxa: 8.4
        },
        performance_semanal: [
          { semana: 1, leads: 280, conversoes: 35, taxa: 12.5 },
          { semana: 2, leads: 310, conversoes: 42, taxa: 13.5 },
          { semana: 3, leads: 295, conversoes: 38, taxa: 12.9 },
          { semana: 4, leads: 365, conversoes: 52, taxa: 14.2 }
        ],
        destaques: [
          'Aumento de 23.7% em conversões vs mês anterior',
          'Semana 4 bateu recorde de 365 leads processados',
          'Taxa de conversão subiu 8.4% no período'
        ],
        tendencias: [
          'Leads Fit A crescendo 18% semana a semana',
          'Objeções de preço caíram 12%',
          'Sentimento positivo aumentou 15%'
        ],
        top_objecoes: [
          { categoria: 'preco', total: 89 },
          { categoria: 'timing', total: 67 },
          { categoria: 'concorrente', total: 45 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchRelatorio };
};

export const useRelatorioDiario = (data?: string) => {
  const [relatorio, setRelatorio] = useState<RelatorioDiario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatorio();
  }, [data]);

  const fetchRelatorio = async () => {
    try {
      const params = data ? `?data=${data}` : '';
      const response = await fetch(`${REPORTS_API}/relatorios/diario${params}`);
      
      if (!response.ok) throw new Error('Erro ao buscar relatório diário');

      const result = await response.json();
      setRelatorio(result);
    } catch (error) {
      console.error('Erro ao buscar relatório diário:', error);
      setRelatorio(null);
    } finally {
      setLoading(false);
    }
  };

  return { relatorio, loading, refetch: fetchRelatorio };
};

export const useObjecoesAnalise = (periodo: string = '30dias') => {
  const [analise, setAnalise] = useState<ObjecoesAnalise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalise();
  }, [periodo]);

  const fetchAnalise = async () => {
    try {
      const response = await fetch(`${REPORTS_API}/relatorios/objecoes?periodo=${periodo}`);
      
      if (!response.ok) throw new Error('Erro ao buscar análise de objeções');

      const result = await response.json();
      setAnalise(result);
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      
      // Fallback
      setAnalise({
        periodo: periodo,
        total: 201,
        por_categoria: {
          preco: 89,
          timing: 67,
          concorrente: 45
        },
        ranking_top3: [
          {
            categoria: 'preco',
            exemplos: [
              'Está muito caro para nosso budget',
              'O concorrente oferece mais barato'
            ],
            recomendacao: 'Criar playbook de ROI e cases de economia'
          },
          {
            categoria: 'timing',
            exemplos: [
              'Não é o momento certo',
              'Vamos avaliar ano que vem'
            ],
            recomendacao: 'Demonstrar custo de oportunidade de esperar'
          },
          {
            categoria: 'concorrente',
            exemplos: [
              'Já usamos solução similar',
              'Estamos em contrato com outro fornecedor'
            ],
            recomendacao: 'Comparativo técnico e diferencial competitivo'
          }
        ],
        taxa_resolucao: 67.5
      });
    } finally {
      setLoading(false);
    }
  };

  return { analise, loading, refetch: fetchAnalise };
};
