import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { CorrectionsRequest, CorrectionsResponse } from "@/types/enrichment";

export function useCorrections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CorrectionsRequest) => 
      apiRequest<CorrectionsResponse>('/api/leads/corrections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`${data.corrected} correções aplicadas com sucesso`);
      
      if (data.reprocessed > 0) {
        toast.info(`${data.reprocessed} leads re-processados`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aplicar correções: ${error.message}`);
    },
  });
}
