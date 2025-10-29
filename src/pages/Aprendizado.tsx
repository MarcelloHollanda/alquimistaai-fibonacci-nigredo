import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLearningSystem, useCicloAprendizado, useAgentesMetrics } from '@/hooks/useLearningSystem';
import { InsightCard } from '@/components/learning/InsightCard';
import { CicloAprendizadoPanel } from '@/components/learning/CicloAprendizadoPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, Zap, Target } from 'lucide-react';
import { AgenteType } from '@/types/learning';
import { Skeleton } from '@/components/ui/skeleton';

export default function Aprendizado() {
  const [agenteFilter, setAgenteFilter] = useState<AgenteType>('T1');
  const { insights, loading: insightsLoading, aplicarInsight, validarInsight } = useLearningSystem();
  const { ciclo, loading: cicloLoading } = useCicloAprendizado(agenteFilter);
  const { metricas, loading: metricasLoading } = useAgentesMetrics();

  const insightsFiltrados = insights.filter(i => i.agente === agenteFilter);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Sistema de Aprendizado Contínuo
        </h1>
        <p className="text-muted-foreground mt-2">
          Ciclo de melhoria autônoma por agente • Insights registrados e aplicados automaticamente
        </p>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="ciclos">Ciclos de Aprendizado</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricas.reduce((acc, m) => acc + m.total_insights, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gerados em todos os agentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Insights Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {metricas.reduce((acc, m) => acc + m.insights_ativos, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aplicados e em validação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Aplicação Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(metricas.reduce((acc, m) => acc + m.taxa_aplicacao, 0) / metricas.length).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aproveitamento de insights
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Impacto Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(metricas.reduce((acc, m) => acc + m.impacto_medio, 0) / metricas.length).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Melhoria identificada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance por Agente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Performance de Aprendizado por Agente
              </CardTitle>
              <CardDescription>
                Insights gerados, aplicados e impacto médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricasLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {metricas.map(m => (
                    <div key={m.agente} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{m.agente}</Badge>
                            <span className="font-semibold">{m.nome}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Última melhoria: {m.ultima_melhoria}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {m.impacto_medio.toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Impacto</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Insights</p>
                          <p className="font-semibold">{m.total_insights}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Ativos</p>
                          <p className="font-semibold text-blue-600">{m.insights_ativos}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa Aplicação</p>
                          <p className="font-semibold">{m.taxa_aplicacao.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Insights Identificados</h2>
              <p className="text-sm text-muted-foreground">
                Oportunidades de melhoria detectadas pelo sistema
              </p>
            </div>
            <Select value={agenteFilter} onValueChange={(v) => setAgenteFilter(v as AgenteType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">T1 - Higienização</SelectItem>
                <SelectItem value="T2">T2 - Estratégia</SelectItem>
                <SelectItem value="T3">T3 - Disparo</SelectItem>
                <SelectItem value="T4">T4 - Atendimento</SelectItem>
                <SelectItem value="T5">T5 - Qualificação</SelectItem>
                <SelectItem value="T6">T6 - Agendamento</SelectItem>
                <SelectItem value="T7">T7 - Relatórios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {insightsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : insightsFiltrados.length === 0 ? (
            <Card className="p-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum insight identificado ainda</p>
              <p className="text-sm text-muted-foreground mt-2">
                O sistema está coletando dados para gerar insights
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {insightsFiltrados.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAplicar={aplicarInsight}
                  onValidar={(id) => validarInsight(id, {})}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ciclos de Aprendizado */}
        <TabsContent value="ciclos" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ciclo de Aprendizado Atual</h2>
              <p className="text-sm text-muted-foreground">
                Evolução mensal e próximas ações
              </p>
            </div>
            <Select value={agenteFilter} onValueChange={(v) => setAgenteFilter(v as AgenteType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">T1 - Higienização</SelectItem>
                <SelectItem value="T2">T2 - Estratégia</SelectItem>
                <SelectItem value="T3">T3 - Disparo</SelectItem>
                <SelectItem value="T4">T4 - Atendimento</SelectItem>
                <SelectItem value="T5">T5 - Qualificação</SelectItem>
                <SelectItem value="T6">T6 - Agendamento</SelectItem>
                <SelectItem value="T7">T7 - Relatórios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cicloLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : ciclo ? (
            <CicloAprendizadoPanel ciclo={ciclo} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-lg font-medium">Ciclo não disponível</p>
            </Card>
          )}
        </TabsContent>

        {/* Evolução */}
        <TabsContent value="evolucao" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Evolução de Performance - Últimos 30 Dias
                  </CardTitle>
                  <CardDescription>
                    Tendência de melhoria contínua
                  </CardDescription>
                </div>
                <Select value={agenteFilter} onValueChange={(v) => setAgenteFilter(v as AgenteType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">T1 - Higienização</SelectItem>
                    <SelectItem value="T2">T2 - Estratégia</SelectItem>
                    <SelectItem value="T3">T3 - Disparo</SelectItem>
                    <SelectItem value="T4">T4 - Atendimento</SelectItem>
                    <SelectItem value="T5">T5 - Qualificação</SelectItem>
                    <SelectItem value="T6">T6 - Agendamento</SelectItem>
                    <SelectItem value="T7">T7 - Relatórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {metricasLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricas.find(m => m.agente === agenteFilter)?.evolucao_ultimos_30d || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="data" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                      formatter={(value: number) => [value.toFixed(1), 'Performance']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="metrica_principal" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
