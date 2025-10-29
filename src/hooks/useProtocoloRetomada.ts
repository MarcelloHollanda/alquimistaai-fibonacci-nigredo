import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface ProtocoloRetomada {
  id: string;
  lead_id: string;
  razao_social: string;
  tipo_acao: 'proposta_enviada' | 'agendamento_pendente' | 'resposta_aguardando';
  data_original: string;
  dias_sem_resposta: number;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  proximo_contato: string;
  mensagem_sugerida?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  created_at: string;
}

export const useProtocoloRetomada = () => {
  const [protocolos, setProtocolos] = useState<ProtocoloRetomada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtocolos();
    
    // Polling a cada 5 minutos para atualizar protocolos
    const interval = setInterval(fetchProtocolos, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProtocolos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/retomada/pendentes`);
      
      if (!response.ok) throw new Error('Erro ao buscar protocolos');

      const { success, data } = await response.json();
      
      if (success) {
        setProtocolos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error);
      setProtocolos([]);
    } finally {
      setLoading(false);
    }
  };

  const executarRetomada = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/retomada/${id}/executar`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Erro ao executar retomada');

      await fetchProtocolos();
    } catch (error) {
      console.error('Erro ao executar retomada:', error);
      throw error;
    }
  };

  const adiarRetomada = async (id: string, dias: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/retomada/${id}/adiar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias })
      });

      if (!response.ok) throw new Error('Erro ao adiar retomada');

      await fetchProtocolos();
    } catch (error) {
      console.error('Erro ao adiar retomada:', error);
      throw error;
    }
  };

  const cancelarRetomada = async (id: string, motivo: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/retomada/${id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });

      if (!response.ok) throw new Error('Erro ao cancelar retomada');

      await fetchProtocolos();
    } catch (error) {
      console.error('Erro ao cancelar retomada:', error);
      throw error;
    }
  };

  return {
    protocolos,
    loading,
    executarRetomada,
    adiarRetomada,
    cancelarRetomada,
    refetch: fetchProtocolos
  };
};

export const getPrioridadeConfig = (prioridade: string) => {
  const configs = {
    urgente: {
      color: 'bg-red-100 text-red-800 border-red-300',
      label: '🚨 Urgente',
      icon: '🚨'
    },
    alta: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      label: '⚡ Alta',
      icon: '⚡'
    },
    media: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: '⚠️ Média',
      icon: '⚠️'
    },
    baixa: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: '📌 Baixa',
      icon: '📌'
    }
  };
  return configs[prioridade as keyof typeof configs] || configs.media;
};
