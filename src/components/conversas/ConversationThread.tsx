import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Send, UserCheck, Calendar, Ban, TrendingUp, TrendingDown, Meh, Smile, Frown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  tipo: 'enviado' | 'recebido';
  texto: string;
  canal: string;
  sentimento?: string;
  intencao?: string;
  intensidade_emocional?: number; // 0-100
  tom?: string; // animado, irritado, formal, informal
  created_at: string;
}

interface ConversationThreadProps {
  leadId: string;
  leadNome: string;
  leadScore: number; // 0-100 score de qualificação
  leadStatus: 'quente' | 'morno' | 'frio';
  riscoCrediticio?: string;
  messages: Message[];
}

export function ConversationThread({ 
  leadId, 
  leadNome, 
  leadScore, 
  leadStatus,
  riscoCrediticio,
  messages 
}: ConversationThreadProps) {
  const [resposta, setResposta] = useState("");
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const lastMessage = messages[messages.length - 1];
  const sentimentoAtual = lastMessage?.sentimento;
  const tomAtual = lastMessage?.tom;

  // Sugestões de resposta baseadas em sentimento
  const getSugestoesResposta = () => {
    switch (sentimentoAtual?.toLowerCase()) {
      case 'positivo':
        return [
          `Que ótimo, ${leadNome}! Vamos agendar uma conversa para detalhar melhor?`,
          `Perfeito! Posso sugerir dois horários que funcionam melhor para você?`,
          `Excelente! Vou encaminhar para nosso time comercial agendar com você.`
        ];
      case 'neutro':
        return [
          `Entendo. Posso esclarecer alguma dúvida específica sobre nossa solução?`,
          `Sem problemas! O que seria mais importante para você saber neste momento?`,
          `Compreendo sua cautela. Que tal compartilhar um case de sucesso semelhante ao seu?`
        ];
      case 'negativo':
        return [
          `Entendo sua preocupação. Posso ajudar a esclarecer esse ponto?`,
          `Agradeço o retorno. Você prefere que eu retire seu contato ou gostaria de receber apenas materiais informativos?`,
          `Compreendo. Se mudar de ideia, estamos à disposição.`
        ];
      default:
        return [
          `Olá ${leadNome}, como posso ajudar?`,
          `Obrigado pelo retorno! Posso esclarecer algo?`,
          `Estou à disposição para ajudar.`
        ];
    }
  };

  const sugestoes = getSugestoesResposta();

  const enviarMutation = useMutation({
    mutationFn: async (mensagem: string) => {
      const { data } = await api.post('/api/conversas/responder', {
        lead_id: leadId,
        texto: mensagem,
        canal: lastMessage?.canal || 'whatsapp'
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso!");
      setResposta("");
      setSugestaoSelecionada(null);
      queryClient.invalidateQueries({ queryKey: ["inbound-messages"] });
    },
    onError: () => {
      toast.error("Falha ao enviar mensagem");
    }
  });

  const transferirAgendamentoMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/conversas/transferir-agendamento', {
        lead_id: leadId
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Lead transferido para agendamento!");
      queryClient.invalidateQueries({ queryKey: ["inbound-messages"] });
    },
    onError: () => {
      toast.error("Falha ao transferir lead");
    }
  });

  const aplicarDncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/dnc/add', {
        lead_id: leadId,
        motivo: 'opt_out_manual'
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Contato bloqueado (LGPD)");
      queryClient.invalidateQueries({ queryKey: ["inbound-messages"] });
    },
    onError: () => {
      toast.error("Falha ao bloquear contato");
    }
  });

  const handleEnviar = () => {
    const mensagemFinal = sugestaoSelecionada || resposta;
    if (!mensagemFinal.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }
    enviarMutation.mutate(mensagemFinal);
  };

  const getStatusColor = () => {
    switch (leadStatus) {
      case 'quente': return 'bg-red-500';
      case 'morno': return 'bg-yellow-500';
      case 'frio': return 'bg-blue-500';
    }
  };

  const getSentimentoIcon = (sentimento?: string, intensidade?: number) => {
    if (!sentimento) return <Meh className="h-4 w-4" />;
    
    const isIntenso = (intensidade || 0) > 70;
    
    switch (sentimento.toLowerCase()) {
      case 'positivo':
        return isIntenso ? <Smile className="h-5 w-5 text-green-600" /> : <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negativo':
        return isIntenso ? <Frown className="h-5 w-5 text-red-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTomBadge = (tom?: string) => {
    const badges: Record<string, { color: string; emoji: string }> = {
      'animado': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', emoji: '🎉' },
      'irritado': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', emoji: '😠' },
      'formal': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', emoji: '👔' },
      'informal': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', emoji: '😊' },
    };
    
    if (!tom) return null;
    const badge = badges[tom.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', emoji: '💬' };
    
    return (
      <Badge className={badge.color}>
        {badge.emoji} {tom}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Coluna 1: Perfil do Lead */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Perfil do Lead
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-semibold">{leadNome}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Score de Qualificação</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${leadScore >= 70 ? 'bg-green-500' : leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${leadScore}%` }}
                />
              </div>
              <span className="text-sm font-bold">{leadScore}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm capitalize font-medium">{leadStatus}</span>
          </div>

          {riscoCrediticio && (
            <Alert variant={riscoCrediticio === 'alto' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Risco:</strong> {riscoCrediticio}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t space-y-2">
            <Button
              onClick={() => transferirAgendamentoMutation.mutate()}
              disabled={transferirAgendamentoMutation.isPending || leadScore < 60}
              className="w-full"
              variant={leadScore >= 60 ? "default" : "secondary"}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Transferir p/ Agendamento
            </Button>
            {leadScore < 60 && (
              <p className="text-xs text-muted-foreground">
                Score mínimo: 60
              </p>
            )}

            <Button
              onClick={() => aplicarDncMutation.mutate()}
              disabled={aplicarDncMutation.isPending}
              variant="outline"
              className="w-full"
            >
              <Ban className="h-4 w-4 mr-2" />
              Parar Contato (LGPD)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coluna 2: Histórico da Conversa */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico da Conversa</CardTitle>
          <CardDescription>Timeline completa de interações</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.tipo === 'enviado' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.tipo === 'enviado'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.tipo === 'recebido' && (
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentoIcon(msg.sentimento, msg.intensidade_emocional)}
                        {getTomBadge(msg.tom)}
                        {msg.intensidade_emocional && (
                          <Badge variant="outline" className="text-xs">
                            {msg.intensidade_emocional}% intenso
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}</span>
                      {msg.intencao && (
                        <Badge variant="outline" className="text-xs">
                          {msg.intencao}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Coluna 3: Resposta Humanizada */}
      <Card>
        <CardHeader>
          <CardTitle>Resposta Consultiva</CardTitle>
          <CardDescription>
            {sentimentoAtual && (
              <span className="flex items-center gap-1">
                {getSentimentoIcon(sentimentoAtual, lastMessage?.intensidade_emocional)}
                Resposta adaptada ao sentimento: <strong>{sentimentoAtual}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Sugestões de resposta:</p>
            {sugestoes.map((sugestao, idx) => (
              <Button
                key={idx}
                variant={sugestaoSelecionada === sugestao ? "default" : "outline"}
                className="w-full text-left justify-start h-auto whitespace-normal"
                onClick={() => {
                  setSugestaoSelecionada(sugestao);
                  setResposta(sugestao);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{sugestao}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Ou escreva sua resposta:</p>
            <Textarea
              value={resposta}
              onChange={(e) => {
                setResposta(e.target.value);
                setSugestaoSelecionada(null);
              }}
              placeholder="Digite sua mensagem humanizada..."
              rows={6}
            />
          </div>

          <Button
            onClick={handleEnviar}
            disabled={enviarMutation.isPending || (!resposta.trim() && !sugestaoSelecionada)}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {enviarMutation.isPending ? "Enviando..." : "Enviar Resposta"}
          </Button>

          {tomAtual && (
            <Alert>
              <AlertDescription className="text-xs">
                💡 <strong>Dica:</strong> Lead está {tomAtual}. {
                  tomAtual === 'irritado' 
                    ? 'Responda com empatia, sem insistir.' 
                    : tomAtual === 'animado'
                    ? 'Aproveite o momento e avance para agendamento!'
                    : 'Mantenha tom profissional e consultivo.'
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
