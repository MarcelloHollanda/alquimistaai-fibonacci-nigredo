import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnaliseObjecoes, getCategoriaObjecaoConfig } from '@/hooks/useAnaliseObjecoes';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export function AnaliseObjecoesPanel() {
  const { estatisticas, loading } = useAnaliseObjecoes();

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!estatisticas) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎯 Análise de Objeções - GAP 3</span>
          <Badge variant="outline">{estatisticas.total} total</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Taxa de Resolução */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de Resolução</span>
            <span className="text-sm font-bold">{estatisticas.taxa_resolucao}%</span>
          </div>
          <Progress value={estatisticas.taxa_resolucao} className="h-2" />
        </div>
        
        {/* Distribuição por Categoria */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Distribuição por Categoria</h4>
          <div className="space-y-2">
            {Object.entries(estatisticas.por_categoria)
              .sort(([, a], [, b]) => b - a)
              .map(([categoria, count]) => {
                const config = getCategoriaObjecaoConfig(categoria);
                const porcentagem = ((count / estatisticas.total) * 100).toFixed(1);
                
                return (
                  <div key={categoria} className="flex items-center gap-3">
                    <Badge className={config.color}>
                      {config.icon} {config.label}
                    </Badge>
                    <div className="flex-1">
                      <Progress value={Number(porcentagem)} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {count} ({porcentagem}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
        
        {/* Objeções Recorrentes */}
        {estatisticas.objecoes_recorrentes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">🔄 Objeções Recorrentes</h4>
            <div className="space-y-3">
              {estatisticas.objecoes_recorrentes.map((objecao, index) => {
                const config = getCategoriaObjecaoConfig(objecao.categoria);
                
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-sm font-bold">{objecao.count}x</span>
                    </div>
                    <div className="text-sm space-y-1">
                      {objecao.exemplos.slice(0, 2).map((exemplo, i) => (
                        <p key={i} className="italic text-muted-foreground">
                          "{exemplo}"
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tendência Mensal */}
        {estatisticas.tendencia_mensal.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">📈 Tendência Mensal</h4>
            <div className="grid grid-cols-3 gap-2">
              {estatisticas.tendencia_mensal.slice(-3).map((mes) => (
                <div key={mes.mes} className="p-2 bg-muted rounded text-center">
                  <p className="text-xs text-muted-foreground">{mes.mes}</p>
                  <p className="text-lg font-bold">{mes.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
