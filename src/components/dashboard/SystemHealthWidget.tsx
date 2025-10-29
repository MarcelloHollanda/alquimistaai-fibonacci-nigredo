import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface HealthMetrics {
  inbound_rate: number;
  proposal_success: number;
  confirmation_rate: number;
  error_rate: number;
}

interface SystemHealthWidgetProps {
  metrics?: {
    inbound_total: Record<string, number>;
    agendamento_proposta_total?: Record<string, number>;
    agendamento_confirmado_total?: Record<string, number>;
    agendamento_falha_total?: Record<string, number>;
  };
}

export function SystemHealthWidget({ metrics }: SystemHealthWidgetProps) {
  const calculateHealth = (): HealthMetrics => {
    const inboundTotal = (metrics?.inbound_total.whatsapp || 0) + (metrics?.inbound_total.email || 0);
    const proposalTotal = Object.values(metrics?.agendamento_proposta_total || {}).reduce((a, b) => a + b, 0);
    const confirmedTotal = Object.values(metrics?.agendamento_confirmado_total || {}).reduce((a, b) => a + b, 0);
    const failureTotal = Object.values(metrics?.agendamento_falha_total || {}).reduce((a, b) => a + b, 0);

    return {
      inbound_rate: inboundTotal / 60, // msgs/min (simulado)
      proposal_success: proposalTotal > 0 ? ((proposalTotal - failureTotal) / proposalTotal) * 100 : 0,
      confirmation_rate: proposalTotal > 0 ? (confirmedTotal / proposalTotal) * 100 : 0,
      error_rate: failureTotal / 24, // falhas/hora (simulado)
    };
  };

  const getOverallStatus = (health: HealthMetrics): "ok" | "attention" | "critical" => {
    if (health.error_rate > 15 || health.confirmation_rate < 60) return "critical";
    if (health.error_rate > 5 || health.confirmation_rate < 80) return "attention";
    return "ok";
  };

  const health = calculateHealth();
  const status = getOverallStatus(health);

  const statusConfig = {
    ok: {
      label: "Sistema OK",
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-success",
    },
    attention: {
      label: "Atenção",
      variant: "secondary" as const,
      icon: AlertTriangle,
      color: "text-warning",
    },
    critical: {
      label: "Crítico",
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-destructive",
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Saúde do Sistema
          </CardTitle>
          <Badge variant={statusConfig[status].variant} className="flex items-center gap-1">
            <StatusIcon className={`h-3 w-3 ${statusConfig[status].color}`} />
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Inbound Rate</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {health.inbound_rate.toFixed(1)}
              <span className="text-sm text-muted-foreground">msgs/min</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Taxa de Confirmação</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {health.confirmation_rate.toFixed(1)}
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Sucesso em Propostas</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {health.proposal_success.toFixed(1)}
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Taxa de Erro</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {health.error_rate.toFixed(1)}
              <span className="text-sm text-muted-foreground">/hora</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
