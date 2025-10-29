import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExperimentos, getSignificanciaLabel } from '@/hooks/useExperimentos';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FlaskConical, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Experimentos() {
  const { experimentos, loading } = useExperimentos();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const experimentosAtivos = experimentos.filter(e => e.status === 'ativo');
  const experimentosConcluidos = experimentos.filter(e => e.status === 'concluido');
  const vencedoresAplicados = experimentosConcluidos.filter(e => e.aplicado_automaticamente);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8" />
            Testes A/B (GAP 5)
          </h1>
          <p className="text-muted-foreground">
            Experimentos ativos e vencedores aplicados automaticamente
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Experimentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{experimentosAtivos.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{experimentosConcluidos.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Vencedores Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {vencedoresAplicados.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ativos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ativos">
            Ativos ({experimentosAtivos.length})
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            Concluídos ({experimentosConcluidos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-4">
          {experimentosAtivos.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum experimento ativo</p>
              </CardContent>
            </Card>
          ) : (
            experimentosAtivos.map((exp) => (
              <Card key={exp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{exp.nome}</CardTitle>
                      <CardDescription>
                        Tipo: {exp.tipo} | Iniciado em {new Date(exp.criado_em).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      Em Andamento
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {exp.variantes.map((variante) => (
                      <div key={variante.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{variante.nome}</h4>
                          <Badge variant="outline">
                            {variante.taxa_conversao}% conversão
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Enviados</p>
                            <p className="font-medium">{variante.enviados}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Abertos</p>
                            <p className="font-medium">{variante.abertos}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Respondidos</p>
                            <p className="font-medium">{variante.respondidos}</p>
                          </div>
                        </div>

                        <Progress 
                          value={variante.taxa_conversao} 
                          className="mt-3 h-2" 
                        />
                      </div>
                    ))}
                  </div>

                  {exp.significancia_estatistica && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Significância Estatística (p-value):
                        </span>
                        <Badge className={getSignificanciaLabel(exp.significancia_estatistica).color}>
                          {getSignificanciaLabel(exp.significancia_estatistica).label}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {exp.vencedor && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-900">
                        🏆 Vencedor identificado: {exp.variantes.find(v => v.id === exp.vencedor)?.nome}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4">
          {experimentosConcluidos.map((exp) => {
            const vencedor = exp.variantes.find(v => v.id === exp.vencedor);
            const controle = exp.variantes[0];
            const melhoria = vencedor && controle 
              ? ((vencedor.taxa_conversao - controle.taxa_conversao) / controle.taxa_conversao * 100).toFixed(1)
              : 0;

            const chartData = exp.variantes.map(v => ({
              name: v.nome,
              conversao: v.taxa_conversao
            }));

            return (
              <Card key={exp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {exp.nome}
                        {exp.aplicado_automaticamente && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Concluído | Tipo: {exp.tipo}
                      </CardDescription>
                    </div>
                    {exp.aplicado_automaticamente && (
                      <Badge className="bg-green-100 text-green-800">
                        Aplicado Automaticamente
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="conversao" 
                          fill="hsl(var(--primary))"
                          name="Taxa de Conversão (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {vencedor && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">Vencedor</h4>
                        </div>
                        <p className="text-sm text-green-800 mb-1">{vencedor.nome}</p>
                        <p className="text-2xl font-bold text-green-900">
                          {vencedor.taxa_conversao}%
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          +{melhoria}% vs controle
                        </p>
                      </div>

                      {exp.significancia_estatistica && (
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2">Confiabilidade</h4>
                          <Badge className={getSignificanciaLabel(exp.significancia_estatistica).color}>
                            {getSignificanciaLabel(exp.significancia_estatistica).label}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            p-value: {exp.significancia_estatistica}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
