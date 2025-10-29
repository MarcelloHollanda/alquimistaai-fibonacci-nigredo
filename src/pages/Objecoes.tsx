import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useObjecoesAnalise } from '@/hooks/useRelatorios';
import { getCategoriaObjecaoConfig } from '@/hooks/useAnaliseObjecoes';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Objecoes() {
  const { analise, loading } = useObjecoesAnalise('30dias');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎯 Análise de Objeções (GAP 3)</h1>
        <p className="text-muted-foreground">
          Categorização e análise de objeções recorrentes - últimos {analise.periodo}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Objeções</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analise.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analise.taxa_resolucao}%</p>
            <Progress value={analise.taxa_resolucao} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Categorias Diferentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {Object.keys(analise.por_categoria).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ranking">Top 3 Objeções</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          {analise.ranking_top3.map((item, index) => {
            const config = getCategoriaObjecaoConfig(item.categoria);
            const total = analise.por_categoria[item.categoria] || 0;
            const porcentagem = ((total / analise.total) * 100).toFixed(1);

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <Badge className={config.color}>
                        {config.icon} {config.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{total}</p>
                      <p className="text-sm text-muted-foreground">{porcentagem}%</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Exemplos:</h4>
                    <div className="space-y-2">
                      {item.exemplos.map((exemplo, i) => (
                        <div key={i} className="p-2 bg-muted rounded">
                          <p className="text-sm italic">"{exemplo}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      💡 Recomendação:
                    </p>
                    <p className="text-sm text-blue-800">{item.recomendacao}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="distribuicao">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analise.por_categoria)
                .sort(([, a], [, b]) => b - a)
                .map(([categoria, count]) => {
                  const config = getCategoriaObjecaoConfig(categoria);
                  const porcentagem = ((count / analise.total) * 100).toFixed(1);

                  return (
                    <div key={categoria} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={config.color}>
                          {config.icon} {config.label}
                        </Badge>
                        <span className="text-sm font-medium">
                          {count} ({porcentagem}%)
                        </span>
                      </div>
                      <Progress value={Number(porcentagem)} className="h-2" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
