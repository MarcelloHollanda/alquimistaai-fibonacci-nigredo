import { parsePrometheusMetrics } from "./prometheus-parser";
import { mockPrometheusMetrics } from "./mock-data";
import { getMetricsUrl, shouldUseRealApi, METRICS_CONFIG } from "./config";
import api from "./api";

/**
 * Busca métricas adicionais do dashboard do backend
 */
export async function fetchDashboardMetrics() {
  try {
    const { data } = await api.get("/dashboard");
    console.info('✅ Dashboard metrics recebidas do backend');
    return data;
  } catch (error) {
    console.warn('⚠️ Dashboard metrics não disponíveis, usando fallback');
    return null;
  }
}

/**
 * Busca métricas do servidor Prometheus
 * Usa mock como fallback se servidor não estiver disponível
 */
export async function fetchMetrics() {
  // Se não tem URL configurada, usa mock
  if (!shouldUseRealApi()) {
    console.info('📊 Usando métricas simuladas (VITE_METRICS_URL não configurada)');
    return parsePrometheusMetrics(mockPrometheusMetrics);
  }

  const url = getMetricsUrl();
  
  try {
    console.info(`📡 Buscando métricas de ${url}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), METRICS_CONFIG.timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const metrics = parsePrometheusMetrics(text);
    
    console.info('✅ Métricas recebidas do servidor');
    return metrics;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao buscar métricas:', errorMessage);

    // Fallback para mock se configurado
    if (METRICS_CONFIG.useMockFallback) {
      console.warn('⚠️ Usando dados simulados como fallback');
      return parsePrometheusMetrics(mockPrometheusMetrics);
    }

    throw error;
  }
}
