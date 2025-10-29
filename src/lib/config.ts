// Configuração da API de métricas Prometheus
export const METRICS_CONFIG = {
  // URL do servidor de métricas (backend Node.js/Express)
  // Em produção, configure via variável de ambiente
  baseUrl: import.meta.env.VITE_METRICS_URL || '',
  
  // Endpoint de métricas Prometheus
  metricsPath: '/metrics',
  
  // Intervalo de refetch em milissegundos
  refetchInterval: 15000,
  
  // Timeout para requisição
  timeout: 10000,
  
  // Usar dados mock quando servidor não disponível
  useMockFallback: true,
};

/**
 * Retorna a URL completa do endpoint de métricas
 */
export function getMetricsUrl(): string {
  if (!METRICS_CONFIG.baseUrl) {
    console.warn('VITE_METRICS_URL não configurada. Usando dados simulados.');
    return '';
  }
  return `${METRICS_CONFIG.baseUrl}${METRICS_CONFIG.metricsPath}`;
}

/**
 * Verifica se deve usar API real ou mock
 */
export function shouldUseRealApi(): boolean {
  return Boolean(METRICS_CONFIG.baseUrl);
}
