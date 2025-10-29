import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, AlertCircle, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ConversationThread } from "@/components/conversas/ConversationThread";
import { SentimentAnalysisPanel } from "@/components/conversas/SentimentAnalysisPanel";
import { LeadQualificationCard } from "@/components/conversas/LeadQualificationCard";
import { EmocaoTimeline } from "@/components/conversas/EmocaoTimeline";
import { FitBadge } from "@/components/conversas/FitBadge";
import { useConversaInteligente } from "@/hooks/useConversaInteligente";
import api from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InboundMessage {
  id: string;
  canal: string;
  from_e164: string;
  from_email: string;
  lead_id: string;
  texto: string;
  intencao: string;
  sentimento: string;
  created_at: string;
  classificado_em: string;
}

export default function Conversas() {
  const [selectedMessage, setSelectedMessage] = useState<InboundMessage | null>(null);
  const [canalFilter, setCanalFilter] = useState<string>("todos");
  const [sentimentoFilter, setSentimentoFilter] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<string>("lista");
  
  const { data: messages = [], isError, isLoading } = useQuery({
    queryKey: ["inbound-messages", canalFilter, sentimentoFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (canalFilter !== "todos") params.append("canal", canalFilter);
      if (sentimentoFilter !== "todos") params.append("sentimento", sentimentoFilter);
      
      const response = await api.get(`/api/inbound/messages?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 10000,
  });

  const { data: summary } = useQuery({
    queryKey: ["inbound-summary"],
    queryFn: async () => {
      const response = await api.get("/api/inbound/summary");
      return response.data;
    },
    refetchInterval: 30000,
  });

  const getSentimentIcon = (sentimento: string) => {
    switch (sentimento?.toLowerCase()) {
      case "positivo":
        return <TrendingUp className="h-4 w-4" />;
      case "negativo":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentVariant = (sentimento: string): "default" | "destructive" | "secondary" => {
    switch (sentimento?.toLowerCase()) {
      case "positivo": return "default";
      case "negativo": return "destructive";
      default: return "secondary";
    }
  };

  const getIntencaoColor = (intencao: string) => {
    const colors: Record<string, string> = {
      interesse: "text-green-600",
      duvida: "text-blue-600",
      objecao: "text-orange-600",
      reclamacao: "text-red-600",
    };
    return colors[intencao?.toLowerCase()] || "text-muted-foreground";
  };

  // Mock data para demonstração dos novos componentes
  const mockConversationMessages = [
    {
      id: "1",
      tipo: "enviado" as const,
      texto: "Olá! Vi que você se interessou pela nossa solução. Podemos conversar sobre como podemos ajudar?",
      canal: "whatsapp",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "2",
      tipo: "recebido" as const,
      texto: "Sim, estou interessado! Vocês trabalham com empresas do meu segmento?",
      canal: "whatsapp",
      sentimento: "positivo",
      tom: "animado",
      intencao: "interesse",
      intensidade_emocional: 75,
      created_at: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: "3",
      tipo: "enviado" as const,
      texto: "Claro! Trabalhamos com diversos setores. Pode me contar um pouco mais sobre seu negócio?",
      canal: "whatsapp",
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const mockSentimentAnalysis = {
    sentimento: "positivo" as const,
    intensidade: 75,
    tom: "animado" as const,
    intencao: "interesse" as const,
    contexto: "Lead demonstra interesse genuíno e faz perguntas qualificadas sobre adequação da solução ao segmento. Tom empolgado sugere abertura para avançar.",
    palavras_chave: ["interessado", "empresas", "segmento", "podemos"],
    recomendacao_resposta: "Momento ideal para aprofundar conversa e propor agendamento. Lead está engajado e receptivo.",
    nivel_prioridade: "alta" as const
  };

  const mockQualification = {
    score: 78,
    status: "quente" as const,
    risco_crediticio: "baixo" as const,
    perfil_cliente_ideal: true,
    fatores_positivos: [
      "Empresa com faturamento acima de R$ 1M/ano",
      "Segmento alinhado com <TermTooltip term=\"ICP\" showIcon={false} />",
      "Demonstrou interesse ativo",
      "Respondeu rapidamente às mensagens"
    ],
    fatores_negativos: [
      "Ainda não confirmou orçamento disponível"
    ],
    valor_potencial_estimado: 45000,
    probabilidade_conversao: 72
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimento Conversacional</h1>
          <p className="text-muted-foreground">
            Agente de Atendimento com Análise de Sentimento IA
          </p>
        </div>
        {summary && (
          <div className="flex gap-3">
            <Badge variant="default">
              <MessageSquare className="h-4 w-4 mr-1" />
              {summary.total || 0} mensagens (24h)
            </Badge>
            {summary.opt_out_rate > 0 && (
              <Badge variant="destructive">
                {(summary.opt_out_rate * 100).toFixed(1)}% opt-out
              </Badge>
            )}
          </div>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Falha ao carregar mensagens. Verifique a conexão com o backend.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Mensagens</TabsTrigger>
          <TabsTrigger value="atendimento" disabled={!selectedMessage}>
            Atendimento Ativo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <div className="flex gap-3">
            <Select value={canalFilter} onValueChange={setCanalFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentoFilter} onValueChange={setSentimentoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sentimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="positivo">Positivo</SelectItem>
                <SelectItem value="neutro">Neutro</SelectItem>
                <SelectItem value="negativo">Negativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Recebidas</CardTitle>
                <CardDescription>Últimas interações dos leads</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[500px]">
                    <p className="text-muted-foreground">Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma mensagem encontrada</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {messages.map((msg: InboundMessage) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedMessage?.id === msg.id
                              ? "bg-accent border-primary"
                              : "hover:bg-accent/50"
                          }`}
                          onClick={() => {
                            setSelectedMessage(msg);
                            setActiveTab("atendimento");
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {msg.canal === "whatsapp" ? (
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              ) : (
                                <Mail className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="font-semibold text-sm">
                                {msg.from_e164 || msg.from_email}
                              </span>
                            </div>
                            {msg.sentimento && (
                              <Badge variant={getSentimentVariant(msg.sentimento)}>
                                {getSentimentIcon(msg.sentimento)}
                                <span className="ml-1">{msg.sentimento}</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {msg.texto}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                            {msg.intencao && (
                              <Badge variant="outline" className={getIntencaoColor(msg.intencao)}>
                                {msg.intencao}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Mensagem</CardTitle>
                <CardDescription>Informações completas</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-sm text-muted-foreground">Origem</p>
                        <p className="font-semibold text-sm">
                          {selectedMessage.from_e164 || selectedMessage.from_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Canal</p>
                        <div className="flex items-center gap-2">
                          {selectedMessage.canal === "whatsapp" ? (
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Mail className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="capitalize">{selectedMessage.canal}</span>
                        </div>
                      </div>
                      {selectedMessage.sentimento && (
                        <div>
                          <p className="text-sm text-muted-foreground">Sentimento</p>
                          <Badge variant={getSentimentVariant(selectedMessage.sentimento)}>
                            {getSentimentIcon(selectedMessage.sentimento)}
                            <span className="ml-1">{selectedMessage.sentimento}</span>
                          </Badge>
                        </div>
                      )}
                      {selectedMessage.intencao && (
                        <div>
                          <p className="text-sm text-muted-foreground">Intenção</p>
                          <Badge variant="outline" className={getIntencaoColor(selectedMessage.intencao)}>
                            {selectedMessage.intencao}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Mensagem</p>
                      <div className="p-4 bg-accent rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedMessage.texto}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs">
                      <div>
                        <p className="text-muted-foreground">Recebida em</p>
                        <p className="font-medium">
                          {format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {selectedMessage.classificado_em && (
                        <div>
                          <p className="text-muted-foreground">Classificada em</p>
                          <p className="font-medium">
                            {format(new Date(selectedMessage.classificado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setActiveTab("atendimento")}
                      className="w-full"
                    >
                      Iniciar Atendimento
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Selecione uma mensagem para ver os detalhes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="atendimento" className="space-y-6">
          {selectedMessage && (
            <>
              <ConversationThread
                leadId={selectedMessage.lead_id}
                leadNome={selectedMessage.from_e164 || selectedMessage.from_email}
                leadScore={mockQualification.score}
                leadStatus={mockQualification.status}
                riscoCrediticio={mockQualification.risco_crediticio}
                messages={mockConversationMessages}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <SentimentAnalysisPanel analysis={mockSentimentAnalysis} />
                <LeadQualificationCard qualification={mockQualification} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
