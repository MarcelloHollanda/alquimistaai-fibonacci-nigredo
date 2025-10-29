import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { TermTooltip } from "@/components/ui/term-tooltip";

interface LeadQualification {
  score: number; // 0-100
  status: 'quente' | 'morno' | 'frio';
  risco_crediticio: 'baixo' | 'medio' | 'alto';
  perfil_cliente_ideal: boolean;
  fatores_positivos: string[];
  fatores_negativos: string[];
  valor_potencial_estimado: number;
  probabilidade_conversao: number; // 0-100
}

interface LeadQualificationCardProps {
  qualification: LeadQualification;
}

export function LeadQualificationCard({ qualification }: LeadQualificationCardProps) {
  const getStatusColor = () => {
    switch (qualification.status) {
      case 'quente': return 'bg-red-500';
      case 'morno': return 'bg-yellow-500';
      case 'frio': return 'bg-blue-500';
    }
  };

  const getRiscoColor = () => {
    switch (qualification.risco_crediticio) {
      case 'baixo': return 'text-green-600 dark:text-green-400';
      case 'medio': return 'text-yellow-600 dark:text-yellow-400';
      case 'alto': return 'text-red-600 dark:text-red-400';
    }
  };

  const getRiscoIcon = () => {
    switch (qualification.risco_crediticio) {
      case 'baixo': return <CheckCircle className="h-4 w-4" />;
      case 'medio': return <AlertTriangle className="h-4 w-4" />;
      case 'alto': return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Qualificação do Lead</span>
          {qualification.perfil_cliente_ideal && (
            <Badge className="bg-green-500">
              <TermTooltip term="ICP" showIcon={false}>
                ⭐ ICP Match
              </TermTooltip>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Geral */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              <TermTooltip term="Score" showIcon={false}>
                Score de Qualificação
              </TermTooltip>
            </p>
            <span className="text-2xl font-bold">{qualification.score}</span>
          </div>
          <Progress value={qualification.score} className="h-3" />
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium capitalize">{qualification.status}</span>
          </div>
        </div>

        {/* Risco Creditício */}
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Risco Creditício</p>
            <div className={`flex items-center gap-1 ${getRiscoColor()}`}>
              {getRiscoIcon()}
              <span className="font-semibold capitalize">{qualification.risco_crediticio}</span>
            </div>
          </div>
          {qualification.risco_crediticio === 'alto' && (
            <p className="text-xs text-muted-foreground">
              ⚠️ Histórico de inadimplência ou dados financeiros sensíveis
            </p>
          )}
        </div>

        {/* Valor Potencial */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor Potencial</p>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0
                }).format(qualification.valor_potencial_estimado)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Prob. Conversão</p>
            <div className="flex items-center gap-1">
              {qualification.probabilidade_conversao >= 70 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-lg font-bold">{qualification.probabilidade_conversao}%</span>
            </div>
          </div>
        </div>

        {/* Fatores Positivos */}
        {qualification.fatores_positivos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✅ Fatores Positivos
            </p>
            <ul className="space-y-1">
              {qualification.fatores_positivos.map((fator, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                  {fator}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fatores Negativos */}
        {qualification.fatores_negativos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              ❌ Fatores de Atenção
            </p>
            <ul className="space-y-1">
              {qualification.fatores_negativos.map((fator, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <XCircle className="h-3 w-3 mt-0.5 text-red-600 flex-shrink-0" />
                  {fator}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendação de Ação */}
        <div className={`p-3 rounded-lg border ${
          qualification.score >= 70
            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
            : qualification.score >= 40
            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
          <p className="text-xs font-medium">
            {qualification.score >= 70
              ? '🎯 Lead qualificado! Priorizar agendamento imediato.'
              : qualification.score >= 40
              ? '🔄 Lead em avaliação. Nutrir com mais informações.'
              : '❄️ Lead frio. Considerar campanha de nutrição de longo prazo.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
