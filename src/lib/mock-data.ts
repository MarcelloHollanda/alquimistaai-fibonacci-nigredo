// Mock data para modo simulado quando API não estiver disponível

export const mockPrometheusMetrics = `
# HELP event_total Total events processed
# TYPE event_total counter
event_total{event_type="lead_received"} 1523
event_total{event_type="lead_processed"} 1498
event_total{event_type="estrategia_criada"} 45
event_total{event_type="aprovacao_submetida"} 42
event_total{event_type="disparo_executado"} 38

# HELP inbound_total Inbound messages by channel
# TYPE inbound_total counter
inbound_total{canal="whatsapp"} 892
inbound_total{canal="email"} 347

# HELP disparo_total Dispatches by channel and status
# TYPE disparo_total counter
disparo_total{canal="whatsapp",status="ok"} 756
disparo_total{canal="whatsapp",status="fail"} 23
disparo_total{canal="email",status="ok"} 298
disparo_total{canal="email",status="fail"} 12

# HELP agendamento_proposta_total Scheduling proposals
# TYPE agendamento_proposta_total counter
agendamento_proposta_total{canal="whatsapp"} 145
agendamento_proposta_total{canal="email"} 62

# HELP agendamento_confirmado_total Confirmed schedules
# TYPE agendamento_confirmado_total counter
agendamento_confirmado_total{canal="whatsapp"} 98
agendamento_confirmado_total{canal="email"} 41

# HELP agendamento_falha_total Schedule failures
# TYPE agendamento_falha_total counter
agendamento_falha_total{fase="proposta",erro="timeout"} 12
agendamento_falha_total{fase="proposta",erro="invalid_slot"} 8
agendamento_falha_total{fase="confirmacao",erro="calendar_unavailable"} 5
agendamento_falha_total{fase="confirmacao",erro="lead_no_response"} 7
agendamento_falha_total{fase="envio",erro="email_bounce"} 3

# HELP latency_ms Request latency in milliseconds
# TYPE latency_ms histogram
latency_ms_bucket{le="10"} 234
latency_ms_bucket{le="25"} 567
latency_ms_bucket{le="50"} 1234
latency_ms_bucket{le="100"} 2345
latency_ms_bucket{le="250"} 2789
latency_ms_bucket{le="500"} 2890
latency_ms_bucket{le="1000"} 2945
latency_ms_bucket{le="+Inf"} 3000
latency_ms_sum 125678
latency_ms_count 3000
`;

export interface Lote {
  id: string;
  nome: string;
  total: number;
  validos: number;
  duplicados: number;
  invalidos: number;
  criado_em: string;
  criado_por: string;
  status: "processando" | "concluido" | "erro";
}

export const mockLotes: Lote[] = [
  {
    id: "lote-001",
    nome: "Campanha Q1 2025 - Tecnologia",
    total: 500,
    validos: 478,
    duplicados: 12,
    invalidos: 10,
    criado_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    criado_por: "gestor@empresa.com",
    status: "concluido",
  },
  {
    id: "lote-002",
    nome: "Prospecção Varejo SP",
    total: 320,
    validos: 305,
    duplicados: 8,
    invalidos: 7,
    criado_em: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    criado_por: "operador@empresa.com",
    status: "concluido",
  },
];

export interface Template {
  id: string;
  stage: "TOPO" | "MEIO" | "FUNDO";
  variante: string;
  canal: "whatsapp" | "email";
  template: string;
  risco: "baixo" | "medio" | "alto";
}

export const mockTemplates: Template[] = [
  {
    id: "tpl-001",
    stage: "TOPO",
    variante: "A",
    canal: "whatsapp",
    template: "Olá {{nome_fantasia}}, tudo bem? Sou {{agente}} da {{empresa}}. Percebi que você atua em {{cnae}} e gostaria de apresentar uma solução que pode ajudar no crescimento do seu negócio. Podemos conversar?",
    risco: "baixo",
  },
  {
    id: "tpl-002",
    stage: "TOPO",
    variante: "B",
    canal: "email",
    template: "Prezado(a) {{razao_social}},\n\nMeu nome é {{agente}} e represento a {{empresa}}. Identificamos que sua empresa em {{cidade}}/{{uf}} pode se beneficiar de nossas soluções para o setor de {{cnae}}.\n\nPodemos agendar uma conversa rápida?",
    risco: "baixo",
  },
  {
    id: "tpl-003",
    stage: "MEIO",
    variante: "A",
    canal: "whatsapp",
    template: "Oi {{nome_fantasia}}, tudo certo? Gostaria de retomar nossa conversa sobre como podemos ajudar seu negócio. Consegue um tempinho essa semana?",
    risco: "medio",
  },
  {
    id: "tpl-004",
    stage: "FUNDO",
    variante: "A",
    canal: "whatsapp",
    template: "{{nome_fantasia}}, tenho 2 horários disponíveis para nossa reunião: {{horario_1}} ou {{horario_2}}. Qual funciona melhor para você?",
    risco: "baixo",
  },
];

