import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Target, MessageSquare, CheckCircle2, RefreshCw, Send, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

interface LotePerformance {
  lote_id: string;
  lote_nome?: string;
  total_leads: number;
  mensagens_enviadas: number;
  mensagens_entregues: number;
  respostas_recebidas: number;
  respostas_qualificadas: number;
  taxa_envio: number;
  taxa_entrega: number;
  taxa_resposta: number;
  taxa_qualificada: number;
  score: 'A' | 'B' | 'C' | 'D' | 'F';
  nota_ponderada: number;
  created_at: string;
  updated_at: string;
}

export function LoteEfficiencyPanel() {
  const queryClient = useQueryClient();

  // Fetch lotes disponíveis
  const { data: lotes = [] } = useQuery({
    queryKey: ["lotes"],
    queryFn: async () => {
      const { data } = await api.get("/api/lotes");
      return data;
    },
  });

  // Fetch performance de cada lote
  const { data: performances = [], isLoading } = useQuery({
    queryKey: ["lote-performances", lotes],
    queryFn: async () => {
      if (lotes.length === 0) return [];
      
      const promises = lotes.map(async (lote: any) => {
        try {
          const { data } = await api.get(`/api/lote-performance/${lote.id}`);
          return { ...data, lote_nome: lote.nome };
        } catch (error) {
          console.error(`Erro ao buscar performance do lote ${lote.id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter(Boolean).sort((a, b) => b.nota_ponderada - a.nota_ponderada);
    },
    enabled: lotes.length > 0,
  });

  // Mutation para recalcular performance
  const recalculateMutation = useMutation({
    mutationFn: async (loteId: string) => {
      const { data } = await api.post(`/api/lote-performance/${loteId}/recalculate`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lote-performances"] });
      toast.success(`Performance recalculada! Novo score: ${data.score}`);
      
      // Alerta para scores ruins
      if (data.score === 'D' || data.score === 'F') {
        toast.warning(`⚠️ Lote com score ${data.score} - Requer atenção imediata!`);
      }
    },
    onError: () => {
      toast.error("Falha ao recalcular performance");
    },
  });

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'A': return "text-green-600 dark:text-green-400";
      case 'B': return "text-blue-600 dark:text-blue-400";
      case 'C': return "text-yellow-600 dark:text-yellow-400";
      case 'D': return "text-orange-600 dark:text-orange-400";
      case 'F': return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getScoreBadge = (score: string) => {
    switch (score) {
      case 'A': return { variant: "default" as const, label: "Excelente", color: "bg-green-500" };
      case 'B': return { variant: "default" as const, label: "Bom", color: "bg-blue-500" };
      case 'C': return { variant: "secondary" as const, label: "Regular", color: "bg-yellow-500" };
      case 'D': return { variant: "destructive" as const, label: "Ruim", color: "bg-orange-500" };
      case 'F': return { variant: "destructive" as const, label: "Péssimo", color: "bg-red-500" };
      default: return { variant: "outline" as const, label: "N/A", color: "bg-gray-500" };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classificação de Eficiência por Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando performances...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classificação de Eficiência por Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum lote com performance registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Classificação de Eficiência por Lote
        </CardTitle>
        <CardDescription>
          Performance e ranking de cada lote de Leads disparado (ordenado por nota ponderada)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {performances.map((perf: LotePerformance) => {
            const scoreBadge = getScoreBadge(perf.score);
            
            return (
              <div key={perf.lote_id} className="border rounded-lg p-4 space-y-4">
                {/* Header do Lote */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{perf.lote_nome || `Lote ${perf.lote_id.slice(0, 8)}`}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {perf.total_leads} Leads · Nota Ponderada: {perf.nota_ponderada.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scoreBadge.variant} className={scoreBadge.color}>
                      {scoreBadge.label}
                    </Badge>
                    <span className={`text-3xl font-bold ${getScoreColor(perf.score)}`}>
                      {perf.score}
                    </span>
                  </div>
                </div>

                {/* Funil Completo: 4 Estágios */}
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Send className="h-3 w-3" />
                      <span>Enviados</span>
                    </div>
                    <p className="text-lg font-bold">{perf.mensagens_enviadas}</p>
                    <p className="text-xs text-muted-foreground">
                      {(perf.taxa_envio * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Entregues</span>
                    </div>
                    <p className="text-lg font-bold">{perf.mensagens_entregues}</p>
                    <p className="text-xs text-muted-foreground">
                      {(perf.taxa_entrega * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>Responderam</span>
                    </div>
                    <p className="text-lg font-bold">{perf.respostas_recebidas}</p>
                    <p className="text-xs text-muted-foreground">
                      {(perf.taxa_resposta * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Qualificados</span>
                    </div>
                    <p className="text-lg font-bold">{perf.respostas_qualificadas}</p>
                    <p className="text-xs text-muted-foreground">
                      {(perf.taxa_qualificada * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bars do Funil */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de Envio</span>
                      <span className="font-medium">{(perf.taxa_envio * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={perf.taxa_envio * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de Entrega</span>
                      <span className="font-medium">{(perf.taxa_entrega * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={perf.taxa_entrega * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de Resposta</span>
                      <span className="font-medium">{(perf.taxa_resposta * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={perf.taxa_resposta * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taxa de Qualificação</span>
                      <span className="font-medium">{(perf.taxa_qualificada * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={perf.taxa_qualificada * 100} className="h-2" />
                  </div>
                </div>

                {/* Botão Recalcular */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => recalculateMutation.mutate(perf.lote_id)}
                    disabled={recalculateMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                    Recalcular Performance
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    Atualizado: {new Date(perf.updated_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                {/* Recomendações para scores ruins */}
                {(perf.score === 'D' || perf.score === 'F') && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-xs">
                    <p className="font-medium text-red-700 dark:text-red-400">
                      ⚠️ Atenção: Score crítico! Recomendações:
                      {perf.taxa_entrega < 0.8 && " • Verificar números bloqueados"}
                      {perf.taxa_resposta < 0.1 && " • Melhorar copy das mensagens"}
                      {perf.taxa_qualificada < 0.5 && " • Revisar critérios de qualificação"}
                    </p>
                  </div>
                )}
                {perf.score === 'C' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-xs">
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      💡 Recomendação: {
                        perf.taxa_resposta < 0.15
                          ? "Testar horários diferentes ou melhorar copy"
                          : "Melhorar segmentação de leads"
                      }
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
