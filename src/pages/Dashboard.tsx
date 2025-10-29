import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Users, MessageSquare, Send, Calendar, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { SystemHealthWidget } from "@/components/dashboard/SystemHealthWidget";
import { AgentsStatusWidget } from "@/components/dashboard/AgentsStatusWidget";
import { InboundActivityWidget } from "@/components/dashboard/InboundActivityWidget";
import { SentimentosPainel } from "@/components/dashboard/SentimentosPainel";
import { AlertasLeadsIrritados } from "@/components/dashboard/AlertasLeadsIrritados";
import { ABMIndicators } from "@/components/dashboard/ABMIndicators";
import { FeedbackOptimizationPanel } from "@/components/dashboard/FeedbackOptimizationPanel";
import { useHealthMonitoring } from "@/hooks/useHealthMonitoring";
import { fetchMetrics } from "@/lib/metrics-api";
import { shouldUseRealApi } from "@/lib/config";

export default function Dashboard() {
  const { data: metrics, isError, error } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 15000,
    retry: 2,
  });

  // Monitoramento proativo
  useHealthMonitoring(metrics);

  const isUsingRealApi = shouldUseRealApi();

  const totalFailures = Object.values(metrics?.agendamento_falha_total || {}).reduce((a, b) => a + b, 0);

  const kpis = [
    {
      title: "Leads Higienizados",
      value: metrics?.event_total["lead_processed"] || 0,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      tooltip: "Leads que passaram pelo processo de higienização (validação de dados, enriquecimento e padronização). Um aumento indica maior volume de leads sendo processados pela operação.",
    },
    {
      title: "Inbound WhatsApp",
      value: metrics?.inbound_total["whatsapp"] || 0,
      icon: MessageSquare,
      trend: "+8%",
      trendUp: true,
      tooltip: "Total de mensagens recebidas via WhatsApp. Representa o engajamento dos leads com sua prospecção. Crescimento indica que suas mensagens estão gerando retorno.",
    },
    {
      title: "Envios OK",
      value: (metrics?.disparo_total["whatsapp|ok"] || 0) + (metrics?.disparo_total["email|ok"] || 0),
      icon: Send,
      trend: "-3%",
      trendUp: false,
      tooltip: "Mensagens enviadas com sucesso (WhatsApp + Email). Queda pode indicar problemas técnicos, limites de API ou necessidade de revisar segmentação de envios.",
    },
    {
      title: "Agendamentos Confirmados",
      value: (metrics?.agendamento_confirmado_total["whatsapp"] || 0) + (metrics?.agendamento_confirmado_total["email"] || 0),
      icon: Calendar,
      trend: "+15%",
      trendUp: true,
      tooltip: "Reuniões agendadas e confirmadas pelos leads. É a métrica final de sucesso da operação de prospecção. Crescimento indica melhoria na qualificação e abordagem.",
    },
    {
      title: "Falhas em Agendamento",
      value: totalFailures,
      icon: AlertCircle,
      trend: "-8%",
      trendUp: true,
      tooltip: "Tentativas de agendamento que falharam (erros técnicos, conflitos de agenda, etc). Queda neste número é positiva e indica melhor estabilidade do sistema.",
    },
  ];

  const activityData = [
    { date: "Seg", inbound: 120, envios: 450 },
    { date: "Ter", inbound: 145, envios: 520 },
    { date: "Qua", inbound: 168, envios: 480 },
    { date: "Qui", inbound: 192, envios: 510 },
    { date: "Sex", inbound: 178, envios: 490 },
    { date: "Sáb", inbound: 95, envios: 320 },
    { date: "Dom", inbound: 82, envios: 280 },
  ];

  const funnelData = [
    { stage: "TOPO", leads: 1500 },
    { stage: "MEIO", leads: 850 },
    { stage: "FUNDO", leads: 390 },
    { stage: "Confirmados", leads: 287 },
  ];

  const p50 = metrics?.p50 ?? 0;
  const p95 = metrics?.p95 ?? 0;

  // Mock data for ABM and Optimization
  const mockABMData = {
    abmCount: 5,
    normalCount: 45,
    hasAbmLeads: true,
  };

  const mockOptimizationData = {
    isOptimized: true,
    optimization: {
      patterns: {
        best_time: { hour: 14, confidence: 0.85 },
        best_framework: { name: "AIDA", confidence: 0.78 },
        best_channel: { name: "whatsapp", confidence: 0.92 },
      },
      recommendations: [
        {
          priority: 'alta' as const,
          action: "Concentrar envios às 14h",
          expected_lift: "+36% respostas"
        },
        {
          priority: 'media' as const,
          action: "Usar framework AIDA",
          expected_lift: "+28% conversão"
        },
        {
          priority: 'baixa' as const,
          action: "Priorizar WhatsApp sobre email",
          expected_lift: "+15% engajamento"
        },
      ],
    },
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das operações de prospecção em tempo real
        </p>
      </div>

      {/* Alert quando usar dados simulados */}
      {!isUsingRealApi && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Exibindo dados simulados. Configure <code className="bg-muted px-1 py-0.5 rounded">VITE_METRICS_URL</code> para conectar ao servidor de métricas.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert de erro */}
      {isError && isUsingRealApi && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao conectar ao servidor de métricas. Usando dados simulados como fallback.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{kpi.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                {kpi.trendUp ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={kpi.trendUp ? "text-success" : "text-destructive"}>
                  {kpi.trend}
                </span>
                <span className="text-muted-foreground ml-1">vs. semana anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de Leads Irritados */}
      <AlertasLeadsIrritados />

      {/* Panorama de Sentimentos */}
      <SentimentosPainel />

      {/* ABM Indicators */}
      <ABMIndicators 
        abmCount={mockABMData.abmCount}
        normalCount={mockABMData.normalCount}
        hasAbmLeads={mockABMData.hasAbmLeads}
        onReviewStrategy={() => window.location.href = '/estrategia'}
      />

      {/* Feedback Optimization */}
      <FeedbackOptimizationPanel 
        isOptimized={mockOptimizationData.isOptimized}
        optimization={mockOptimizationData.optimization}
      />

      {/* System Health Widget */}
      <SystemHealthWidget metrics={metrics} />

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AgentsStatusWidget />
        <InboundActivityWidget />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CardTitle>Atividade 7 Dias</CardTitle>
                <CardDescription>Inbound vs Envios</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Inbound (azul):</strong> Volume de mensagens recebidas dos leads. Indica nível de engajamento.
                    <br /><br />
                    <strong>Envios (verde):</strong> Mensagens disparadas pela operação. Compare com inbound para avaliar taxa de resposta.
                    <br /><br />
                    💡 <strong>Ideal:</strong> Proporção de 1 resposta a cada 3-5 envios.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="hsl(var(--primary))" strokeWidth={2} name="Inbound" />
                <Line type="monotone" dataKey="envios" stroke="hsl(var(--success))" strokeWidth={2} name="Envios" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>TOPO → Confirmados</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>TOPO:</strong> Total de leads capturados (entrada do funil).
                    <br /><br />
                    <strong>MEIO:</strong> Leads qualificados que demonstraram interesse.
                    <br /><br />
                    <strong>FUNDO:</strong> Leads com intenção concreta de compra.
                    <br /><br />
                    <strong>Confirmados:</strong> Agendamentos realizados com sucesso.
                    <br /><br />
                    💡 <strong>Atenção:</strong> Queda acentuada entre etapas indica gargalo a otimizar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="stage" className="text-xs" />
                <YAxis className="text-xs" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="leads" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance do Sistema</CardTitle>
          <CardDescription>Latência e métricas de qualidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Latência P50</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>Percentil 50 (Mediana):</strong> Metade das requisições são mais rápidas que este valor.
                      <br /><br />
                      💡 <strong>Valor ideal:</strong> Abaixo de 200ms indica sistema responsivo.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold">{p50.toFixed(2)}ms</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Latência P95</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>Percentil 95 (SLA):</strong> 95% das requisições ficam abaixo deste tempo. Usado como garantia de qualidade.
                      <br /><br />
                      💡 <strong>Valor ideal:</strong> Abaixo de 1000ms garante boa experiência mesmo em picos de uso.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold">{p95.toFixed(2)}ms</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>Sucesso das Operações:</strong> Percentual de requisições concluídas sem erros técnicos.
                      <br /><br />
                      💡 <strong>Meta operacional:</strong> Manter acima de 95% para garantir confiabilidade do sistema.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold">97.3%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
