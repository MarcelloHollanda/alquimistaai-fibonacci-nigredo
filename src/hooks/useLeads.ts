import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome_empresa?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  uf?: string;
  cidade?: string;
  cnae?: string;
  origem?: string;
  tags?: string[];
  score?: number;
  can_send?: boolean;
  created_at?: string;
}

interface CreateLeadInput {
  nome_empresa?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  uf?: string;
  cidade?: string;
  cnae?: string;
  origem?: string;
  tags?: string[];
}

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => apiRequest<Lead[]>('/api/leads'),
    retry: 2,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLeadInput) => 
      apiRequest<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar lead: ${error.message}`);
    },
  });
}
