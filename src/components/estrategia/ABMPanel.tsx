import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ABMAccount } from "@/types/strategy";
import { Target, Sparkles, User, CheckCircle, Clock } from "lucide-react";

interface ABMPanelProps {
  accounts: ABMAccount[];
  onCreateStrategy?: (accountId: string) => void;
}

export function ABMPanel({ accounts, onCreateStrategy }: ABMPanelProps) {
  const getStatusBadge = (status: ABMAccount['status']) => {
    const badges = {
      identified: { variant: 'outline' as const, label: 'Identificado', icon: Target },
      strategy_created: { variant: 'secondary' as const, label: 'Estratégia Criada', icon: Sparkles },
      approved: { variant: 'default' as const, label: 'Aprovado', icon: CheckCircle },
      in_progress: { variant: 'default' as const, label: 'Em Andamento', icon: Clock },
    };
    const config = badges[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const topAccounts = accounts
    .sort((a, b) => b.score_abm - a.score_abm)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          ABM - Account Based Marketing
        </CardTitle>
        <CardDescription>
          Campanhas exclusivas para grandes contas de alto valor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-primary">{accounts.length}</p>
            <p className="text-sm text-muted-foreground">Contas ABM</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {accounts.filter(a => a.status === 'identified').length}
            </p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {accounts.filter(a => a.status === 'approved' || a.status === 'in_progress').length}
            </p>
            <p className="text-sm text-muted-foreground">Ativas</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold">
              R$ {accounts.reduce((acc, a) => acc + a.faturamento_estimado, 0)}M
            </p>
            <p className="text-sm text-muted-foreground">Fat. Total</p>
          </div>
        </div>

        {/* Top Contas */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Top 10 Contas por Score ABM
          </h4>
          <div className="space-y-3">
            {topAccounts.map(account => (
              <div 
                key={account.lead_id}
                className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold">{account.razao_social}</h5>
                    <p className="text-sm text-muted-foreground">
                      Faturamento: R$ {account.faturamento_estimado}M/ano
                    </p>
                    {account.assigned_to && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        Responsável: {account.assigned_to}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(account.status)}
                </div>

                {/* Score ABM */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score ABM</span>
                    <span className="font-semibold text-primary">{account.score_abm}/100</span>
                  </div>
                  <Progress value={account.score_abm} className="h-2" />
                </div>

                {/* Estratégia Customizada */}
                {account.custom_strategy && (
                  <div className="text-sm p-3 rounded-lg bg-muted/50 border">
                    <p className="text-muted-foreground mb-1 font-medium">Estratégia Exclusiva:</p>
                    <p className="text-sm">{account.custom_strategy}</p>
                  </div>
                )}

                {/* Ações */}
                {account.status === 'identified' && onCreateStrategy && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => onCreateStrategy(account.lead_id)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar Estratégia Personalizada
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
