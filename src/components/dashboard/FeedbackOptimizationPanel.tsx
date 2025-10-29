import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Recommendation {
  priority: 'alta' | 'media' | 'baixa';
  action: string;
  expected_lift: string;
}

interface FeedbackOptimization {
  patterns: {
    best_time?: { hour: number; confidence: number };
    best_framework?: { name: string; confidence: number };
    best_channel?: { name: string; confidence: number };
  };
  recommendations: Recommendation[];
}

interface FeedbackOptimizationPanelProps {
  isOptimized: boolean;
  optimization?: FeedbackOptimization;
}

export function FeedbackOptimizationPanel({ isOptimized, optimization }: FeedbackOptimizationPanelProps) {
  if (!isOptimized || !optimization) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'text-destructive';
      case 'media':
        return 'text-warning';
      case 'baixa':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta':
        return '🔴';
      case 'media':
        return '🟡';
      case 'baixa':
        return '🟢';
      default:
        return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.toUpperCase();
  };

  return (
    <Card className="border-l-4 border-l-success">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              <CardTitle>Otimizações Aplicadas</CardTitle>
              <Badge variant="default" className="gap-1 bg-success hover:bg-success">
                <TrendingUp className="h-3 w-3" />
                Campanha Otimizada
              </Badge>
            </div>
            <CardDescription>
              Insights baseados em feedback loop de campanhas anteriores
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Patterns Detectados */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Padrões de Sucesso Identificados
          </h4>
          <div className="grid gap-2">
            {optimization.patterns.best_time && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium">Melhor Horário de Envio</p>
                  <p className="text-xs text-muted-foreground">
                    {optimization.patterns.best_time.hour}h - Confiança: {(optimization.patterns.best_time.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <Badge variant="outline">Timing</Badge>
              </div>
            )}
            {optimization.patterns.best_framework && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium">Framework de Conteúdo</p>
                  <p className="text-xs text-muted-foreground">
                    {optimization.patterns.best_framework.name} - Confiança: {(optimization.patterns.best_framework.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <Badge variant="outline">Conteúdo</Badge>
              </div>
            )}
            {optimization.patterns.best_channel && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium">Canal Preferencial</p>
                  <p className="text-xs text-muted-foreground">
                    {optimization.patterns.best_channel.name.toUpperCase()} - Confiança: {(optimization.patterns.best_channel.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <Badge variant="outline">Canal</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Recomendações */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Recomendações de Otimização
          </h4>
          <div className="space-y-2">
            {optimization.recommendations.map((rec, idx) => (
              <Alert key={idx} className="border-l-4" style={{ borderLeftColor: 
                rec.priority === 'alta' ? 'hsl(var(--destructive))' : 
                rec.priority === 'media' ? 'hsl(var(--warning))' : 
                'hsl(var(--success))' 
              }}>
                <AlertDescription className="flex items-start gap-2">
                  <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                        {getPriorityLabel(rec.priority)}
                      </span>
                      <Badge variant="outline" className="text-xs">{rec.expected_lift}</Badge>
                    </div>
                    <p className="text-sm">{rec.action}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
