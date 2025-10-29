import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, UserCircle, MessageCircleReply, Clock, CheckCircle } from "lucide-react";
import { useInboundMessages, useInboundSummary } from "@/hooks/useInboundMessages";

export function ResponseRoutingPanel() {
  const { data: summary } = useInboundSummary();
  const { data: recentMessages = [] } = useInboundMessages(5, 0);

  return (
    <div className="space-y-4">
      {/* Sumário de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleReply className="h-5 w-5" />
            Roteamento de Respostas
          </CardTitle>
          <CardDescription>
            Respostas de Leads são encaminhadas automaticamente para o Agente de Atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Recebidas</p>
              <p className="text-2xl font-bold">{summary?.total_mensagens || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Últimas 24h</p>
              <p className="text-2xl font-bold text-primary">{summary?.ultimas_24h || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{summary?.pendentes_resposta || 0}</p>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              ✅ <strong>Roteamento ativo:</strong> Todas as respostas dos Leads são 
              automaticamente encaminhadas para a fila de atendimento humano em tempo real.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Fluxo de Roteamento */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo Automático</CardTitle>
          <CardDescription>Como funciona o roteamento de respostas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircleReply className="h-5 w-5 text-primary" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">1. Lead responde mensagem</p>
                <p className="text-xs text-muted-foreground">WhatsApp, Email ou SMS</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">2. Sistema detecta resposta</p>
                <p className="text-xs text-muted-foreground">Identificação instantânea</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">3. Roteado para Atendimento</p>
                <p className="text-xs text-muted-foreground">Agente humano assume conversa</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">4. Lead recebe atendimento personalizado</p>
                <p className="text-xs text-muted-foreground">Conversão aumenta significativamente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Respostas */}
      {recentMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Respostas Recebidas</CardTitle>
            <CardDescription>Mensagens mais recentes aguardando atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {msg.nome_contato || msg.telefone_origem}
                      </p>
                      <Badge variant="outline" className="shrink-0">
                        {msg.tipo_msg || 'whatsapp'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {msg.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
