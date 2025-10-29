import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealth, useApiStatus, useWhatsAppStatus } from '@/hooks/useBackendHealth';
import { CheckCircle, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { BackendHealthSkeleton } from '@/components/dashboard/BackendHealthSkeleton';

export function BackendHealthCheck() {
  const { data: health, isLoading: healthLoading, failureCount: healthFailures } = useHealth();
  const { data: apiStatus, isLoading: apiLoading } = useApiStatus();
  const { data: whatsappStatus, isLoading: whatsappLoading } = useWhatsAppStatus();

  const anyLoading = healthLoading || apiLoading || whatsappLoading;

  // Mostrar skeleton apenas no loading inicial
  if (anyLoading && !health && !apiStatus && !whatsappStatus) {
    return <BackendHealthSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Status do Backend C3
                {anyLoading && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real da conexão com o Replit
                {healthFailures > 0 && healthFailures <= 3 && (
                  <span className="text-warning ml-2">
                    • Reconectando (tentativa {healthFailures}/5)
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Check */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Servidor Backend</span>
            {health?.status === 'healthy' ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {healthFailures > 0 ? 'Reconectando...' : 'Offline'}
              </Badge>
            )}
          </div>

          {/* API Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status da API</span>
            {apiStatus?.status === 'running' ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Rodando
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Parado
              </Badge>
            )}
          </div>

          {/* WhatsApp Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WhatsApp</span>
            {whatsappStatus?.connected ? (
              <Badge variant="default" className="gap-1">
                <Wifi className="h-3 w-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="h-3 w-3" />
                Desconectado
              </Badge>
            )}
          </div>

          {/* Detalhes */}
          {apiStatus && (
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Versão:</span>
                <span>{apiStatus.version}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ambiente:</span>
                <span className="capitalize">{apiStatus.environment}</span>
              </div>
              {whatsappStatus?.phone && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Telefone:</span>
                  <span>{whatsappStatus.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Alertas */}
          {health?.status !== 'healthy' && (
            <Alert variant="destructive">
              <AlertDescription>
                Não foi possível conectar ao backend. Verifique se a URL está configurada corretamente em VITE_API_URL.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
