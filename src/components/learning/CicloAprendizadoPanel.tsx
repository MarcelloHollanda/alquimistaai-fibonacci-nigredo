import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CicloAprendizado } from '@/types/learning';
import { TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';

interface CicloAprendizadoPanelProps {
  ciclo: CicloAprendizado;
}

export function CicloAprendizadoPanel({ ciclo }: CicloAprendizadoPanelProps) {
  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrescente': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente': return 'text-green-600';
      case 'decrescente': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const taxaAplicacao = ciclo.insights_gerados > 0 
    ? (ciclo.insights_aplicados / ciclo.insights_gerados * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Ciclo de Aprendizado - {ciclo.agente}
            </CardTitle>
            <CardDescription>
              Evolução contínua • Período: {ciclo.periodo}
            </CardDescription>
          </div>
          <Badge variant="outline" className={getTendenciaColor(ciclo.metricas_evolucao.tendencia)}>
            {getTendenciaIcon(ciclo.metricas_evolucao.tendencia)}
            <span className="ml-1 capitalize">{ciclo.metricas_evolucao.tendencia}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Insights Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Insights Gerados</p>
            <p className="text-2xl font-bold">{ciclo.insights_gerados}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Aplicados</p>
            <p className="text-2xl font-bold text-blue-600">{ciclo.insights_aplicados}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Melhoria</p>
            <p className="text-2xl font-bold text-green-600">
              +{ciclo.melhoria_percentual.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Taxa de Aplicação */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Taxa de Aplicação</span>
            <span className="text-muted-foreground">{taxaAplicacao.toFixed(0)}%</span>
          </div>
          <Progress value={taxaAplicacao} className="h-2" />
        </div>

        {/* Evolução de Métricas */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Evolução de Métricas
          </h4>
          <div className="space-y-2">
            {Object.entries(ciclo.metricas_evolucao.mes_atual).map(([key, valueAtual]) => {
              const valueAnterior = ciclo.metricas_evolucao.mes_anterior[key] || 0;
              const diff = valueAtual - valueAnterior;
              const percentual = valueAnterior > 0 ? (diff / valueAnterior * 100) : 0;
              const positive = diff > 0;

              return (
                <div key={key} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {valueAnterior} →
                      </span>
                      <span className="text-sm font-bold">{valueAtual}</span>
                      <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                        ({positive ? '+' : ''}{percentual.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={valueAtual} 
                    className="h-1.5"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas Ações */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Próximas Ações Recomendadas</h4>
          <ul className="space-y-2">
            {ciclo.proximas_acoes.map((acao, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{acao}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
