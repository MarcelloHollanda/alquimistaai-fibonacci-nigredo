import { useState, useEffect } from 'react';
import { useSentimentAnalysis } from './useSentimentAnalysis';
import { useFitComercial } from './useFitComercial';

interface Mensagem {
  tipo: 'lead' | 'agente';
  mensagem: string;
  sentimento?: string;
  timestamp: Date;
}

export const useConversaInteligente = (leadId: string) => {
  const [conversas, setConversas] = useState<Mensagem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { analisarSentimento, buscarHistorico } = useSentimentAnalysis();
  const { fit } = useFitComercial(leadId);

  // Carregar histórico de conversas
  useEffect(() => {
    const carregarHistorico = async () => {
      const historico = await buscarHistorico(leadId, 50);
      
      const mensagens: Mensagem[] = historico.map(analise => ({
        tipo: 'lead',
        mensagem: analise.texto_original,
        sentimento: analise.sentimento,
        timestamp: new Date(analise.created_at),
      }));
      
      setConversas(mensagens);
    };

    if (leadId) {
      carregarHistorico();
    }
  }, [leadId]);

  const enviarMensagem = async (mensagem: string) => {
    setIsLoading(true);

    try {
      // 1. Analisar sentimento
      const analise = await analisarSentimento({
        texto: mensagem,
        leadId,
        conversationId: `conv_${leadId}_${Date.now()}`,
      });

      // 2. Adicionar à conversa
      const novaMensagem: Mensagem = {
        tipo: 'lead',
        mensagem,
        sentimento: analise?.sentimento,
        timestamp: new Date(),
      };

      setConversas(prev => [...prev, novaMensagem]);

      // Sistema T4 processa e responde automaticamente
      // A resposta aparecerá via webhook/polling
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sugerirProximaAcao = () => {
    if (!fit || conversas.length === 0) return null;

    const ultimaMensagem = conversas[conversas.length - 1];
    const sentimento = ultimaMensagem.sentimento;

    // Lead irritado = atenção imediata
    if (sentimento === 'irritado') {
      return {
        acao: 'atender_urgente',
        prioridade: 'altissima',
        sugestao: 'Ligar AGORA ou enviar mensagem de desculpas',
        cor: 'red',
      };
    }

    // Lead empolgado + Fit A = agendar agora
    if (sentimento === 'empolgado' && fit.categoria === 'A') {
      return {
        acao: 'agendar_reuniao',
        prioridade: 'alta',
        sugestao: 'Propor reunião para hoje ou amanhã',
        cor: 'green',
      };
    }

    // Lead positivo + Fit B = nutrir
    if (sentimento === 'positivo' && fit.categoria === 'B') {
      return {
        acao: 'enviar_conteudo',
        prioridade: 'media',
        sugestao: 'Enviar case de sucesso ou demo gravada',
        cor: 'blue',
      };
    }

    // Lead neutro + Fit C/D = nutrição passiva
    return {
      acao: 'nutricao_automatica',
      prioridade: 'baixa',
      sugestao: 'Adicionar à sequência de email marketing',
      cor: 'gray',
    };
  };

  return {
    conversas,
    fit,
    isLoading,
    enviarMensagem,
    sugerirProximaAcao,
  };
};
