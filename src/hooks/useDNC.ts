import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface DncEntry {
  id: string;
  trace_id?: string;
  lead_id?: string;
  canal: 'whatsapp' | 'email';
  origem: 'manual' | 'auto';
  motivo?: string;
  created_at?: string;
}

interface AddDncInput {
  telefone?: string;
  email?: string;
  canal: 'whatsapp' | 'email';
  origem?: 'manual' | 'auto';
  motivo?: string;
}

export function useDNCList() {
  return useQuery<DncEntry[]>({
    queryKey: ['dnc-list'],
    queryFn: () => apiRequest<DncEntry[]>('/api/dnc/list'),
    refetchInterval: 30000, // 30 segundos
    retry: 2,
  });
}

export function useAddDNC() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddDncInput) => 
      apiRequest<{ success: boolean }>('/api/dnc/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnc-list'] });
      toast.success('Contato adicionado à lista DNC');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar DNC: ${error.message}`);
    },
  });
}

export function useRemoveDNC() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiRequest<{ success: boolean }>(`/api/dnc/remove/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnc-list'] });
      toast.success('Contato removido da lista DNC');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover DNC: ${error.message}`);
    },
  });
}
