import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { mockApprovals } from "@/lib/mock-data";

interface ApprovalDetailProps {
  approvalId: string;
  onClose: () => void;
}

export function ApprovalDetail({ approvalId, onClose }: ApprovalDetailProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: approval } = useQuery({
    queryKey: ["approval", approvalId],
    queryFn: async () => {
      const { data } = await api.get(`/approvals/${approvalId}`);
      return data;
    },
    initialData: mockApprovals.find((a) => a.id === approvalId),
  });

  const commentMutation = useMutation({
    mutationFn: async (texto: string) => {
      const { data } = await api.post(`/approvals/${approvalId}/comment`, { texto });
      return data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["approval", approvalId] });
      toast.success("Comentário adicionado");
    },
    onError: () => {
      toast.info("Comentário simulado");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async (acao: string) => {
      const { data } = await api.post(`/approvals/${approvalId}/decision`, {
        acao,
        nota: comment || undefined,
      });
      return data;
    },
    onSuccess: (_, acao) => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      toast.success(`Aprovação ${acao === "aprovar" ? "aprovada" : "modificada"}!`);
      onClose();
    },
    onError: () => {
      toast.info("Decisão simulada");
      onClose();
    },
  });

  if (!approval) return null;

  const canApprove = user && user.email !== approval.criado_por;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{approval.titulo}</h3>
          <p className="text-sm text-muted-foreground">{approval.descricao}</p>
        </div>
        <Badge variant={approval.status === "aprovado" ? "default" : "secondary"}>
          {approval.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tipo:</span>
          <span className="font-medium">{approval.tipo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Criado por:</span>
          <span className="font-medium">{approval.criado_por}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium">
            {new Date(approval.criado_em).toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Quorum:</span>
          <span className="font-medium">{approval.required_quorum}</span>
        </div>
      </div>

      {approval.diffs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mudanças</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
              {JSON.stringify(approval.diffs, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold">Comentários</h4>
        {approval.historico && approval.historico.length > 0 ? (
          <div className="space-y-3">
            {approval.historico.map((item: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{item.usuario}</span>
                    <span className="text-muted-foreground">{item.data}</span>
                  </div>
                  <p className="text-sm">{item.texto}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum comentário ainda</p>
        )}

        <Textarea
          placeholder="Adicionar comentário..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          onClick={() => commentMutation.mutate(comment)}
          disabled={!comment.trim() || commentMutation.isPending}
          variant="outline"
          className="w-full"
        >
          Adicionar Comentário
        </Button>
      </div>

      {approval.status === "em_revisao" && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-semibold">Ações</h4>
            {!canApprove && (
              <p className="text-sm text-warning">
                ⚠️ Você não pode aprovar sua própria solicitação (quatro-olhos)
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => decisionMutation.mutate("aprovar")}
                disabled={!canApprove || decisionMutation.isPending}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
              <Button
                onClick={() => decisionMutation.mutate("solicitar_ajustes")}
                disabled={!canApprove || decisionMutation.isPending}
                variant="secondary"
                className="w-full"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Ajustes
              </Button>
              <Button
                onClick={() => decisionMutation.mutate("reprovar")}
                disabled={!canApprove || decisionMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reprovar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
