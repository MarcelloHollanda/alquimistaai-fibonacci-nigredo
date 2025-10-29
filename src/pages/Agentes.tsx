import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Lightbulb, CheckSquare, Send, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { parsePrometheusMetrics } from "@/lib/prometheus-parser";
import { mockPrometheusMetrics } from "@/lib/mock-data";
import { TermTooltip } from "@/components/ui/term-tooltip";

const AGENTES = [
  {
    id: "recebimento",
    nome: "Recebimento",
    icon: Upload,
    descricao: "Ingesta e higienização de leads via CSV, API ou webhook",
    eventos_consome: ["lead_raw"],
    eventos_emite: ["lead_processed", "lead_duplicated", "lead_invalid"],
    sla_alvo: "< 2s",
    metrica_key: "lead_processed",
  },
  {
    id: "estrategia",
    nome: "Estratégia",
    icon: Lightbulb,
    descricao: "Geração de templates parametrizados por estágio (TOPO/MEIO/FUNDO)",
    eventos_consome: ["lead_processed"],
    eventos_emite: ["estrategia_gerada"],
    sla_alvo: "< 5s",
    metrica_key: null,
  },
  {
    id: "aprovacao",
    nome: "Aprovação",
    icon: CheckSquare,
    descricao: "Gerenciamento de aprovações com quatro-olhos",
    eventos_consome: ["estrategia_gerada", "disparo_solicitado"],
    eventos_emite: ["aprovacao_concedida", "aprovacao_negada"],
    sla_alvo: "manual",
    metrica_key: null,
  },
  {
    id: "disparo",
    nome: "Disparo",
    icon: Send,
    descricao: "Orquestração de envios WhatsApp/Email via workers",
    eventos_consome: ["aprovacao_concedida"],
    eventos_emite: ["disparo_ok", "disparo_fail"],
    sla_alvo: "< 10s",
    metrica_key: "disparo_ok",
  },
  {
    id: "atendimento",
    nome: "Atendimento",
    icon: MessageSquare,
    descricao: "Captura e roteamento de mensagens inbound",
    eventos_consome: ["inbound_whatsapp", "inbound_email"],
    eventos_emite: ["conversa_nova", "conversa_atualizada"],
    sla_alvo: "< 1s",
    metrica_key: "inbound_whatsapp",
  },
  {
    id: "sentimento",
    nome: "Sentimento",
    icon: TrendingUp,
    descricao: "Análise de intenção e sentimento via LLM",
    eventos_consome: ["conversa_atualizada"],
    eventos_emite: ["intencao_detectada"],
    sla_alvo: "< 3s",
    metrica_key: null,
  },
  {
    id: "agendamento",
    nome: "Agendamento",
    icon: Calendar,
    descricao: "Proposta de 2 horários, confirmação e emissão de convite",
    eventos_consome: ["intencao_detectada"],
    eventos_emite: ["agendamento_proposto", "agendamento_confirmado", "agendamento_falha"],
    sla_alvo: "< 5s",
    metrica_key: "agendamento_confirmado",
  },
];

export default function Agentes() {
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => parsePrometheusMetrics(mockPrometheusMetrics),
    refetchInterval: 15000,
  });

  const getVolume24h = (metricaKey: string | null) => {
    if (!metricaKey || !metrics) return "—";
    
    if (metricaKey === "disparo_ok") {
      return ((metrics.disparo_total["whatsapp|ok"] || 0) + (metrics.disparo_total["email|ok"] || 0)).toLocaleString();
    }
    
    if (metricaKey === "inbound_whatsapp") {
      return (metrics.inbound_total["whatsapp"] || 0).toLocaleString();
    }
    
    if (metricaKey === "agendamento_confirmado") {
      return ((metrics.agendamento_confirmado_total["whatsapp"] || 0) + (metrics.agendamento_confirmado_total["email"] || 0)).toLocaleString();
    }
    
    if (metrics.event_total[metricaKey]) {
      return metrics.event_total[metricaKey].toLocaleString();
    }
    
    return "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
        <p className="text-muted-foreground">
          Arquitetura orientada a eventos com 7 agentes especializados
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {AGENTES.map((agente) => {
          const Icon = agente.icon;
          return (
            <Card key={agente.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{agente.nome}</CardTitle>
                  </div>
                  <TermTooltip term="SLA">
                    <Badge variant="outline">{agente.sla_alvo}</Badge>
                  </TermTooltip>
                </div>
                <CardDescription>{agente.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Eventos Consumidos
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agente.eventos_consome.map((evento) => (
                      <Badge key={evento} variant="secondary" className="text-xs">
                        {evento}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Eventos Emitidos
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agente.eventos_emite.map((evento) => (
                      <Badge key={evento} variant="outline" className="text-xs">
                        {evento}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Volume 24h</span>
                    <span className="text-lg font-bold">
                      {getVolume24h(agente.metrica_key)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
