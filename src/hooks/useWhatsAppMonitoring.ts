import { useQuery } from "@tanstack/react-query";
import { WhatsAppStatus } from "@/types/whatsapp";
import { apiRequest } from "@/lib/api";

const POLL_INTERVAL = 5000; // 5 segundos

export function useWhatsAppMonitoring() {
  return useQuery<WhatsAppStatus>({
    queryKey: ['whatsapp-monitoring'],
    queryFn: () => apiRequest<WhatsAppStatus>('/api/whatsapp/status'),
    refetchInterval: POLL_INTERVAL,
    retry: 5, // Aumentado para lidar com hibernação
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 3000, // Considera fresh por 3s
  });
}
