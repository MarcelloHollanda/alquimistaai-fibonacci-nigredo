import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LeadProfile } from "@/types/strategy";
import { Building2, TrendingUp, Users, Calendar } from "lucide-react";

interface LeadProfilePanelProps {
  profiles: LeadProfile[];
}

export function LeadProfilePanel({ profiles }: LeadProfilePanelProps) {
  const getPorteBadgeVariant = (porte?: string) => {
    switch (porte) {
      case 'GRANDE': return 'default';
      case 'MEDIO': return 'secondary';
      default: return 'outline';
    }
  };

  const getValorColor = (valor?: string) => {
    switch (valor) {
      case 'PREMIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'ALTO': return 'text-green-600 dark:text-green-400';
      case 'MEDIO': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const premiumAccounts = profiles.filter(p => p.valor_comercial === 'PREMIUM').length;
  const altoValor = profiles.filter(p => p.valor_comercial === 'ALTO').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Perfilamento Comercial
        </CardTitle>
        <CardDescription>
          Análise de valor e maturidade dos leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Executivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total de Leads</p>
            <p className="text-2xl font-bold">{profiles.length}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Premium</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {premiumAccounts}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Alto Valor</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {altoValor}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Faturamento Médio</p>
            <p className="text-2xl font-bold">
              {profiles
                .filter(p => p.faturamento_estimado)
                .reduce((acc, p) => acc + (p.faturamento_estimado || 0), 0) / 
                profiles.filter(p => p.faturamento_estimado).length || 0
              }M
            </p>
          </div>
        </div>

        {/* Top Leads Premium */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leads Premium & Alto Valor (ABM)
          </h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {profiles
              .filter(p => p.valor_comercial === 'PREMIUM' || p.valor_comercial === 'ALTO')
              .slice(0, 10)
              .map(profile => (
                <div 
                  key={profile.lead_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{profile.razao_social}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {profile.porte && (
                        <Badge variant={getPorteBadgeVariant(profile.porte)} className="text-xs">
                          {profile.porte}
                        </Badge>
                      )}
                      <span className={`text-xs font-semibold ${getValorColor(profile.valor_comercial)}`}>
                        {profile.valor_comercial}
                      </span>
                      {profile.faturamento_estimado && (
                        <span className="text-xs text-muted-foreground">
                          R$ {profile.faturamento_estimado}M/ano
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {profile.socios && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{profile.socios.length}</span>
                      </div>
                    )}
                    {profile.maturidade_mercado && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{profile.maturidade_mercado}a</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Distribuição de Valor */}
        <div>
          <h4 className="font-semibold mb-3">Distribuição de Valor Comercial</h4>
          <div className="space-y-3">
            {['PREMIUM', 'ALTO', 'MEDIO', 'BAIXO'].map(valor => {
              const count = profiles.filter(p => p.valor_comercial === valor).length;
              const percentage = (count / profiles.length) * 100;
              return (
                <div key={valor} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={getValorColor(valor)}>{valor}</span>
                    <span className="text-muted-foreground">{count} leads ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
