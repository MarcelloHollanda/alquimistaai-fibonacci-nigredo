import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp } from "lucide-react";

interface ABMMetrics {
  response_rate: number;
  total_pipeline_value: number;
  avg_roi: number;
  cost_per_lead: number;
  avg_deal_value: number;
}

interface ComparisonMetrics {
  abm: ABMMetrics;
  normal: {
    response_rate: number;
    cost_per_lead: number;
    avg_deal_value: number;
  };
}

interface ABMPerformanceReportProps {
  metrics: ComparisonMetrics;
}

export function ABMPerformanceReport({ metrics }: ABMPerformanceReportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const comparisonData = [
    {
      metric: 'Taxa de Resposta',
      abm: formatPercentage(metrics.abm.response_rate),
      normal: formatPercentage(metrics.normal.response_rate),
      difference: ((metrics.abm.response_rate / metrics.normal.response_rate - 1) * 100).toFixed(0),
    },
    {
      metric: 'Custo por Lead',
      abm: formatCurrency(metrics.abm.cost_per_lead),
      normal: formatCurrency(metrics.normal.cost_per_lead),
      difference: ((metrics.abm.cost_per_lead / metrics.normal.cost_per_lead - 1) * 100).toFixed(0),
    },
    {
      metric: 'Valor Médio Negócio',
      abm: formatCurrency(metrics.abm.avg_deal_value),
      normal: formatCurrency(metrics.normal.avg_deal_value),
      difference: ((metrics.abm.avg_deal_value / metrics.normal.avg_deal_value - 1) * 100).toFixed(0),
    },
  ];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Performance ABM</CardTitle>
        </div>
        <CardDescription>
          Comparação entre campanhas ABM e campanhas normais
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* KPIs Principais ABM */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Taxa Resposta Grandes Contas</p>
            <p className="text-2xl font-bold text-primary">{formatPercentage(metrics.abm.response_rate)}</p>
          </div>
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground mb-1">Valor Total Pipeline ABM</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(metrics.abm.total_pipeline_value)}</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-muted-foreground mb-1">ROI Médio ABM</p>
            <p className="text-2xl font-bold text-warning flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {formatPercentage(metrics.abm.avg_roi)}
            </p>
          </div>
        </div>

        {/* Tabela de Comparação */}
        <div>
          <h4 className="font-semibold mb-3">Comparação ABM vs Normal</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead className="text-center">ABM</TableHead>
                <TableHead className="text-center">Normal</TableHead>
                <TableHead className="text-center">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">{row.abm}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{row.normal}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={parseFloat(row.difference) > 0 ? "default" : "destructive"}
                      className={parseFloat(row.difference) > 0 ? "bg-success hover:bg-success" : ""}
                    >
                      {parseFloat(row.difference) > 0 ? '+' : ''}{row.difference}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Insights */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium mb-2">💡 Insights</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Campanhas ABM têm {comparisonData[0].difference}% mais taxa de resposta</li>
            <li>Valor médio de negócio ABM é {comparisonData[2].difference}% superior</li>
            <li>Investimento em ABM justificado pelo ROI de {formatPercentage(metrics.abm.avg_roi)}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
