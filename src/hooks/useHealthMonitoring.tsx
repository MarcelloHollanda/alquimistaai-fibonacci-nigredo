import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Metrics {
  agendamento_falha_total?: Record<string, number>;
  inbound_total: Record<string, number>;
  p95?: number;
}

interface MonitoringOptions {
  failureThreshold?: number;
  inboundDropPercent?: number;
  latencyThreshold?: number;
}

export function useHealthMonitoring(
  metrics: Metrics | undefined,
  options: MonitoringOptions = {}
) {
  const {
    failureThreshold = 5,
    inboundDropPercent = 50,
    latencyThreshold = 2000,
  } = options;

  const previousMetrics = useRef<Metrics | undefined>(undefined);
  const lastAlertTime = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!metrics || !previousMetrics.current) {
      previousMetrics.current = metrics;
      return;
    }

    const now = Date.now();
    const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutos

    // Verificar aumento súbito de falhas
    const currentFailures = Object.values(metrics.agendamento_falha_total || {}).reduce((a, b) => a + b, 0);
    const previousFailures = Object.values(previousMetrics.current.agendamento_falha_total || {}).reduce((a, b) => a + b, 0);
    const failureIncrease = currentFailures - previousFailures;

    if (
      failureIncrease >= failureThreshold &&
      (!lastAlertTime.current.failures || now - lastAlertTime.current.failures > ALERT_COOLDOWN)
    ) {
      toast.error("Aumento de falhas detectado", {
        description: `${failureIncrease} novas falhas nos últimos minutos`,
        action: {
          label: "Ver Relatórios",
          onClick: () => window.location.href = "/relatorios?tab=qualidade",
        },
      });
      lastAlertTime.current.failures = now;
    }

    // Verificar queda de inbound
    const currentInbound = (metrics.inbound_total.whatsapp || 0) + (metrics.inbound_total.email || 0);
    const previousInbound = (previousMetrics.current.inbound_total.whatsapp || 0) + (previousMetrics.current.inbound_total.email || 0);
    const inboundDrop = previousInbound > 0 ? ((previousInbound - currentInbound) / previousInbound) * 100 : 0;

    if (
      inboundDrop >= inboundDropPercent &&
      previousInbound > 0 &&
      (!lastAlertTime.current.inbound || now - lastAlertTime.current.inbound > ALERT_COOLDOWN)
    ) {
      toast.warning("Queda no volume de inbound", {
        description: `Redução de ${inboundDrop.toFixed(1)}% no volume de mensagens`,
      });
      lastAlertTime.current.inbound = now;
    }

    // Verificar latência alta
    if (
      metrics.p95 &&
      metrics.p95 > latencyThreshold &&
      (!lastAlertTime.current.latency || now - lastAlertTime.current.latency > ALERT_COOLDOWN)
    ) {
      toast.warning("Latência elevada detectada", {
        description: `P95 está em ${metrics.p95.toFixed(0)}ms (SLA: ${latencyThreshold}ms)`,
      });
      lastAlertTime.current.latency = now;
    }

    previousMetrics.current = metrics;
  }, [metrics, failureThreshold, inboundDropPercent, latencyThreshold]);
}
