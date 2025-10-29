import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CampaignPlanning } from "@/types/strategy";
import { Radio, Mail, MessageSquare, Clock, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CampaignPlannerProps {
  planning: CampaignPlanning;
}

export function CampaignPlanner({ planning }: CampaignPlannerProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 dark:text-green-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) return <Badge className="bg-green-500">Baixo Risco</Badge>;
    if (score < 60) return <Badge className="bg-yellow-500">Médio Risco</Badge>;
    return <Badge variant="destructive">Alto Risco</Badge>;
  };

  const totalLeads = planning.channel_strategy.whatsapp_leads + planning.channel_strategy.email_leads;
  const whatsappPercent = (planning.channel_strategy.whatsapp_leads / totalLeads) * 100;
  const emailPercent = (planning.channel_strategy.email_leads / totalLeads) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Planejamento de Campanha
        </CardTitle>
        <CardDescription>
          Canais, ritmo e análise de risco de reputação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estratégia de Canais */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Distribuição de Canais
          </h4>
          
          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">WhatsApp</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {planning.channel_strategy.whatsapp_leads} leads ({whatsappPercent.toFixed(1)}%)
                </span>
              </div>
              <Progress value={whatsappPercent} className="h-2" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Email</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {planning.channel_strategy.email_leads} leads ({emailPercent.toFixed(1)}%)
                </span>
              </div>
              <Progress value={emailPercent} className="h-2" />
            </div>

            {/* Reasoning */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Justificativa:</strong> {planning.channel_strategy.reasoning}
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Planejamento de Ritmo */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ritmo e Humanização
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Limite Diário</p>
              <p className="text-2xl font-bold text-primary">
                {planning.pacing_plan.daily_limit}
              </p>
              <p className="text-xs text-muted-foreground">mensagens/dia</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Intervalo Natural</p>
              <p className="text-2xl font-bold text-primary">
                {planning.pacing_plan.natural_delays.min_seconds}-{planning.pacing_plan.natural_delays.max_seconds}s
              </p>
              <p className="text-xs text-muted-foreground">entre disparos</p>
            </div>
          </div>

          {/* Distribuição Horária */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-2">Distribuição Horária (% por hora)</p>
            <div className="grid grid-cols-12 gap-1">
              {planning.pacing_plan.hourly_distribution.map((percent, hour) => (
                <div 
                  key={hour}
                  className="text-center"
                  title={`${hour}h: ${percent}%`}
                >
                  <div 
                    className="bg-primary rounded"
                    style={{ 
                      height: `${Math.max(percent * 2, 4)}px`,
                      opacity: percent > 0 ? 1 : 0.2
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {hour}h
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Análise de Risco */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Análise de Risco de Reputação
          </h4>

          <div className="space-y-4">
            {/* Score Geral */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Score de Risco Geral</span>
                {getRiskBadge(planning.risk_analysis.overall_score)}
              </div>
              <div className="flex items-center gap-3">
                <Progress value={planning.risk_analysis.overall_score} className="flex-1 h-3" />
                <span className={`text-xl font-bold ${getRiskColor(planning.risk_analysis.overall_score)}`}>
                  {planning.risk_analysis.overall_score}/100
                </span>
              </div>
            </div>

            {/* Warnings */}
            {planning.risk_analysis.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Avisos de Risco:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {planning.risk_analysis.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            {planning.risk_analysis.recommendations.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Recomendações:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {planning.risk_analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
