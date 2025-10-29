import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageSquare, Factory, ShoppingCart, Store, Phone } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  stage: string;
  variante: string;
  canal: string;
  template: string;
  risco: string;
}

interface SegmentTemplatesProps {
  segmento: string;
  setor: string;
}

const getSetorIcon = (setor: string) => {
  switch (setor.toLowerCase()) {
    case "indústria":
      return Factory;
    case "atacado":
      return ShoppingCart;
    case "varejo":
      return Store;
    default:
      return Store;
  }
};

export function SegmentedTemplates({ segmento, setor }: SegmentTemplatesProps) {
  const SetorIcon = getSetorIcon(setor);

  const templates: Template[] = [
    {
      id: "1",
      stage: "primeiro_contato",
      variante: "Abordagem Consultiva",
      canal: "whatsapp",
      template: `Olá! 👋

Sou [Seu Nome] da [Sua Empresa], especialista em soluções para o segmento de ${segmento}.

Notei que sua empresa atua no setor de ${setor} e identificamos uma oportunidade valiosa que pode otimizar seus processos e reduzir custos operacionais em até 30%.

Gostaria de agendar uma breve conversa de 15 minutos para apresentar como empresas similares à sua conseguiram resultados expressivos com nossas soluções?

📞 Retorne pelo WhatsApp: (11) 98765-4321
📧 Ou por e-mail: contato@suaempresa.com.br

Aguardo seu retorno!

Atenciosamente,
[Seu Nome]
[Cargo] | [Sua Empresa]`,
      risco: "baixo"
    },
    {
      id: "2",
      stage: "primeiro_contato",
      variante: "Abordagem Direta",
      canal: "email",
      template: `Assunto: Oportunidade Exclusiva para ${segmento} - ${setor}

Prezado(a) [Nome do Contato],

Espero que este e-mail encontre você bem.

Sou [Seu Nome], [Cargo] na [Sua Empresa], e trabalho exclusivamente com empresas do segmento de ${segmento} no setor de ${setor}.

Recentemente, ajudamos empresas similares à sua a alcançarem:
• Redução de 30% nos custos operacionais
• Aumento de 45% na eficiência dos processos
• ROI positivo em menos de 6 meses

Acredito que podemos gerar valor significativo para [Nome da Empresa] também.

Estaria disponível para uma breve conversa na próxima semana? Pode ser por telefone, videoconferência ou presencialmente, como preferir.

Para agendar ou esclarecer dúvidas:
📞 WhatsApp: (11) 98765-4321
📧 E-mail direto: contato@suaempresa.com.br

Aguardo seu retorno!

Atenciosamente,

[Seu Nome]
[Cargo]
[Sua Empresa]
(11) 98765-4321 | contato@suaempresa.com.br`,
      risco: "baixo"
    },
    {
      id: "3",
      stage: "follow_up",
      variante: "Segundo Contato",
      canal: "whatsapp",
      template: `Olá novamente! 👋

Sou [Seu Nome] da [Sua Empresa]. Enviei uma mensagem há alguns dias sobre oportunidades para empresas de ${segmento} no setor de ${setor}.

Entendo que sua agenda deve estar bastante movimentada, mas acredito genuinamente que nossa solução pode trazer benefícios significativos para [Nome da Empresa].

Separei um case de sucesso de uma empresa do mesmo segmento que alcançou resultados impressionantes em apenas 3 meses. Posso compartilhar com você?

Fica mais fácil por:
📞 WhatsApp: (11) 98765-4321
📧 E-mail: contato@suaempresa.com.br

Aguardo seu feedback!

[Seu Nome]
[Sua Empresa]`,
      risco: "medio"
    },
    {
      id: "4",
      stage: "qualificacao",
      variante: "Qualificação Técnica",
      canal: "email",
      template: `Assunto: Próximos Passos - Análise Personalizada para ${segmento}

Prezado(a) [Nome do Contato],

Que ótimo poder conversar com você!

Conforme alinhamos, vou preparar uma análise personalizada considerando as particularidades do segmento de ${segmento} no setor de ${setor}.

Para garantir que minha proposta seja a mais assertiva possível, preciso de algumas informações:

1. Qual o principal desafio operacional atualmente?
2. Existe orçamento aprovado para soluções nesta área?
3. Quem mais estará envolvido na decisão?
4. Qual o prazo ideal para implementação?

Podemos agendar uma call de 20 minutos para discutir esses pontos?

Meus contatos diretos:
📞 WhatsApp: (11) 98765-4321
📧 E-mail: contato@suaempresa.com.br

Fico à disposição!

Atenciosamente,

[Seu Nome]
[Cargo] | [Sua Empresa]
(11) 98765-4321`,
      risco: "baixo"
    },
    {
      id: "5",
      stage: "proposta",
      variante: "Apresentação de Proposta",
      canal: "email",
      template: `Assunto: Proposta Comercial - Solução Personalizada para ${segmento}

Prezado(a) [Nome do Contato],

Conforme acordado, segue em anexo nossa proposta comercial desenvolvida especialmente para [Nome da Empresa].

A solução foi desenhada considerando:
✓ Particularidades do segmento de ${segmento}
✓ Necessidades específicas do setor de ${setor}
✓ Desafios mencionados em nossas conversas
✓ Potencial de crescimento identificado

Destaques da proposta:
• ROI esperado: 6-8 meses
• Redução de custos: até 35%
• Aumento de eficiência: até 50%
• Suporte dedicado incluso

Fico à disposição para apresentar a proposta em detalhes e esclarecer qualquer dúvida.

Quando podemos agendar uma reunião para discutir?

Meus contatos:
📞 WhatsApp: (11) 98765-4321
📧 E-mail: contato@suaempresa.com.br

Aguardo seu retorno!

Cordialmente,

[Seu Nome]
[Cargo]
[Sua Empresa]
www.suaempresa.com.br
(11) 98765-4321`,
      risco: "baixo"
    },
    {
      id: "6",
      stage: "negociacao",
      variante: "Negociação de Contrato",
      canal: "whatsapp",
      template: `Olá [Nome]! 👋

Estou muito animado com a possibilidade de parceria entre [Sua Empresa] e [Nome da Empresa]!

Revisando nossa proposta para o segmento de ${segmento}, tenho flexibilidade para ajustar alguns pontos e garantir que seja o melhor fit para vocês.

Podemos conversar sobre:
• Condições de pagamento mais favoráveis
• Cronograma de implementação personalizado
• Serviços adicionais sem custo extra
• Garantias estendidas

Que tal uma call ainda hoje ou amanhã para finalizarmos os detalhes?

Me chame:
📞 WhatsApp: (11) 98765-4321
📧 contato@suaempresa.com.br

Vamos fechar esse negócio! 🤝

[Seu Nome]
[Sua Empresa]`,
      risco: "medio"
    }
  ];

  const handleCopy = (template: string) => {
    navigator.clipboard.writeText(template);
    toast.success("Template copiado para área de transferência!");
  };

  const stages = [
    { value: "primeiro_contato", label: "1º Contato" },
    { value: "follow_up", label: "Follow-up" },
    { value: "qualificacao", label: "Qualificação" },
    { value: "proposta", label: "Proposta" },
    { value: "negociacao", label: "Negociação" }
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <SetorIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Templates para {segmento}</CardTitle>
            <CardDescription>Setor: {setor} • Templates personalizados por estágio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="primeiro_contato" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {stages.map((stage) => (
              <TabsTrigger key={stage.value} value={stage.value} className="text-xs sm:text-sm">
                {stage.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {stages.map((stage) => {
            const stageTemplates = templates.filter((t) => t.stage === stage.value);
            return (
              <TabsContent key={stage.value} value={stage.value} className="space-y-4">
                {stageTemplates.map((template) => {
                  const Icon = template.canal === "whatsapp" ? MessageSquare : Mail;
                  return (
                    <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{template.variante}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Phone className="h-3 w-3" />
                              {template.canal}
                            </Badge>
                            <Badge
                              variant={
                                template.risco === "baixo"
                                  ? "default"
                                  : template.risco === "medio"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              Risco: {template.risco}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Personalizado para {segmento} - {setor}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-6 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {template.template}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCopy(template.template)}
                            variant="default"
                            size="sm"
                            className="flex-1"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Template
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Icon className="mr-2 h-4 w-4" />
                            Enviar via {template.canal}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
