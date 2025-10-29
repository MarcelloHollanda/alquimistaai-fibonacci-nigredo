import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

// Tipos baseados na spec do backend
export interface Approval {
  id: string;
  tier: 'T1' | 'T2' | 'T3' | 'T7';
  action: string;
  status: 'pending' | 'approved' | 'rejected';
  data: any;
  created_at: string;
  approved_by?: string;
  rejected_by?: string;
  notes?: string;
  reason?: string;
}

interface ApproveRequest {
  approved_by: string;
  notes?: string;
}

interface RejectRequest {
  rejected_by: string;
  reason: string;
}

// Função para buscar aprovações pendentes
async function fetchApprovals(
  status?: 'pending' | 'approved' | 'rejected',
  tier?: 'T1' | 'T2' | 'T3' | 'T7'
): Promise<Approval[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/approvals`);
    if (status) url.searchParams.set('status', status);
    if (tier) url.searchParams.set('tier', tier);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar aprovações: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Erro ao buscar aprovações:', error);
    throw error;
  }
}

// Função para aprovar
async function approveAction(id: string, data: ApproveRequest): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/approvals/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao aprovar: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao aprovar ação:', error);
    throw error;
  }
}

// Função para rejeitar
async function rejectAction(id: string, data: RejectRequest): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/approvals/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao rejeitar: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao rejeitar ação:', error);
    throw error;
  }
}

// Hooks
export function useApprovals(
  status?: 'pending' | 'approved' | 'rejected',
  tier?: 'T1' | 'T2' | 'T3' | 'T7'
) {
  return useQuery({
    queryKey: ['approvals', status, tier],
    queryFn: () => fetchApprovals(status, tier),
    refetchInterval: 15000, // 15 segundos
  });
}

export function useApproveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveRequest }) =>
      approveAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Aprovação registrada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar: ${error.message}`);
    },
  });
}

export function useRejectAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectRequest }) =>
      rejectAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Ação rejeitada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao rejeitar: ${error.message}`);
    },
  });
}
