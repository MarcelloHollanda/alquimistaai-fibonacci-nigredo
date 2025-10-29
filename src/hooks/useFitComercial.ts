import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface CriterioFit {
  nome: string;
  pontos: number;
  max: number;
  match: boolean;
}

interface FitComercial {
  lead_id: string;
  score: number;
  categoria: 'A' | 'B' | 'C' | 'D';
  criterios: CriterioFit[];
  recomendacao: string;
  created_at: string;
}

export const useFitComercial = (leadId: string) => {
  const [fit, setFit] = useState<FitComercial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFit = async () => {
      // Verificar cache (24h)
      const cacheKey = `fit_${leadId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cachedData = JSON.parse(cached);
        const age = Date.now() - new Date(cachedData.created_at).getTime();
        
        if (age < 24 * 60 * 60 * 1000) {
          setFit(cachedData);
          setLoading(false);
          return;
        }
      }

      // Buscar da API
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/fit/${leadId}/calcular`,
          { method: 'POST' }
        );

        if (!response.ok) throw new Error('Erro ao calcular fit');

        const { success, data } = await response.json();
        
        if (!success) throw new Error('Cálculo falhou');

        setFit(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error('Erro ao calcular fit:', error);
        
        // Fallback
        setFit({
          lead_id: leadId,
          score: 50,
          categoria: 'C',
          criterios: [],
          recomendacao: 'Nutrição necessária',
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchFit();
    }
  }, [leadId]);

  const recalcular = async () => {
    setLoading(true);
    localStorage.removeItem(`fit_${leadId}`);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/fit/${leadId}/calcular`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Erro ao recalcular fit');

      const { success, data } = await response.json();
      
      if (!success) throw new Error('Recálculo falhou');

      setFit(data);
      localStorage.setItem(`fit_${leadId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao recalcular fit:', error);
    } finally {
      setLoading(false);
    }
  };

  return { fit, loading, recalcular };
};

export const getCategoriaConfig = (categoria: string) => {
  const configs = {
    A: { 
      color: 'bg-green-600 text-white', 
      label: '⭐ Fit A - Prioritário',
      description: 'Fit perfeito - prioridade máxima'
    },
    B: { 
      color: 'bg-blue-600 text-white', 
      label: '🎯 Fit B - Qualificado',
      description: 'Bom fit - prioridade alta'
    },
    C: { 
      color: 'bg-yellow-600 text-white', 
      label: '⚡ Fit C - Nutrição',
      description: 'Fit moderado - nutrição necessária'
    },
    D: { 
      color: 'bg-gray-600 text-white', 
      label: '📊 Fit D - Baixa Prioridade',
      description: 'Baixo fit - nutrição passiva'
    }
  };
  return configs[categoria as keyof typeof configs] || configs.D;
};
