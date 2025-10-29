import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StrategyMetrics } from "@/types/strategy";
import { TrendingUp, Mail, MessageSquareText, Lightbulb, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StrategyMetricsPanelProps {
  metrics: StrategyMetrics;
}

export function StrategyMetricsPanel({ metrics }: StrategyMetricsPanelProps) {
  const getStageBadge = (stage: string) => {
    const colors = {
      TOPO: 'bg-blue-500',
      MEIO: 'bg-yellow-500',
      FUNDO: 'bg-green-500'
    };
    return <Badge className={colors[stage as keyof typeof colors]}>{stage}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Aprendizado Contínuo & Performance
        </CardTitle>
        <CardDescription>
          Métricas e insights para otimização progressiva
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{metrics.templates_sent}</p>
            <p className="text-xs text-muted-foreground">Mensagens Enviadas</p>
          </div>

          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquareText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.total_opened}
            </p>
            <p className="text-xs text-muted-foreground">Aberturas</p>
          </div>

          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquareText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.total_replied}
            </p>
            <p className="text-xs text-muted-foreground">Respostas</p>
          </div>

          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-sm font-semibold mb-1">Melhor Estágio</p>
            {getStageBadge(metrics.best_performing_stage)}
          </div>
        </div>

        {/* Taxas de Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold">Taxas de Conversão</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Taxa de Abertura Média</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {metrics.avg_open_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.avg_open_rate} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Taxa de Resposta Média</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {metrics.avg_reply_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.avg_reply_rate} className="h-2" />
            </div>
          </div>
        </div>

        {/* Aprendizados */}
        {metrics.learnings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Insights e Aprendizados
            </h4>
            <div className="space-y-2">
              {metrics.learnings.map((learning, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg border bg-muted/50 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {idx + 1}
                    </div>
                    <p className="flex-1">{learning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações de Otimização */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
          <h5 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Próximos Passos para Otimização
          </h5>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Replicar as melhores mensagens de {metrics.best_performing_stage} nos outros estágios</li>
            <li>• Criar testes A/B para melhorar a taxa de resposta atual ({metrics.avg_reply_rate.toFixed(1)}%)</li>
            <li>• Analisar padrões de horário com melhor abertura</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
