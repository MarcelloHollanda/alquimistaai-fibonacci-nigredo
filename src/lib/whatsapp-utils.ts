/**
 * Formatar milissegundos para formato legível "Xm Ys"
 */
export const formatMilliseconds = (ms: number): string => {
  if (ms <= 0) return "0s";
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Obter variante do badge baseado no provider
 */
export const getProviderVariant = (provider: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (provider) {
    case 'evolution_http':
      return 'default'; // azul
    case 'evolution_local':
      return 'secondary'; // cinza
    case 'meta_cloud':
      return 'outline'; // verde outline
    default:
      return 'destructive'; // vermelho
  }
};

/**
 * Obter label formatado do provider
 */
export const getProviderLabel = (provider: string): string => {
  switch (provider) {
    case 'evolution_http':
      return '☁️ Evolution Cloud';
    case 'evolution_local':
      return '🖥️ Evolution Local';
    case 'meta_cloud':
      return '📱 Meta Cloud API';
    default:
      return '❌ Offline';
  }
};

/**
 * Calcular porcentagem de uso
 */
export const calculateUsagePercent = (sent: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(Math.round((sent / limit) * 100), 100);
};

/**
 * Obter cor do progress bar baseado na porcentagem
 */
export const getProgressColor = (percent: number): string => {
  if (percent >= 90) return 'bg-destructive';
  if (percent >= 80) return 'bg-warning';
  return 'bg-primary';
};
