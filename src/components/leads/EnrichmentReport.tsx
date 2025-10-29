import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Globe, Building2, Search } from "lucide-react";
import { EnrichmentReport as EnrichmentReportType } from "@/types/enrichment";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EnrichmentReportProps {
  report: EnrichmentReportType;
  onFieldClick?: (linha: number, field: string) => void;
}

const sourceIcons: Record<string, React.ReactNode> = {
  receita_federal: <Building2 className="h-4 w-4" />,
  google_places: <Globe className="h-4 w-4" />,
  web_search: <Search className="h-4 w-4" />,
};

const sourceLabels: Record<string, string> = {
  receita_federal: "Receita Federal",
  google_places: "Google Places",
  web_search: "Busca Web",
};

export function EnrichmentReport({ report, onFieldClick }: EnrichmentReportProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (linha: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(linha)) {
      newExpanded.delete(linha);
    } else {
      newExpanded.add(linha);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Relatório de Enriquecimento
        </CardTitle>
        <CardDescription>
          Dados externos utilizados para complementar as informações dos leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Enriquecido</p>
            <p className="text-2xl font-bold">{report.total_enriched}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Campos Ajustados</p>
            <p className="text-2xl font-bold text-green-600">{report.total_adjusted_fields}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Campos Faltantes</p>
            <p className="text-2xl font-bold text-orange-600">{report.total_missing_fields}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fontes Usadas</p>
            <div className="flex gap-1 flex-wrap">
              {report.sources_used.map((source) => (
                <Badge key={source} variant="secondary" className="gap-1">
                  {sourceIcons[source]}
                  {sourceLabels[source]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {report.details.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Detalhes por Linha</h4>
            <div className="border rounded-lg divide-y">
              {report.details.map((detail) => (
                <div key={detail.linha} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Linha {detail.linha}</span>
                      <div className="flex gap-1">
                        {detail.enrichment_sources.map((source) => (
                          <Badge key={source} variant="outline" className="gap-1">
                            {sourceIcons[source]}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="secondary">
                        {detail.adjusted_fields.length} ajustados
                      </Badge>
                      {detail.missing_fields.length > 0 && (
                        <Badge variant="destructive">
                          {detail.missing_fields.length} faltantes
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(detail.linha)}
                    >
                      {expandedRows.has(detail.linha) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {expandedRows.has(detail.linha) && (
                    <div className="mt-3 space-y-2 text-sm">
                      {detail.adjusted_fields.length > 0 && (
                        <div>
                          <p className="font-medium text-green-600">Campos Ajustados:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {detail.adjusted_fields.map((field) => (
                              <Badge
                                key={field}
                                variant="outline"
                                className={cn(
                                  "cursor-pointer hover:bg-accent",
                                  onFieldClick && "cursor-pointer"
                                )}
                                onClick={() => onFieldClick?.(detail.linha, field)}
                              >
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {detail.missing_fields.length > 0 && (
                        <div>
                          <p className="font-medium text-orange-600">Campos Faltantes:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {detail.missing_fields.map((field) => (
                              <Badge
                                key={field}
                                variant="outline"
                                className={cn(
                                  "border-orange-300",
                                  onFieldClick && "cursor-pointer hover:bg-accent"
                                )}
                                onClick={() => onFieldClick?.(detail.linha, field)}
                              >
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