export interface Approval {
  id: string;
  tipo: "estrategia" | "disparo";
  referencia_id: string;
  titulo: string;
  descricao?: string;
  status: "em_revisao" | "ajustes" | "aprovado" | "reprovado";
  criado_por: string;
  criado_em: string;
  required_quorum: number;
  aprovacoes: number;
  historico: Array<{
    usuario: string;
    acao: string;
    nota?: string;
    timestamp: string;
  }>;
}

export const mockApprovals: Approval[] = [
  {
    id: "apr-001",
    tipo: "estrategia",
    referencia_id: "est-001",
    titulo: "Estratégia TOPO para Lote 001",
    descricao: "Aprovação de templates iniciais para campanha Q1",
    status: "em_revisao",
    criado_por: "gestor@empresa.com",
    criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    required_quorum: 1,
    aprovacoes: 0,
    historico: [],
  },
  {
    id: "apr-002",
    tipo: "disparo",
    referencia_id: "dis-001",
    titulo: "Disparo WhatsApp - Varejo SP",
    status: "aprovado",
    criado_por: "operador@empresa.com",
    criado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    required_quorum: 1,
    aprovacoes: 1,
    historico: [
      {
        usuario: "admin@empresa.com",
        acao: "aprovar",
        nota: "Templates validados, pode prosseguir",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export interface Conversa {
  id: string;
  lead_id: string;
  lead: string;
  canal: "whatsapp" | "email";
  ultima_mensagem: string;
  data: string;
  intencao?: "alta" | "media" | "baixa";
  sentimento?: "positivo" | "neutro" | "negativo";
  nao_lida: boolean;
  historico?: Array<{
    tipo: "recebido" | "enviado";
    texto: string;
    data: string;
  }>;
}

export const mockConversas: Conversa[] = [
  {
    id: "conv-001",
    lead_id: "lead-001",
    lead: "Tech Solutions Ltda",
    canal: "whatsapp",
    ultima_mensagem: "Sim, tenho interesse. Pode me passar mais informações?",
    data: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    intencao: "alta",
    sentimento: "positivo",
    nao_lida: true,
    historico: [
      {
        tipo: "enviado",
        texto: "Olá! Somos especialistas em soluções tecnológicas. Gostaria de conhecer?",
        data: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString("pt-BR"),
      },
      {
        tipo: "recebido",
        texto: "Sim, tenho interesse. Pode me passar mais informações?",
        data: new Date(Date.now() - 15 * 60 * 1000).toLocaleString("pt-BR"),
      },
    ],
  },
  {
    id: "conv-002",
    lead_id: "lead-002",
    lead: "Varejo SP Comércio",
    canal: "email",
    ultima_mensagem: "Obrigado pelo contato, mas no momento não temos interesse.",
    data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    intencao: "baixa",
    sentimento: "negativo",
    nao_lida: false,
  },
];

export interface Agendamento {
  id: string;
  lead: string;
  canal: "whatsapp" | "email";
  status: "proposto" | "confirmado" | "falha";
  horario_proposto_1?: string;
  horario_proposto_2?: string;
  horario_confirmado?: string;
  criado_em: string;
  atualizado_em: string;
}

export const mockAgendamentos: Agendamento[] = [
  {
    id: "agd-001",
    lead: "Tech Solutions Ltda",
    canal: "whatsapp",
    status: "confirmado",
    horario_proposto_1: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    horario_proposto_2: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    horario_confirmado: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    criado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agd-002",
    lead: "Indústria ABC",
    canal: "email",
    status: "proposto",
    horario_proposto_1: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    horario_proposto_2: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    criado_em: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "agd-003",
    lead: "Comércio XYZ",
    canal: "whatsapp",
    status: "falha",
    horario_proposto_1: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    criado_em: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];
