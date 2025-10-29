import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Inconformidade } from "@/types/enrichment";

interface InconformidadesReportProps {
  inconformidades: Inconformidade[];
}

export function InconformidadesReport({ inconformidades }: InconformidadesReportProps) {
  if (inconformidades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            ✓ Validação
          </CardTitle>
          <CardDescription>
            Todos os leads foram validados com sucesso
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Inconformidades ({inconformidades.length})
        </CardTitle>
        <CardDescription>
          Problemas encontrados durante a validação que precisam de atenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {inconformidades.map((inc, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Linha {inc.linha}</Badge>
                <span className="text-sm font-medium">{inc.motivo}</span>
              </div>
              {inc.sugestao && (
                <p className="text-sm text-muted-foreground">
                  💡 Sugestão: {inc.sugestao}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
