import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { AgendamentoCard } from '@/components/agendamentos/AgendamentoCard';
import { ProtocoloRetomadaPanel } from '@/components/agendamentos/ProtocoloRetomadaPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Search, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { mockAgendamentos } from "@/lib/mock-data";
import { fetchMetrics } from "@/lib/metrics-api";
import { toast } from "sonner";

export default function Agendamentos() {
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Integração T6 com novos hooks
  const { agendamentos: agendamentosT6, loading: loadingT6, atualizarStatus } = useAgendamentos();

  const { data: agendamentos = mockAgendamentos } = useQuery({
    queryKey: ["agendamentos", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "todos" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/agendamentos${params}`);
      return data;
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 15000,
    retry: 2,
  });

  const totalFailures = Object.values(metrics?.agendamento_falha_total || {}).reduce((a, b) => a + b, 0);
  const systemOk = totalFailures < 10;

  const handleOpenDiagnostico = (id: string) => {
    window.open(`/agendamentos/${id}`, "_blank");
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado", {
      description: `ID ${id.slice(0, 8)}... copiado para a área de transferência`,
    });
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "confirmado":
        return "default";
      case "proposto":
        return "secondary";
      case "falha":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredAgendamentos = searchId
    ? agendamentos.filter((a) => a.id.includes(searchId))
    : agendamentos;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="t6" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">📅 Agendamentos</h1>
            <p className="text-muted-foreground">
              T6 - Agendamentos com resumo comercial + Diagnóstico do sistema
            </p>
          </div>
          <Badge variant={systemOk ? "default" : "destructive"} className="text-sm">
            {systemOk ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Sistema OK
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {totalFailures} falhas (24h)
              </>
            )}
          </Badge>
        </div>

        <TabsList>
          <TabsTrigger value="t6">T6 - Agendamentos</TabsTrigger>
          <TabsTrigger value="retomada">Protocolo Retomada</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="t6" className="space-y-4">
          {loadingT6 ? (
            <Skeleton className="h-64 w-full" />
          ) : agendamentosT6.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {agendamentosT6.map((agendamento) => (
                <AgendamentoCard
                  key={agendamento.id}
                  agendamento={agendamento}
                  onStatusChange={atualizarStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="retomada">
          <ProtocoloRetomadaPanel />
        </TabsContent>

        <TabsContent value="diagnostico" className="space-y-6">

      {!systemOk && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alto volume de falhas detectado. <a href="/relatorios?tab=qualidade" className="underline font-medium">Ver relatório de qualidade</a>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por ID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o ID do agendamento"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <Button size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="proposto">Proposto</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="falha">Falha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell className="font-mono text-xs">
                    {agendamento.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">{agendamento.lead}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{agendamento.canal}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(agendamento.status)}>
                      {agendamento.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(agendamento.criado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(agendamento.atualizado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyId(agendamento.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDiagnostico(agendamento.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Diagnóstico
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
