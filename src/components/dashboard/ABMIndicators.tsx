import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ABMIndicatorsProps {
  abmCount: number;
  normalCount: number;
  hasAbmLeads: boolean;
  onReviewStrategy?: () => void;
}

export function ABMIndicators({ abmCount, normalCount, hasAbmLeads, onReviewStrategy }: ABMIndicatorsProps) {
  if (!hasAbmLeads) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Grandes Contas Detectadas</CardTitle>
              <Badge className="gap-1">
                <Building2 className="h-3 w-3" />
                Grande Conta
              </Badge>
            </div>
            <CardDescription>
              Lote contém empresas de alto valor que requerem abordagem ABM
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-2xl font-bold text-primary">{abmCount}</p>
            <p className="text-sm text-muted-foreground">Contas ABM</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-2xl font-bold">{normalCount}</p>
            <p className="text-sm text-muted-foreground">Contas Normais</p>
          </div>
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-2xl font-bold text-success flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {((abmCount / (abmCount + normalCount)) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa ABM</p>
          </div>
        </div>

        {onReviewStrategy && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Atenção necessária</p>
              <p className="text-sm text-muted-foreground">
                Grandes contas requerem personalização e aprovação de nível superior
              </p>
              <Button size="sm" variant="outline" onClick={onReviewStrategy}>
                Revisar Estratégia ABM
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
