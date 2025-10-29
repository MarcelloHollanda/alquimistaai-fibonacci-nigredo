import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgentStatusSkeleton } from "./AgentStatusSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface AgentStatus {
  name: string;
  status: "active" | "inactive" | "error";
  type?: string;
  lastActivity?: string;
}

export function AgentsStatusWidget() {
  const { toast } = useToast();
  
  const { data: agents, isLoading, isError, error, failureCount } = useQuery<AgentStatus[]>({
    queryKey: ["agents-status"],
    queryFn: async () => {
      const { data } = await api.get("/api/agents/status");
      return data.agents || [];
    },
    refetchInterval: 30000,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 20000,
  });

  // Feedback de retry
  useEffect(() => {
    if (failureCount > 0 && failureCount <= 3) {
      toast({
        title: "Reconectando...",
        description: `Tentativa ${failureCount} de 5. Backend pode estar iniciando.`,
        duration: 2000,
      });
    }
  }, [failureCount, toast]);

  const activeCount = agents?.filter(a => a.status === "active").length || 0;
  const errorCount = agents?.filter(a => a.status === "error").length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-success shrink-0 whitespace-nowrap justify-self-end">Ativo</Badge>;
      case "error":
        return <Badge variant="destructive" className="shrink-0 whitespace-nowrap justify-self-end">Erro</Badge>;
      default:
        return <Badge variant="secondary" className="shrink-0 whitespace-nowrap justify-self-end">Inativo</Badge>;
    }
  };
  // Mostrar skeleton durante loading inicial
  if (isLoading && !agents) {
    return <AgentStatusSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Status dos Agentes
              {isLoading && agents && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>
              {activeCount} ativos de {agents?.length || 0} agentes
            </CardDescription>
          </div>
          {errorCount > 0 && (
            <Badge variant="destructive">{errorCount} com erro</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao conectar ao backend. Tentando reconectar...
            </AlertDescription>
          </Alert>
        )}

        {agents && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="grid grid-cols-[1fr_auto] items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden"
              >
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  {getStatusIcon(agent.status)}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-medium text-sm truncate">{agent.name}</div>
                    {agent.type && (
                      <div className="text-xs text-muted-foreground truncate">{agent.type}</div>
                    )}
                  </div>
                </div>
                {getStatusBadge(agent.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
