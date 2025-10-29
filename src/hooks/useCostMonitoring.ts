import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IntegrationCost {
  integration: string;
  consumed: number;
  limit: number;
  currency: string;
  lastUpdate: string;
  status: "normal" | "warning" | "critical";
}

export interface CostSummary {
  total: number;
  currency: string;
  integrations: IntegrationCost[];
}

const fetchCostData = async (): Promise<CostSummary> => {
  // Mock data para desenvolvimento
  // Quando a API estiver pronta, remova o return abaixo e descomente o try/catch
  return {
    total: 1247.50,
    currency: "BRL",
    integrations: [
      {
        integration: "WhatsApp",
        consumed: 450.00,
        limit: 1000.00,
        currency: "BRL",
        lastUpdate: new Date().toISOString(),
        status: "normal",
      },
      {
        integration: "API Evolution",
        consumed: 320.50,
        limit: 500.00,
        currency: "BRL",
        lastUpdate: new Date().toISOString(),
        status: "warning",
      },
      {
        integration: "SMS",
        consumed: 180.00,
        limit: 200.00,
        currency: "BRL",
        lastUpdate: new Date().toISOString(),
        status: "critical",
      },
      {
        integration: "Email",
        consumed: 297.00,
        limit: 500.00,
        currency: "BRL",
        lastUpdate: new Date().toISOString(),
        status: "normal",
      },
    ],
  };

  /* Quando a API estiver pronta, use este código:
  try {
    const response = await api.get("/api/costs/summary");
    return response.data;
  } catch (error) {
    throw error;
  }
  */
};

export function useCostMonitoring() {
  return useQuery({
    queryKey: ["cost-monitoring"],
    queryFn: fetchCostData,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    retry: 2,
  });
}
