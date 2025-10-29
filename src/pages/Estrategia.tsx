import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { mockLotes, mockTemplates } from "@/lib/mock-data";
import { TemplateCard } from "@/components/estrategia/TemplateCard";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { LeadProfilePanel } from "@/components/estrategia/LeadProfilePanel";
import { ABTestManager } from "@/components/estrategia/ABTestManager";
import { ABMPanel } from "@/components/estrategia/ABMPanel";
import { CampaignPlanner } from "@/components/estrategia/CampaignPlanner";
import { StrategyMetricsPanel } from "@/components/estrategia/StrategyMetricsPanel";
import { StrategicBatchesPanel } from "@/components/estrategia/StrategicBatchesPanel";
import { StrategicBatchTables } from "@/components/estrategia/StrategicBatchTables";
import { SegmentedTemplates } from "@/components/estrategia/SegmentedTemplates";
import { TermTooltip } from "@/components/ui/term-tooltip";
import type { LeadProfile, ABTest, ABMAccount, CampaignPlanning, StrategyMetrics } from "@/types/strategy";

export default function Estrategia() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedLote, setSelectedLote] = useState(searchParams.get("lote_id") || "");
  const [estrategiaId, setEstrategiaId] = useState<string | null>(null);

  const { data: lotes = mockLotes } = useQuery({
    queryKey: ["lotes"],
    queryFn: async () => {
      const { data } = await api.get("/lotes");
      return data;
    },
  });

  const { data: templates = mockTemplates } = useQuery({
    queryKey: ["templates", estrategiaId],
    queryFn: async () => {
      const { data } = await api.get(`/mensagens_modelo?estrategia_id=${estrategiaId}`);
      return data;
    },
    enabled: !!estrategiaId,
  });

  const planMutation = useMutation({
    mutationFn: async (loteId: string) => {
      const { data } = await api.post("/plan/lote", { lote_id: loteId });
      return data;
    },
    onSuccess: (data) => {
      setEstrategiaId(data.estrategia_id);
      toast.success("Estratégia gerada com sucesso!");
    },
    onError: () => {
      setEstrategiaId("estrategia-mock-" + Date.now());
      toast.info("Estratégia simulada - API ausente");
    },
  });

  const submitApprovalMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/approvals/submit", {
        tipo: "estrategia",
        referencia_id: estrategiaId,
        titulo: `Estratégia para Lote ${selectedLote}`,
        descricao: "Templates TOPO/MEIO/FUNDO gerados",
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Enviado para aprovação!");
      navigate("/aprovacoes");
    },
    onError: () => {
      toast.info("Aprovação simulada - redirecionando...");
      setTimeout(() => navigate("/aprovacoes"), 1000);
    },
  });

  const handlePlanLote = () => {
    if (selectedLote) {
      planMutation.mutate(selectedLote);
    }
  };

  const handleSubmitApproval = () => {
    submitApprovalMutation.mutate();
  };

  const topoTemplates = templates.filter((t) => t.stage === "TOPO");
  const meioTemplates = templates.filter((t) => t.stage === "MEIO");
  const fundoTemplates = templates.filter((t) => t.stage === "FUNDO");

  // Mock data para demonstração das novas funcionalidades
  const mockProfiles: LeadProfile[] = [
    {
      lead_id: "1",
      razao_social: "TechCorp Solutions LTDA",
      faturamento_estimado: 15.5,
      porte: "GRANDE",
      socios: ["João Silva", "Maria Santos"],
      maturidade_mercado: 12,
      valor_comercial: "PREMIUM",
      historico_comercial: { interacoes_anteriores: 3, taxa_resposta: 0.8 }
    },
    {
      lead_id: "2",
      razao_social: "InnovaTech Brasil S.A.",
      faturamento_estimado: 8.2,
      porte: "MEDIO",
      socios: ["Pedro Costa"],
      maturidade_mercado: 5,
      valor_comercial: "ALTO"
    }
  ];

  const mockABTests: ABTest[] = [
    {
      id: "test-1",
      name: "Teste Abertura - Primeiro Contato",
      stage: "TOPO",
      sample_size: 100,
      created_at: new Date().toISOString(),
      variants: [
        {
          id: "v1",
          name: "Variante A - Formal",
          template: "Prezado {{nome}}, identificamos uma oportunidade...",
          status: "running",
          metrics: {
            sent: 50,
            opened: 35,
            replied: 12,
            open_rate: 70,
            reply_rate: 24
          }
        },
        {
          id: "v2",
          name: "Variante B - Casual",
          template: "Olá {{nome}}, tudo bem? Descobrimos algo que pode te interessar...",
          status: "running",
          metrics: {
            sent: 50,
            opened: 42,
            replied: 18,
            open_rate: 84,
            reply_rate: 36
          }
        }
      ]
    }
  ];

  const mockABMAccounts: ABMAccount[] = [
    {
      lead_id: "1",
      razao_social: "TechCorp Solutions LTDA",
      faturamento_estimado: 15.5,
      score_abm: 92,
      status: "strategy_created",
      custom_strategy: "Abordagem consultiva focada em transformação digital com cases do setor",
      assigned_to: "João Silva"
    },
    {
      lead_id: "3",
      razao_social: "MegaCorp Indústria S.A.",
      faturamento_estimado: 45.0,
      score_abm: 98,
      status: "identified"
    }
  ];

  const mockCampaignPlanning: CampaignPlanning = {
    estrategia_id: estrategiaId || "",
    lote_id: selectedLote,
    channel_strategy: {
      whatsapp_leads: 750,
      email_leads: 250,
      reasoning: "75% WhatsApp devido ao perfil B2B local e alta taxa de resposta histórica. 25% Email para leads corporativos de grande porte que preferem comunicação formal."
    },
    pacing_plan: {
      daily_limit: 200,
      hourly_distribution: [0,0,0,0,0,0,0,0,5,15,20,15,10,5,15,10,5,0,0,0,0,0,0,0],
      natural_delays: {
        min_seconds: 15,
        max_seconds: 45
      }
    },
    risk_analysis: {
      overall_score: 25,
      warnings: [],
      recommendations: [
        "Mantenha o ritmo atual de 200 mensagens/dia para evitar bloqueios",
        "Concentre disparos entre 9h-11h e 14h-16h para maior engajamento",
        "Evite mensagens após 18h para manter naturalidade"
      ]
    }
  };

  const mockMetrics: StrategyMetrics = {
    estrategia_id: estrategiaId || "",
    templates_sent: 1580,
    total_opened: 1106,
    total_replied: 474,
    avg_open_rate: 70.0,
    avg_reply_rate: 30.0,
    best_performing_stage: "MEIO",
    learnings: [
      "Mensagens enviadas entre 9h-11h têm 35% mais abertura",
      "Templates com personalização do setor aumentam resposta em 22%",
      "Variantes casuais performam 18% melhor em leads de porte MEI/ME",
      "Follow-up após 48h aumenta conversão em 15%"
    ]
  };

  const mockStrategicBatches = [
    {
      id: "lote-premium-tech",
      nome: "Tech Premium - Transformação Digital",
      setor: "Tecnologia",
      porte: "GRANDE" as const,
      valor_comercial: "PREMIUM" as const,
      total_leads: 45,
      faturamento_medio_estimado: 28.5,
      prioridade: 5,
      ramos_atuacao: [
        { nome: "Software e SaaS", total_leads: 18, percentual: 40 },
        { nome: "Consultoria TI", total_leads: 12, percentual: 26.7 },
        { nome: "Infraestrutura e Cloud", total_leads: 10, percentual: 22.2 },
        { nome: "Segurança da Informação", total_leads: 5, percentual: 11.1 }
      ]
    },
    {
      id: "lote-alto-industria",
      nome: "Indústria Alto Valor - Automação",
      setor: "Indústria",
      porte: "MEDIO" as const,
      valor_comercial: "ALTO" as const,
      total_leads: 120,
      faturamento_medio_estimado: 12.3,
      prioridade: 4,
      ramos_atuacao: [
        { nome: "Indústria Alimentícia", total_leads: 35, percentual: 29.2 },
        { nome: "Indústria Química", total_leads: 28, percentual: 23.3 },
        { nome: "Metalurgia e Siderurgia", total_leads: 25, percentual: 20.8 },
        { nome: "Indústria Têxtil", total_leads: 18, percentual: 15.0 },
        { nome: "Plásticos e Embalagens", total_leads: 14, percentual: 11.7 }
      ]
    },
    {
      id: "lote-medio-varejo",
      nome: "Varejo Médio - Gestão",
      setor: "Varejo",
      porte: "EPP" as const,
      valor_comercial: "MEDIO" as const,
      total_leads: 230,
      faturamento_medio_estimado: 4.8,
      prioridade: 3,
      ramos_atuacao: [
        { nome: "Supermercados e Mercearias", total_leads: 65, percentual: 28.3 },
        { nome: "Moda e Vestuário", total_leads: 52, percentual: 22.6 },
        { nome: "Farmácias e Drogarias", total_leads: 45, percentual: 19.6 },
        { nome: "Materiais de Construção", total_leads: 38, percentual: 16.5 },
        { nome: "Eletrônicos e Eletrodomésticos", total_leads: 30, percentual: 13.0 }
      ]
    },
    {
      id: "lote-servicos-alto",
      nome: "Serviços Alto Potencial",
      setor: "Serviços",
      porte: "MEDIO" as const,
      valor_comercial: "ALTO" as const,
      total_leads: 85,
      faturamento_medio_estimado: 9.2,
      prioridade: 4,
      ramos_atuacao: [
        { nome: "Consultoria Empresarial", total_leads: 25, percentual: 29.4 },
        { nome: "Contabilidade e Auditoria", total_leads: 20, percentual: 23.5 },
        { nome: "Marketing e Publicidade", total_leads: 18, percentual: 21.2 },
        { nome: "Serviços Jurídicos", total_leads: 12, percentual: 14.1 },
        { nome: "Engenharia e Arquitetura", total_leads: 10, percentual: 11.8 }
      ]
    },
    {
      id: "lote-atacado-medio",
      nome: "Atacado/Distribuição",
      setor: "Atacado",
      porte: "GRANDE" as const,
      valor_comercial: "ALTO" as const,
      total_leads: 67,
      faturamento_medio_estimado: 18.7,
      prioridade: 4,
      ramos_atuacao: [
        { nome: "Distribuição de Alimentos", total_leads: 22, percentual: 32.8 },
        { nome: "Distribuição Farmacêutica", total_leads: 18, percentual: 26.9 },
        { nome: "Atacado de Bebidas", total_leads: 15, percentual: 22.4 },
        { nome: "Distribuição de Produtos de Limpeza", total_leads: 12, percentual: 17.9 }
      ]
    },
    {
      id: "lote-pequeno-me",
      nome: "ME/MEI - Crescimento",
      setor: "Diversos",
      porte: "ME" as const,
      valor_comercial: "MEDIO" as const,
      total_leads: 453,
      faturamento_medio_estimado: 1.2,
      prioridade: 2,
      ramos_atuacao: [
        { nome: "Comércio Local", total_leads: 120, percentual: 26.5 },
        { nome: "Serviços Autônomos", total_leads: 95, percentual: 21.0 },
        { nome: "Alimentação e Restaurantes", total_leads: 85, percentual: 18.8 },
        { nome: "Beleza e Estética", total_leads: 68, percentual: 15.0 },
        { nome: "Manutenção e Reparos", total_leads: 52, percentual: 11.5 },
        { nome: "Outros", total_leads: 33, percentual: 7.2 }
      ]
    }
  ];

  // Mock data para tabelas detalhadas por segmento
  const mockBatchSegments = [
    {
      setor: "Tecnologia",
      total_leads: 45,
      leads: [
        {
          linha: 1,
          empresa: "CloudTech Sistemas Ltda",
          cnpj: "12.345.678/0001-90",
          ramo_atuacao: "Software e SaaS",
          porte: "GRANDE" as const,
          faturamento_estimado: 32.5,
          tempo_abertura_anos: 8,
          telefone: "(11) 98765-4321",
          email: "contato@cloudtech.com.br",
          valor_comercial: "PREMIUM" as const,
          prioridade: 5
        },
        {
          linha: 5,
          empresa: "DevSolutions Brasil S.A.",
          cnpj: "23.456.789/0001-01",
          ramo_atuacao: "Software e SaaS",
          porte: "GRANDE" as const,
          faturamento_estimado: 28.3,
          tempo_abertura_anos: 12,
          telefone: "(11) 3333-4444",
          email: "comercial@devsolutions.com.br",
          valor_comercial: "PREMIUM" as const,
          prioridade: 5
        },
        {
          linha: 12,
          empresa: "SecureIT Consultoria",
          cnpj: "34.567.890/0001-12",
          ramo_atuacao: "Segurança da Informação",
          porte: "MEDIO" as const,
          faturamento_estimado: 15.2,
          tempo_abertura_anos: 6,
          telefone: "(11) 99999-8888",
          email: "contato@secureit.com.br",
          valor_comercial: "ALTO" as const,
          prioridade: 4
        }
      ]
    },
    {
      setor: "Indústria",
      total_leads: 120,
      leads: [
        {
          linha: 2,
          empresa: "Metalúrgica Industrial ABC",
          cnpj: "45.678.901/0001-23",
          ramo_atuacao: "Metalurgia e Siderurgia",
          porte: "MEDIO" as const,
          faturamento_estimado: 12.8,
          tempo_abertura_anos: 25,
          telefone: "(19) 3456-7890",
          email: "vendas@metalurgicaabc.com.br",
          valor_comercial: "ALTO" as const,
          prioridade: 4
        },
        {
          linha: 8,
          empresa: "Alimentos Premium Ltda",
          cnpj: "56.789.012/0001-34",
          ramo_atuacao: "Indústria Alimentícia",
          porte: "MEDIO" as const,
          faturamento_estimado: 18.5,
          tempo_abertura_anos: 15,
          telefone: "(21) 2345-6789",
          email: "comercial@alimentospremium.com.br",
          valor_comercial: "ALTO" as const,
          prioridade: 4
        },
        {
          linha: 15,
          empresa: "Química Avançada S.A.",
          cnpj: "67.890.123/0001-45",
          ramo_atuacao: "Indústria Química",
          porte: "GRANDE" as const,
          faturamento_estimado: 45.2,
          tempo_abertura_anos: 30,
          telefone: "(13) 3333-5555",
          email: "contato@quimicaavancada.com.br",
          valor_comercial: "PREMIUM" as const,
          prioridade: 5
        }
      ]
    },
    {
      setor: "Varejo",
      total_leads: 230,
      leads: [
        {
          linha: 3,
          empresa: "Supermercado Bom Preço",
          cnpj: "78.901.234/0001-56",
          ramo_atuacao: "Supermercados e Mercearias",
          porte: "EPP" as const,
          faturamento_estimado: 6.5,
          tempo_abertura_anos: 10,
          telefone: "(85) 98888-7777",
          email: "gerencia@bompreco.com.br",
          valor_comercial: "MEDIO" as const,
          prioridade: 3
        },
        {
          linha: 10,
          empresa: "Moda & Estilo Boutique",
          cnpj: "89.012.345/0001-67",
          ramo_atuacao: "Moda e Vestuário",
          porte: "ME" as const,
          faturamento_estimado: 2.8,
          tempo_abertura_anos: 5,
          email: "contato@modaestilo.com.br",
          valor_comercial: "MEDIO" as const,
          prioridade: 2
        }
      ]
    },
    {
      setor: "Serviços",
      total_leads: 85,
      leads: [
        {
          linha: 4,
          empresa: "Consultoria Empresarial Master",
          cnpj: "90.123.456/0001-78",
          ramo_atuacao: "Consultoria Empresarial",
          porte: "MEDIO" as const,
          faturamento_estimado: 8.5,
          tempo_abertura_anos: 12,
          telefone: "(11) 3456-7890",
          email: "contato@consultoriamaster.com.br",
          valor_comercial: "ALTO" as const,
          prioridade: 4
        },
        {
          linha: 18,
          empresa: "Marketing Digital Pro",
          cnpj: "01.234.567/0001-89",
          ramo_atuacao: "Marketing e Publicidade",
          porte: "EPP" as const,
          faturamento_estimado: 5.2,
          tempo_abertura_anos: 7,
          telefone: "(11) 99999-1111",
          email: "contato@marketingpro.com.br",
          valor_comercial: "MEDIO" as const,
          prioridade: 3
        }
      ]
    },
    {
      setor: "Atacado",
      total_leads: 67,
      leads: [
        {
          linha: 6,
          empresa: "Distribuidora Nacional Alimentos",
          cnpj: "12.345.098/0001-90",
          ramo_atuacao: "Distribuição de Alimentos",
          porte: "GRANDE" as const,
          faturamento_estimado: 22.3,
          tempo_abertura_anos: 18,
          telefone: "(11) 2222-3333",
          email: "comercial@distribuidoranacional.com.br",
          valor_comercial: "ALTO" as const,
          prioridade: 4
        },
        {
          linha: 14,
          empresa: "Farma Distribuidora S.A.",
          cnpj: "23.456.109/0001-01",
          ramo_atuacao: "Distribuição Farmacêutica",
          porte: "GRANDE" as const,
          faturamento_estimado: 35.8,
          tempo_abertura_anos: 22,
          telefone: "(21) 3333-4444",
          email: "vendas@farmadist.com.br",
          valor_comercial: "PREMIUM" as const,
          prioridade: 5
        }
      ]
    },
    {
      setor: "Diversos",
      total_leads: 453,
      leads: [
        {
          linha: 7,
          empresa: "Cafeteria Aroma Ltda",
          cnpj: "34.567.210/0001-12",
          ramo_atuacao: "Alimentação e Restaurantes",
          porte: "ME" as const,
          faturamento_estimado: 1.5,
          tempo_abertura_anos: 3,
          telefone: "(11) 98888-9999",
          valor_comercial: "MEDIO" as const,
          prioridade: 2
        },
        {
          linha: 20,
          empresa: "Salão Beleza Total",
          cnpj: "45.678.321/0001-23",
          ramo_atuacao: "Beleza e Estética",
          porte: "ME" as const,
          faturamento_estimado: 0.8,
          tempo_abertura_anos: 4,
          telefone: "(85) 99999-8888",
          email: "contato@belezatotal.com.br",
          valor_comercial: "BAIXO" as const,
          prioridade: 1
        }
      ]
    }
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estratégia</h1>
        <p className="text-muted-foreground">Planejamento de campanhas por lote</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Lote</CardTitle>
          <CardDescription>Escolha um lote para gerar estratégia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedLote} onValueChange={setSelectedLote}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um lote" />
            </SelectTrigger>
            <SelectContent>
              {lotes.map((lote) => (
                <SelectItem key={lote.id} value={lote.id}>
                  {lote.nome} ({lote.leads_count} leads)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handlePlanLote}
            disabled={!selectedLote || planMutation.isPending}
            className="w-full"
          >
            {planMutation.isPending ? "Gerando..." : "Gerar Estratégia"}
          </Button>
        </CardContent>
      </Card>

      {estrategiaId && (
        <Tabs defaultValue="perfis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfis">Perfis e Lotes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="abm">ABM & Testes</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
          </TabsList>

          {/* ABA 1: Perfis e Lotes */}
          <TabsContent value="perfis" className="space-y-6">
            {/* Perfilamento Comercial */}
            <LeadProfilePanel profiles={mockProfiles} />

            {/* Lotes Estratégicos */}
            <StrategicBatchesPanel batches={mockStrategicBatches} />

            {/* Tabelas Detalhadas por Segmento */}
            <StrategicBatchTables segments={mockBatchSegments} />
          </TabsContent>

          {/* ABA 2: Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Templates Estratégicos</h2>
              <p className="text-muted-foreground">Templates personalizados por segmento e setor de atuação</p>
            </div>
            
            <Tabs defaultValue="tecnologia" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="tecnologia">Tecnologia</TabsTrigger>
                <TabsTrigger value="industria">Indústria</TabsTrigger>
                <TabsTrigger value="varejo">Varejo</TabsTrigger>
                <TabsTrigger value="servicos">Serviços</TabsTrigger>
                <TabsTrigger value="atacado">Atacado</TabsTrigger>
                <TabsTrigger value="diversos">Diversos</TabsTrigger>
              </TabsList>

              <TabsContent value="tecnologia" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Software e SaaS" setor="Tecnologia" />
                <SegmentedTemplates segmento="Consultoria TI" setor="Tecnologia" />
                <SegmentedTemplates segmento="Segurança da Informação" setor="Tecnologia" />
              </TabsContent>

              <TabsContent value="industria" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Indústria Alimentícia" setor="Indústria" />
                <SegmentedTemplates segmento="Indústria Química" setor="Indústria" />
                <SegmentedTemplates segmento="Metalurgia e Siderurgia" setor="Indústria" />
                <SegmentedTemplates segmento="Indústria Têxtil" setor="Indústria" />
                <SegmentedTemplates segmento="Plásticos e Embalagens" setor="Indústria" />
              </TabsContent>

              <TabsContent value="varejo" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Supermercados e Mercearias" setor="Varejo" />
                <SegmentedTemplates segmento="Moda e Vestuário" setor="Varejo" />
                <SegmentedTemplates segmento="Farmácias e Drogarias" setor="Varejo" />
                <SegmentedTemplates segmento="Materiais de Construção" setor="Varejo" />
                <SegmentedTemplates segmento="Eletrônicos e Eletrodomésticos" setor="Varejo" />
              </TabsContent>

              <TabsContent value="servicos" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Consultoria Empresarial" setor="Serviços" />
                <SegmentedTemplates segmento="Contabilidade e Auditoria" setor="Serviços" />
                <SegmentedTemplates segmento="Marketing e Publicidade" setor="Serviços" />
                <SegmentedTemplates segmento="Serviços Jurídicos" setor="Serviços" />
                <SegmentedTemplates segmento="Engenharia e Arquitetura" setor="Serviços" />
              </TabsContent>

              <TabsContent value="atacado" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Distribuição de Alimentos" setor="Atacado" />
                <SegmentedTemplates segmento="Distribuição Farmacêutica" setor="Atacado" />
                <SegmentedTemplates segmento="Atacado de Bebidas" setor="Atacado" />
                <SegmentedTemplates segmento="Distribuição de Produtos de Limpeza" setor="Atacado" />
              </TabsContent>

              <TabsContent value="diversos" className="space-y-4 mt-4">
                <SegmentedTemplates segmento="Comércio Local" setor="Diversos" />
                <SegmentedTemplates segmento="Alimentação e Restaurantes" setor="Diversos" />
                <SegmentedTemplates segmento="Beleza e Estética" setor="Diversos" />
                <SegmentedTemplates segmento="Serviços Autônomos" setor="Diversos" />
                <SegmentedTemplates segmento="Manutenção e Reparos" setor="Diversos" />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ABA 3: ABM & Testes */}
          <TabsContent value="abm" className="space-y-6">
            {/* ABM - Account Based Marketing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TermTooltip term="ABM" />
                </CardTitle>
                <CardDescription>
                  Estratégia personalizada para contas de alto valor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ABMPanel 
                  accounts={mockABMAccounts}
                  onCreateStrategy={(id) => toast.success(`Criando estratégia personalizada para conta ${id}`)}
                />
              </CardContent>
            </Card>

            {/* Planejamento de Campanha */}
            <CampaignPlanner planning={mockCampaignPlanning} />

            {/* Testes A/B */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Testes <TermTooltip term="A/B" />
                </CardTitle>
                <CardDescription>
                  Experimentos para otimização contínua de mensagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ABTestManager 
                  tests={mockABTests}
                  onCreateTest={() => toast.info("Criação de teste A/B em desenvolvimento")}
                  onStartTest={(id) => toast.success(`Iniciando teste ${id}`)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 4: Métricas */}
          <TabsContent value="metricas" className="space-y-6">
            {/* Aprendizado Contínuo */}
            <StrategyMetricsPanel metrics={mockMetrics} />

            {/* Editor de Templates Mustache */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Editor de Templates</h2>
              <TemplateEditor />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Templates por Estágio</CardTitle>
                <CardDescription>Personalize as mensagens para cada fase do funil</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="topo">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topo">
                      TOPO <Badge className="ml-2">{topoTemplates.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="meio">
                      MEIO <Badge className="ml-2">{meioTemplates.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="fundo">
                      FUNDO <Badge className="ml-2">{fundoTemplates.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="topo" className="space-y-4">
                    {topoTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </TabsContent>

                  <TabsContent value="meio" className="space-y-4">
                    {meioTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </TabsContent>

                  <TabsContent value="fundo" className="space-y-4">
                    {fundoTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar para Aprovação</CardTitle>
                <CardDescription>Submeter estratégia para revisão (quatro-olhos)</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSubmitApproval}
                  disabled={submitApprovalMutation.isPending}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitApprovalMutation.isPending ? "Enviando..." : "Enviar para Aprovação"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
