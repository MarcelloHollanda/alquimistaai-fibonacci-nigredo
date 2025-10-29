import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface ResumoComercial {
  historico_higienizacao?: {
    status: string;
    data: string;
  };
  fit_comercial?: {
    score: number;
    categoria: 'A' | 'B' | 'C' | 'D';
  };
  sentimento_atual?: {
    sentimento: string;
    intensidade: number;
  };
  conversas_recentes?: number;
  ultima_interacao?: string;
}

interface Agendamento {
  id: string;
  lead_id: string;
  razao_social: string;
  tipo: 'reuniao' | 'demo' | 'followup' | 'proposta';
  data_hora: string;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  resumo_comercial?: ResumoComercial;
  notas?: string;
  created_at: string;
}

export const useAgendamentos = (leadId?: string) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamentos();
  }, [leadId]);

  const fetchAgendamentos = async () => {
    try {
      const endpoint = leadId 
        ? `${API_BASE_URL}/api/agendamentos/lead/${leadId}`
        : `${API_BASE_URL}/api/agendamentos`;

      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error('Erro ao buscar agendamentos');

      const { success, data } = await response.json();
      
      if (success) {
        setAgendamentos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const criarAgendamento = async (dados: {
    lead_id: string;
    tipo: string;
    data_hora: string;
    notas?: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!response.ok) throw new Error('Erro ao criar agendamento');

      const { success, data } = await response.json();
      
      if (success) {
        await fetchAgendamentos();
        return data;
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agendamentos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      await fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  return {
    agendamentos,
    loading,
    criarAgendamento,
    atualizarStatus,
    refetch: fetchAgendamentos
  };
};

export const getStatusColor = (status: string) => {
  const colors = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    concluido: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800'
  };
  return colors[status as keyof typeof colors] || colors.agendado;
};

export const getTipoIcon = (tipo: string) => {
  const icons = {
    reuniao: '📅',
    demo: '🎥',
    followup: '🔄',
    proposta: '📋'
  };
  return icons[tipo as keyof typeof icons] || '📅';
};
