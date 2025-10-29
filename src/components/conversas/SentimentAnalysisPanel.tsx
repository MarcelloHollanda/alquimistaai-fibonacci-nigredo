import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Meh, AlertCircle } from "lucide-react";

interface SentimentAnalysis {
  sentimento: 'positivo' | 'neutro' | 'negativo';
  intensidade: number; // 0-100
  tom: 'animado' | 'irritado' | 'formal' | 'informal' | 'cauteloso' | 'empolgado';
  intencao: 'interesse' | 'duvida' | 'objecao' | 'reclamacao' | 'descadastro';
  contexto: string;
  palavras_chave: string[];
  recomendacao_resposta: string;
  nivel_prioridade: 'alta' | 'media' | 'baixa';
}

interface SentimentAnalysisPanelProps {
  analysis: SentimentAnalysis;
}

export function SentimentAnalysisPanel({ analysis }: SentimentAnalysisPanelProps) {
  const getSentimentoColor = () => {
    switch (analysis.sentimento) {
      case 'positivo': return 'text-green-600 dark:text-green-400';
      case 'negativo': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentoIcon = () => {
    switch (analysis.sentimento) {
      case 'positivo': return <TrendingUp className="h-8 w-8" />;
      case 'negativo': return <TrendingDown className="h-8 w-8" />;
      default: return <Meh className="h-8 w-8" />;
    }
  };

  const getTomBadge = () => {
    const colors: Record<string, string> = {
      'animado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'irritado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'formal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'informal': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'cauteloso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'empolgado': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };

    const emojis: Record<string, string> = {
      'animado': '🎉',
      'irritado': '😠',
      'formal': '👔',
      'informal': '😊',
      'cauteloso': '🤔',
      'empolgado': '🚀',
    };

    return (
      <Badge className={colors[analysis.tom]}>
        {emojis[analysis.tom]} {analysis.tom}
      </Badge>
    );
  };

  const getIntencaoColor = () => {
    const colors: Record<string, string> = {
      'interesse': 'bg-green-500',
      'duvida': 'bg-blue-500',
      'objecao': 'bg-orange-500',
      'reclamacao': 'bg-red-500',
      'descadastro': 'bg-red-700',
    };
    return colors[analysis.intencao] || 'bg-gray-500';
  };

  const getPrioridadeVariant = (): "default" | "destructive" | "secondary" => {
    switch (analysis.nivel_prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Análise de Sentimento IA
        </CardTitle>
        <CardDescription>
          Interpretação emocional e contextual da mensagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentimento Principal */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Sentimento Detectado</p>
            <div className={`flex items-center gap-2 ${getSentimentoColor()}`}>
              {getSentimentoIcon()}
              <span className="text-2xl font-bold capitalize">{analysis.sentimento}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Intensidade</p>
            <p className="text-3xl font-bold">{analysis.intensidade}%</p>
          </div>
        </div>

        {/* Barra de Intensidade */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Nível Emocional</span>
            <span className="font-medium">
              {analysis.intensidade < 30 ? 'Fraco' : analysis.intensidade < 70 ? 'Moderado' : 'Intenso'}
            </span>
          </div>
          <Progress value={analysis.intensidade} className="h-3" />
        </div>

        {/* Tom e Intenção */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tom da Mensagem</p>
            {getTomBadge()}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Intenção</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getIntencaoColor()}`} />
              <span className="text-sm font-medium capitalize">{analysis.intencao}</span>
            </div>
          </div>
        </div>

        {/* Contexto */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Contexto Interpretado</p>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{analysis.contexto}</p>
          </div>
        </div>

        {/* Palavras-chave */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Palavras-Chave Identificadas</p>
          <div className="flex flex-wrap gap-2">
            {analysis.palavras_chave.map((palavra, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {palavra}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recomendação */}
        <div className={`p-4 rounded-lg border-2 ${
          analysis.nivel_prioridade === 'alta' 
            ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            : analysis.nivel_prioridade === 'media'
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
            : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Recomendação de Resposta</p>
                <Badge variant={getPrioridadeVariant()}>
                  {analysis.nivel_prioridade}
                </Badge>
              </div>
              <p className="text-sm">{analysis.recomendacao_resposta}</p>
            </div>
          </div>
        </div>

        {/* Alertas Especiais */}
        {analysis.intencao === 'descadastro' && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm">
            <p className="font-medium text-red-700 dark:text-red-400">
              ⚠️ ALERTA LGPD: Lead solicitou descadastro. Interromper contato imediatamente.
            </p>
          </div>
        )}

        {analysis.sentimento === 'negativo' && analysis.intensidade > 70 && (
          <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded text-sm">
            <p className="font-medium text-orange-700 dark:text-orange-400">
              🔔 Lead demonstra irritação intensa. Ofereça atendimento humano ou saída respeitosa.
            </p>
          </div>
        )}

        {analysis.sentimento === 'positivo' && analysis.intencao === 'interesse' && (
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded text-sm">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Momento ideal! Lead engajado e interessado. Avançar para agendamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
