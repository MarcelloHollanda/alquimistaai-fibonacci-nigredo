import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchMetrics } from "@/lib/metrics-api";
import { shouldUseRealApi } from "@/lib/config";
import { PacingUsageChart } from "@/components/relatorios/PacingUsageChart";
import { ABMPerformanceReport } from "@/components/relatorios/ABMPerformanceReport";
import { AnaliseObjecoesPanel } from "@/components/relatorios/AnaliseObjecoesPanel";
import { RelatorioMensalPanel } from "@/components/relatorios/RelatorioMensalPanel";

export default function Relatorios() {
  const { data: metrics, isError } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 15000,
    retry: 2,
  });

  const isUsingRealApi = shouldUseRealApi();

  const funnelData = [
    { stage: "TOPO", leads: 1500, conversao: 100 },
    { stage: "MEIO", leads: 850, conversao: 56.7 },
    { stage: "FUNDO", leads: 390, conversao: 26 },
    { stage: "Confirmados", leads: 287, conversao: 19.1 },
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    dia: `Dia ${i + 1}`,
    leads: Math.floor(Math.random() * 100) + 50,
    envios: Math.floor(Math.random() * 200) + 100,
    confirmados: Math.floor(Math.random() * 30) + 10,
  }));

  const canalData = [
    { canal: "WhatsApp", enviados: metrics?.disparo_total["whatsapp|ok"] || 0 },
    { canal: "Email", enviados: metrics?.disparo_total["email|ok"] || 0 },
  ];

  // Processar dados de falhas reais das métricas
  const failuresByPhase = Object.entries(metrics?.agendamento_falha_total || {}).reduce((acc, [key, value]) => {
    const [fase, erro] = key.split("|");
    const existing = acc.find(item => item.fase === fase);
    if (existing) {
      existing.falhas += value;
    } else {
      acc.push({ fase, falhas: value, sucesso: 0 });
    }
    return acc;
  }, [] as Array<{ fase: string; falhas: number; sucesso: number }>);

  // Adicionar sucessos baseado nas propostas e confirmações
  const proposalTotal = Object.values(metrics?.agendamento_proposta_total || {}).reduce((a, b) => a + b, 0);
  const confirmedTotal = Object.values(metrics?.agendamento_confirmado_total || {}).reduce((a, b) => a + b, 0);
  
  failuresByPhase.forEach(item => {
    if (item.fase === "proposta") item.sucesso = proposalTotal - item.falhas;
    if (item.fase === "confirmacao") item.sucesso = confirmedTotal - item.falhas;
  });

  const qualidadeData = failuresByPhase.length > 0 ? failuresByPhase : [
    { fase: "Proposta", falhas: 12, sucesso: 143 },
    { fase: "Confirmação", falhas: 8, sucesso: 127 },
    { fase: "Envio Convite", falhas: 3, sucesso: 119 },
  ];

  // Top erros
  const topErrors = Object.entries(metrics?.agendamento_falha_total || {})
    .map(([key, value]) => {
      const [fase, erro] = key.split("|");
      return { fase, erro, total: value };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const totalErrors = topErrors.reduce((sum, e) => sum + e.total, 0);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  const p50 = metrics?.p50 ?? 0;
  const p95 = metrics?.p95 ?? 0;

  // Mock ABM metrics
  const mockABMMetrics = {
    abm: {
      response_rate: 42,
      total_pipeline_value: 15000000,
      avg_roi: 450,
      cost_per_lead: 450,
      avg_deal_value: 2500000,
    },
    normal: {
      response_rate: 18,
      cost_per_lead: 45,
      avg_deal_value: 85000,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📊 Relatórios (T7)</h1>
        <p className="text-muted-foreground">Análises executiva, operacional, objeções e qualidade</p>
      </div>

      {!isUsingRealApi && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Exibindo dados simulados. Configure <code className="bg-muted px-1 py-0.5 rounded">VITE_METRICS_URL</code> para conectar ao servidor de métricas.
          </AlertDescription>
        </Alert>
      )}

      {isError && isUsingRealApi && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao conectar ao servidor de métricas. Usando dados simulados como fallback.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objecoes">Objeções</TabsTrigger>
          <TabsTrigger value="executivo">Executivo</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
          <TabsTrigger value="abm">ABM</TabsTrigger>
          <TabsTrigger value="pacing">Pacing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RelatorioMensalPanel />
        </TabsContent>

        <TabsContent value="objecoes" className="space-y-6">
          <AnaliseObjecoesPanel />
        </TabsContent>

        <TabsContent value="executivo" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Taxa de conversão por estágio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="stage" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
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

            <Card>
              <CardHeader>
                <CardTitle>Tendência 30 Dias</CardTitle>
                <CardDescription>Evolução de leads e confirmações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dia" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" />
                    <Line type="monotone" dataKey="confirmados" stroke="hsl(var(--success))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Entregas por Canal</CardTitle>
                <CardDescription>Volume de envios bem-sucedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={canalData}
                      dataKey="enviados"
                      nameKey="canal"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {canalData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance do Sistema</CardTitle>
                <CardDescription>Latência e disponibilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Latência P50</div>
                    <div className="text-3xl font-bold">{p50.toFixed(2)}ms</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Latência P95</div>
                    <div className="text-3xl font-bold">{p95.toFixed(2)}ms</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Inbound Total</div>
                    <div className="text-3xl font-bold">
                      {((metrics?.inbound_total.whatsapp || 0) + (metrics?.inbound_total.email || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qualidade" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Falhas por Fase</CardTitle>
                <CardDescription>Distribuição de falhas no processo de agendamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualidadeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="fase" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sucesso" fill="hsl(var(--success))" />
                    <Bar dataKey="falhas" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Erros</CardTitle>
                <CardDescription>Erros mais frequentes no agendamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Erro</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topErrors.length > 0 ? (
                      topErrors.map((error, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{error.erro}</TableCell>
                          <TableCell className="text-sm capitalize">{error.fase}</TableCell>
                          <TableCell className="text-right font-medium">{error.total}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {((error.total / totalErrors) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum erro registrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abm" className="space-y-6">
          <ABMPerformanceReport metrics={mockABMMetrics} />
        </TabsContent>

        <TabsContent value="pacing" className="space-y-6">
          <PacingUsageChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
