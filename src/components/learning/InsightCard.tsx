import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Insight } from '@/types/learning';
import { Lightbulb, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
  onAplicar?: (id: string) => void;
  onValidar?: (id: string) => void;
}

export function InsightCard({ insight, onAplicar, onValidar }: InsightCardProps) {
  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'performance': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'qualidade': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'eficiencia': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'otimizacao': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'erro': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'identificado': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'aplicado': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'validado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'descartado': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">{insight.titulo}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(insight.status)}
            <Badge variant="outline" className={getCategoriaColor(insight.categoria)}>
              {insight.categoria}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.descricao}</p>

        {/* Métricas Antes/Depois */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Antes</p>
            {Object.entries(insight.metricas_antes).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace('_', ' ')}:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {insight.metricas_depois && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Depois</p>
              {Object.entries(insight.metricas_depois).map(([key, value]) => {
                const antes = insight.metricas_antes[key];
                const melhoria = antes ? ((value - antes) / antes * 100).toFixed(1) : '0';
                const positive = Number(melhoria) > 0;
                
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{value}</span>
                      <span className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
                        ({positive ? '+' : ''}{melhoria}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Impacto Estimado */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Impacto Estimado:</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                style={{ width: `${insight.impacto_estimado}%` }}
              />
            </div>
            <span className="text-sm font-bold">{insight.impacto_estimado}%</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {insight.status === 'identificado' && onAplicar && (
            <Button 
              size="sm" 
              onClick={() => onAplicar(insight.id)}
              className="flex-1"
            >
              Aplicar Insight
            </Button>
          )}
          {insight.status === 'aplicado' && onValidar && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onValidar(insight.id)}
              className="flex-1"
            >
              Validar Resultado
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Agente: <span className="font-semibold">{insight.agente}</span> • 
          Criado: {new Date(insight.created_at).toLocaleDateString('pt-BR')}
          {insight.validated_at && ` • Validado: ${new Date(insight.validated_at).toLocaleDateString('pt-BR')}`}
        </div>
      </CardContent>
    </Card>
  );
}
