import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface InboundMessage {
  id: string;
  telefone_origem: string;
  mensagem: string;
  nome_contato?: string;
  tipo_msg?: string;
  created_at: string;
}

interface InboundSummary {
  total_mensagens: number;
  ultimas_24h: number;
  pendentes_resposta: number;
}

export function useInboundMessages(limit = 50, offset = 0) {
  return useQuery<InboundMessage[]>({
    queryKey: ['inbound-messages', limit, offset],
    queryFn: () => apiRequest<InboundMessage[]>(`/api/inbound/messages?limit=${limit}&offset=${offset}`),
    refetchInterval: 10000, // 10 segundos
    retry: 2,
  });
}

export function useInboundSummary() {
  return useQuery<InboundSummary>({
    queryKey: ['inbound-summary'],
    queryFn: () => apiRequest<InboundSummary>('/api/inbound/summary'),
    refetchInterval: 30000, // 30 segundos
    retry: 2,
  });
}
