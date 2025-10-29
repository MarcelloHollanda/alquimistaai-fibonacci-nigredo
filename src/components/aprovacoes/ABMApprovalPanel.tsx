import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ABMApproval {
  id: string;
  company_name: string;
  estimated_revenue: number;
  roi_estimated: number;
  net_gain: number;
  approval_level: string;
  research_checklist: {
    linkedin_executives: boolean;
    corporate_site: boolean;
    recent_news: boolean;
    financial_report: boolean;
    competitors_mapped: boolean;
    similar_case: boolean;
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface ABMApprovalPanelProps {
  approvals: ABMApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

export function ABMApprovalPanel({ approvals, onApprove, onReject, onRequestChanges }: ABMApprovalPanelProps) {
  const getChecklistProgress = (checklist: ABMApproval['research_checklist']) => {
    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const checklistLabels = {
    linkedin_executives: 'LinkedIn executivos pesquisado',
    corporate_site: 'Site corporativo analisado',
    recent_news: 'Notícias recentes',
    financial_report: 'Relatório financeiro',
    competitors_mapped: 'Concorrentes mapeados',
    similar_case: 'Case similar identificado',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Aprovações ABM Pendentes</h2>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma aprovação ABM pendente
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const progress = getChecklistProgress(approval.research_checklist);
            
            return (
              <Card key={approval.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <CardTitle>{approval.company_name}</CardTitle>
                        <Badge variant="outline" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {approval.approval_level}
                        </Badge>
                      </div>
                      <CardDescription>Grande Conta - Campanha ABM</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Métricas Principais */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground">Faturamento Estimado</p>
                      <p className="text-xl font-bold">{formatCurrency(approval.estimated_revenue)}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground">ROI Estimado</p>
                      <p className="text-xl font-bold text-success flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {approval.roi_estimated}%
                      </p>
                    </div>
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground">Ganho Líquido Estimado</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(approval.net_gain)}</p>
                    </div>
                  </div>

                  {/* Checklist de Pesquisa */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Checklist de Pesquisa</h4>
                      <span className="text-sm text-muted-foreground">
                        {progress.completed}/{progress.total} completo
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(approval.research_checklist).map(([key, completed]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {completed ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={completed ? "text-foreground" : "text-muted-foreground"}>
                            {checklistLabels[key as keyof typeof checklistLabels]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onApprove(approval.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar Campanha ABM
                    </Button>
                    <Button 
                      onClick={() => onRequestChanges(approval.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      Solicitar Ajustes
                    </Button>
                    <Button 
                      onClick={() => onReject(approval.id)}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
