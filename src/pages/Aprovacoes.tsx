import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { mockApprovals } from "@/lib/mock-data";
import { ApprovalDetail } from "@/components/aprovacoes/ApprovalDetail";
import { ABMApprovalPanel } from "@/components/aprovacoes/ABMApprovalPanel";
import { TermTooltip } from "@/components/ui/term-tooltip";

export default function Aprovacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("em_revisao");
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  const { data: approvals = mockApprovals } = useQuery({
    queryKey: ["approvals", selectedStatus],
    queryFn: async () => {
      const { data } = await api.get(`/approvals/queue?estado=${selectedStatus}`);
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "em_revisao":
        return <Clock className="h-4 w-4" />;
      case "aprovado":
        return <CheckCircle className="h-4 w-4" />;
      case "reprovado":
        return <XCircle className="h-4 w-4" />;
      case "ajustes":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "aprovado":
        return "default";
      case "reprovado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Mock ABM approvals
  const mockABMApprovals = [
    {
      id: 'abm-1',
      company_name: 'TechCorp Solutions LTDA',
      estimated_revenue: 50000000,
      roi_estimated: 567,
      net_gain: 1700000,
      approval_level: '⚠️ Diretor',
      research_checklist: {
        linkedin_executives: true,
        corporate_site: true,
        recent_news: false,
        financial_report: false,
        competitors_mapped: false,
        similar_case: false,
      },
      status: 'pending' as const,
    },
  ];

  const handleABMApprove = (id: string) => {
    toast.success('Campanha ABM aprovada!');
  };

  const handleABMReject = (id: string) => {
    toast.error('Campanha ABM reprovada');
  };

  const handleABMRequestChanges = (id: string) => {
    toast.info('Solicitação de ajustes enviada');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aprovações</h1>
        <p className="text-muted-foreground">Revisão e aprovação com quatro-olhos</p>
      </div>

      {/* Aprovações ABM - Seção Dedicada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Campanhas <TermTooltip term="ABM" />
          </CardTitle>
          <CardDescription>
            Aprovação de campanhas de alto valor com estratégia personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ABMApprovalPanel 
            approvals={mockABMApprovals}
            onApprove={handleABMApprove}
            onReject={handleABMReject}
            onRequestChanges={handleABMRequestChanges}
          />
        </CardContent>
      </Card>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="em_revisao">Em Revisão</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
          <TabsTrigger value="aprovado">Aprovadas</TabsTrigger>
          <TabsTrigger value="reprovado">Reprovadas</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {approvals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma aprovação encontrada
              </CardContent>
            </Card>
          ) : (
            approvals.map((approval) => (
              <Card key={approval.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader onClick={() => setSelectedApproval(approval.id)}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{approval.titulo}</CardTitle>
                      <CardDescription>{approval.descricao}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(approval.status)}>
                      {getStatusIcon(approval.status)}
                      <span className="ml-1 capitalize">{approval.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <span>Tipo: {approval.tipo}</span>
                    <span>•</span>
                    <span>Por: {approval.criado_por}</span>
                    <span>•</span>
                    <span>{new Date(approval.criado_em).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe da Aprovação</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <ApprovalDetail
              approvalId={selectedApproval}
              onClose={() => setSelectedApproval(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
