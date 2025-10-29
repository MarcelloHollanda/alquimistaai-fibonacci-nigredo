import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Activity, CheckCircle2, XCircle, Clock, Gauge, Calendar, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useWhatsAppMonitoring } from "@/hooks/useWhatsAppMonitoring";
import { toast } from "sonner";
import {
  formatMilliseconds,
  getProviderVariant,
  getProviderLabel,
  calculateUsagePercent,
} from "@/lib/whatsapp-utils";

export function WhatsAppMonitoring() {
  const { data: status, isLoading, error } = useWhatsAppMonitoring();
  const previousData = useRef(status);

  // Notificações em tempo real
  useEffect(() => {
    if (!status || !previousData.current) {
      previousData.current = status;
      return;
    }

    const prev = previousData.current;

    // Alertas de mudança de provider
    if (status.provider !== prev.provider) {
      toast.info(`Provider alterado: ${getProviderLabel(prev.provider)} → ${getProviderLabel(status.provider)}`);
    }

    // Alertas de janela de envio
    if (status.pacing.in_allowed_window !== prev.pacing.in_allowed_window) {
      if (!status.pacing.in_allowed_window) {
        toast.warning(`Janela de envio fechada. ${status.pacing.next_window_delay_text}`, {
          duration: 5000,
        });
      } else {
        toast.success("Janela de envio aberta! 🟢");
      }
    }

    // Alertas de uso crítico
    const usagePercent = calculateUsagePercent(status.pacing.sent_this_minute, status.pacing.cap_per_minute);
    const prevUsagePercent = calculateUsagePercent(prev.pacing.sent_this_minute, prev.pacing.cap_per_minute);

    if (usagePercent >= 90 && prevUsagePercent < 90) {
      toast.error(
        `Rate limit crítico! ${status.pacing.sent_this_minute}/${status.pacing.cap_per_minute} msgs. Reset em ${formatMilliseconds(status.pacing.minute_remaining_ms)}`,
        { duration: 7000 }
      );
    } else if (usagePercent >= 80 && prevUsagePercent < 80) {
      toast.warning(
        `Próximo do limite: ${status.pacing.sent_this_minute}/${status.pacing.cap_per_minute} msgs (${usagePercent}%)`,
        { duration: 5000 }
      );
    }

    previousData.current = status;
  }, [status]);

  const getStatusIcon = (connectionStatus?: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <Activity className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoramento WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoramento WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao conectar com o servidor de WhatsApp. Verifique as credenciais.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = calculateUsagePercent(
    status?.pacing.sent_this_minute || 0,
    status?.pacing.cap_per_minute || 30
  );

  return (
    <div className="space-y-4">
      {/* Card 1: Provider Ativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Provider Ativo
          </CardTitle>
          <CardDescription>
            Conexão atual e status de instância
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.status)}
              <span className="font-medium">
                {status?.status === 'connected' ? 'Conectado' : 
                 status?.status === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
            <Badge variant={getProviderVariant(status?.provider || 'offline')}>
              {getProviderLabel(status?.provider || 'offline')}
            </Badge>
          </div>

          {status?.instance_id && (
            <div className="text-sm">
              <span className="text-muted-foreground">Instance ID: </span>
              <code className="bg-muted px-2 py-1 rounded">{status.instance_id}</code>
            </div>
          )}

          {status?.last_message && (
            <div className="text-sm">
              <span className="text-muted-foreground">Última mensagem: </span>
              <span className="font-medium">
                {new Date(status.last_message.timestamp).toLocaleString('pt-BR')}
              </span>
              <Badge variant="outline" className="ml-2">
                {status.last_message.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Rate Limiting Dinâmico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
          <CardDescription>
            Controle de velocidade de envio em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Enviadas neste minuto
              </span>
              <span className="text-sm font-bold">
                {status?.pacing.sent_this_minute || 0} / {status?.pacing.cap_per_minute || 30} msgs
              </span>
            </div>
            <Progress 
              value={usagePercent} 
              className={`h-3 ${usagePercent >= 90 ? '[&>div]:bg-destructive' : usagePercent >= 80 ? '[&>div]:bg-warning' : ''}`}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {usagePercent}% utilizado
              </span>
              <span className="text-xs font-medium text-green-600">
                Capacidade disponível: {status?.pacing.available_this_minute || 0} msgs
              </span>
            </div>
          </div>

          {usagePercent >= 80 && (
            <Alert variant={usagePercent >= 90 ? "destructive" : "default"}>
              <AlertDescription className="text-xs">
                {usagePercent >= 90 ? (
                  <>⚠️ <strong>Limite crítico!</strong> Você usou {usagePercent}% da capacidade. O sistema pode bloquear envios.</>
                ) : (
                  <>⚠️ <strong>Próximo do limite!</strong> Você usou {usagePercent}% da capacidade.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reset em:</span>
            <span className="font-mono font-bold text-primary">
              {formatMilliseconds(status?.pacing.minute_remaining_ms || 0)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Janela de Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Janela de Envio
          </CardTitle>
          <CardDescription>
            Horário permitido para envios automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status atual:</span>
            <Badge variant={status?.pacing.in_allowed_window ? "default" : "secondary"}>
              {status?.pacing.in_allowed_window ? "🟢 Aberta" : "🔴 Fechada"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Horário:</span>
              <p className="font-medium">
                {status?.pacing.window_start} - {status?.pacing.window_end}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Timezone:</span>
              <p className="font-medium">{status?.pacing.timezone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <span className="text-sm font-medium">Dias Úteis:</span>
              <p className="text-sm text-muted-foreground">
                {status?.pacing.business_days?.join(', ') || 'Não configurado'}
              </p>
            </div>
          </div>

          {!status?.pacing.in_allowed_window && (
            <Alert>
              <AlertDescription className="text-xs">
                ℹ️ {status?.pacing.next_window_delay_text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card 4: Sistema de Redundância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sistema de Redundância (Failover)
          </CardTitle>
          <CardDescription>
            Ordem de tentativa automática entre providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant={status?.provider === 'evolution_http' ? 'default' : 'outline'}>
              1. Evolution HTTP
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={status?.provider === 'evolution_local' ? 'default' : 'outline'}>
              2. Evolution Local
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={status?.provider === 'meta_cloud' ? 'default' : 'outline'}>
              3. Meta Cloud
            </Badge>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              ✅ <strong>Failover automático:</strong> Se um provider falhar, o sistema tenta automaticamente o próximo na ordem, garantindo alta disponibilidade.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
