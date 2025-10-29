import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface TermTooltipProps {
  term: string;
  children?: ReactNode;
  showIcon?: boolean;
}

// Dicionário de termos técnicos com explicações em português
const termDefinitions: Record<string, string> = {
  // Métricas e KPIs
  "ABM": "Account-Based Marketing - Estratégia focada em contas específicas de alto valor, tratando cada empresa como um mercado único. Leads ABM recebem abordagem personalizada e multi-touch.",
  "A/B": "Teste A/B - Método de comparar duas versões (A e B) de uma mensagem, template ou estratégia para determinar qual performa melhor. O sistema escolhe automaticamente o vencedor.",
  "ROI": "Return on Investment (Retorno sobre Investimento) - Métrica que mede o lucro obtido em relação ao valor investido. ROI positivo indica campanha lucrativa.",
  "ICP": "Ideal Customer Profile (Perfil de Cliente Ideal) - Descrição do tipo de empresa/lead que tem maior probabilidade de se tornar cliente e gerar valor. Usado para qualificação.",
  "SLA": "Service Level Agreement (Acordo de Nível de Serviço) - Tempo máximo esperado para conclusão de uma tarefa. Ex: SLA < 2s significa que a operação deve completar em menos de 2 segundos.",
  "P50": "Percentil 50 (Mediana) - Valor onde 50% das medições ficam abaixo. Indica performance típica do sistema. Ideal: < 200ms para boa responsividade.",
  "P95": "Percentil 95 - Valor onde 95% das medições ficam abaixo. Usado como garantia de qualidade (SLA). Ideal: < 1000ms para experiência consistente.",
  
  // Processos e Estratégias
  "Inbound": "Mensagens recebidas (entrada) - Respostas de leads às suas mensagens de prospecção. Alto volume indica engajamento e interesse dos leads.",
  "Outbound": "Mensagens enviadas (saída) - Disparos de prospecção ativa feitos pela operação. Compare com inbound para avaliar taxa de resposta.",
  "Pipeline": "Funil de vendas - Visualização das etapas que um lead percorre desde o primeiro contato até se tornar cliente. Permite identificar gargalos.",
  "Framework": "Estrutura de comunicação - Modelo testado de estrutura de mensagem (ex: AIDA = Atenção, Interesse, Desejo, Ação). Orienta como construir mensagens eficazes.",
  "Template": "Modelo de mensagem - Texto pré-definido com variáveis personalizáveis. Permite escala mantendo personalização através de merge tags como {{nome}}.",
  "Touch": "Ponto de contato - Cada interação com o lead (email, WhatsApp, ligação). Sequências multi-touch aumentam taxa de conversão através de múltiplas tentativas.",
  
  // Qualificação e Análise
  "Score": "Pontuação de qualificação - Nota de 0-100 que indica qualidade/prioridade de um lead. Calculada com base em fit comercial, engajamento e intenção de compra.",
  "Fit": "Fit Comercial (Adequação) - Quão bem o lead se encaixa no seu ICP. Categorias A (excelente), B (bom), C (regular), D (baixo). Quanto melhor o fit, maior a chance de conversão.",
  "Match": "Correspondência - Grau de alinhamento entre características do lead e critérios do ICP. Alto match indica lead prioritário para abordagem.",
  "Engagement": "Engajamento - Nível de interação do lead com suas mensagens (abriu, respondeu, clicou). Alto engajamento sinaliza interesse genuíno.",
  "Briefing": "Resumo executivo - Compilação de informações essenciais sobre o lead para preparação de reunião. Inclui fit, histórico, sentimento e recomendações.",
  
  // Sistema e Tecnologia
  "Dashboard": "Painel de controle - Interface visual que consolida métricas e KPIs em tempo real, permitindo monitoramento rápido da operação.",
  "API": "Application Programming Interface - Interface que permite integração entre sistemas diferentes. Usada para conectar WhatsApp, CRM, calendários, etc.",
  "Webhook": "Gancho web - URL que recebe notificações automáticas quando eventos ocorrem. Ex: webhook recebe alerta quando lead responde mensagem.",
  "Token": "Chave de autenticação - Código secreto usado para autenticar e autorizar acesso a APIs e serviços externos de forma segura.",
  "Rate Limit": "Limite de taxa - Restrição de quantas requisições podem ser feitas por período. Ex: 30 msg/min evita bloqueio de WhatsApp por spam.",
  "Fallback": "Plano B - Ação alternativa executada quando a operação principal falha. Ex: usar dados mock quando API está offline.",
};

export function TermTooltip({ term, children, showIcon = true }: TermTooltipProps) {
  const definition = termDefinitions[term];
  
  if (!definition) {
    // Se o termo não está no dicionário, retorna apenas o children sem tooltip
    return <>{children || term}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground">
            {children || term}
            {showIcon && <Info className="h-3 w-3 text-muted-foreground" />}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs">
            <strong>{term}:</strong> {definition}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
