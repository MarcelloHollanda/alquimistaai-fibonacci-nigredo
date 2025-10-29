import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCostMonitoring, IntegrationCost } from "@/hooks/useCostMonitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getStatusColor = (status: IntegrationCost["status"]) => {
  switch (status) {
    case "critical":
      return "destructive";
    case "warning":
      return "default";
    default:
      return "secondary";
  }
};

const getStatusText = (status: IntegrationCost["status"]) => {
  switch (status) {
    case "critical":
      return "Crítico";
    case "warning":
      return "Atenção";
    default:
      return "Normal";
  }
};

export function CostControlPanel() {
  const { data: costData, isLoading, error } = useCostMonitoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de custos. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  const criticalIntegrations = costData?.integrations.filter(
    (i) => i.status === "critical"
  ).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Controle de Custos
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real do consumo por integração
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Consumido</div>
              <div className="text-2xl font-bold">
                {costData?.currency} {costData?.total.toFixed(2)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {criticalIntegrations > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {criticalIntegrations} integração(ões) próxima(s) do limite
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {costData?.integrations.map((integration) => {
              const percentage = (integration.consumed / integration.limit) * 100;
              const remaining = integration.limit - integration.consumed;

              return (
                <Card key={integration.integration} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">{integration.integration}</h4>
                            <p className="text-sm text-muted-foreground">
                              Última atualização: {new Date(integration.lastUpdate).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(integration.status)}>
                          {getStatusText(integration.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Consumido</span>
                          <span className="font-medium">
                            {integration.currency} {integration.consumed.toFixed(2)} / {integration.limit.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% utilizado</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {integration.currency} {remaining.toFixed(2)} restante
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
