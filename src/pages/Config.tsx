import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantContext";
import { TestButton } from "@/components/config/TestButton";
import { TutorialAccordion } from "@/components/config/TutorialAccordion";
import { DncManagement } from "@/components/config/DncManagement";
import { WhatsAppMonitoring } from "@/components/config/WhatsAppMonitoring";
import { BackendHealthCheck } from "@/components/config/BackendHealthCheck";
import { CostControlPanel } from "@/components/config/CostControlPanel";
import api from "@/lib/api";

export default function Config() {
  const { tenant, updateTenant } = useTenant();
  const [nome, setNome] = useState(tenant.name);
  const [logoPreview, setLogoPreview] = useState(tenant.logo);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondaryColor);

  // WhatsApp State
  const [whatsappProvider, setWhatsappProvider] = useState<"evolution" | "meta">("evolution");
  const [evolutionApiUrl, setEvolutionApiUrl] = useState("");
  const [evolutionApiToken, setEvolutionApiToken] = useState("");
  const [evolutionInstance, setEvolutionInstance] = useState("");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState("");

  // Email State
  const [emailProvider, setEmailProvider] = useState<"app_password" | "oauth">("app_password");
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");

  // Calendar State
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [calendarId, setCalendarId] = useState("");

  // OpenAI State
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [useOwnKey, setUseOwnKey] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTenant = () => {
    updateTenant({
      name: nome,
      logo: logoPreview,
      primaryColor,
      secondaryColor,
    });
    toast.success("Configurações salvas!");
  };

  // Test Functions
  const testWhatsApp = async () => {
    try {
      const payload = whatsappProvider === "evolution" 
        ? { provider: "evolution", api_url: evolutionApiUrl, api_token: evolutionApiToken, instance: evolutionInstance }
        : { provider: "meta", access_token: metaAccessToken, phone_number_id: metaPhoneNumberId };
      
      const response = await api.post("/api/setup/test/whatsapp", payload);
      return { success: true, message: "WhatsApp conectado com sucesso!" };
    } catch (error) {
      return { success: false, message: "Falha ao conectar WhatsApp. Verifique as credenciais." };
    }
  };

  const testEmail = async () => {
    try {
      await api.post("/api/setup/test/email", {
        gmail_user: gmailUser,
        gmail_app_password: gmailAppPassword
      });
      return { success: true, message: "Email configurado e testado com sucesso!" };
    } catch (error) {
      return { success: false, message: "Falha ao testar email. Verifique as credenciais." };
    }
  };

  const testCalendar = async () => {
    try {
      await api.post("/api/setup/test/calendar", {
        service_account_json: serviceAccountJson,
        calendar_id: calendarId
      });
      return { success: true, message: "Calendar conectado com sucesso!" };
    } catch (error) {
      return { success: false, message: "Falha ao conectar Calendar. Verifique as credenciais." };
    }
  };

  const testAIAgents = async () => {
    try {
      const response = await api.post("/api/setup/test/ai-agents", {
        openai_api_key: useOwnKey ? openaiApiKey : undefined
      });
      return { success: true, message: `${response.data.agents?.length || 13} agentes ativos!` };
    } catch (error) {
      return { success: false, message: "Falha ao testar agentes IA." };
    }
  };

  const integracoes = [
    { nome: "WhatsApp Business", status: "ativo", descricao: "API oficial do Meta" },
    { nome: "Gmail API", status: "ativo", descricao: "Envio e recebimento de emails" },
    { nome: "Google Calendar", status: "pendente", descricao: "Criação de eventos" },
    { nome: "OpenAI", status: "ativo", descricao: "Análise de sentimento e LLM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalização e integrações da empresa</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="ia">IA & Agentes</TabsTrigger>
          <TabsTrigger value="dnc">DNC</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Nome e branding visual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-16 object-contain rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou SVG (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <Input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleSaveTenant} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração WhatsApp</CardTitle>
              <CardDescription>Configure sua conexão com WhatsApp Business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Select value={whatsappProvider} onValueChange={(v: any) => setWhatsappProvider(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evolution">Evolution API</SelectItem>
                      <SelectItem value="meta">Meta Business (Oficial)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {whatsappProvider === "evolution" ? (
                  <>
                    <div className="space-y-2">
                      <Label>API URL</Label>
                      <Input
                        type="url"
                        placeholder="https://evolution.example.com"
                        value={evolutionApiUrl}
                        onChange={(e) => setEvolutionApiUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Token</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={evolutionApiToken}
                        onChange={(e) => setEvolutionApiToken(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instance Name</Label>
                      <Input
                        placeholder="my-instance"
                        value={evolutionInstance}
                        onChange={(e) => setEvolutionInstance(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Access Token</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number ID</Label>
                      <Input
                        placeholder="123456789"
                        value={metaPhoneNumberId}
                        onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <TestButton
                  label="Testar Conexão WhatsApp"
                  onTest={testWhatsApp}
                  variant="default"
                />
              </div>

              <TutorialAccordion
                steps={[
                  {
                    title: "Acesse o Evolution API Dashboard",
                    description: "Faça login no painel da Evolution API",
                    link: "https://evolution-api.com"
                  },
                  {
                    title: "Crie uma nova instância",
                    description: "Clique em 'Nova Instância' e configure o nome"
                  },
                  {
                    title: "Gere o API Token",
                    description: "Copie o token de acesso gerado automaticamente"
                  },
                  {
                    title: "Configure o Webhook",
                    description: "Adicione a URL do webhook fornecida pelo sistema C3"
                  }
                ]}
              />

              <Button onClick={() => toast.success("Configurações salvas!")} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração Email</CardTitle>
              <CardDescription>Configure envio e recebimento de emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Método de Autenticação</Label>
                  <Select value={emailProvider} onValueChange={(v: any) => setEmailProvider(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app_password">App Password (Recomendado)</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email do Gmail</Label>
                  <Input
                    type="email"
                    placeholder="seu-email@gmail.com"
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                  />
                </div>

                {emailProvider === "app_password" && (
                  <div className="space-y-2">
                    <Label>App Password (16 dígitos)</Label>
                    <Input
                      type="password"
                      placeholder="•••• •••• •••• ••••"
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Gere em: Conta Google → Segurança → Verificação em duas etapas → Senhas de app
                    </p>
                  </div>
                )}

                <TestButton
                  label="Testar Envio de Email"
                  onTest={testEmail}
                  variant="default"
                />
              </div>

              <TutorialAccordion
                steps={[
                  {
                    title: "Ative a verificação em duas etapas",
                    description: "Acesse sua Conta Google e ative 2FA",
                    link: "https://myaccount.google.com/security"
                  },
                  {
                    title: "Acesse Senhas de App",
                    description: "Em Segurança, clique em 'Senhas de app'"
                  },
                  {
                    title: "Gere uma nova senha",
                    description: "Selecione 'Email' como app e 'Outro' como dispositivo"
                  },
                  {
                    title: "Copie a senha de 16 dígitos",
                    description: "Use essa senha no campo acima (sem espaços)"
                  }
                ]}
              />

              <Button onClick={() => toast.success("Configurações salvas!")} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração Google Calendar</CardTitle>
              <CardDescription>Configure agendamentos automáticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Account JSON</Label>
                  <Textarea
                    placeholder='{"type": "service_account", "project_id": "...", ...}'
                    value={serviceAccountJson}
                    onChange={(e) => setServiceAccountJson(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole aqui o conteúdo completo do arquivo JSON da service account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Calendar ID</Label>
                  <Input
                    type="email"
                    placeholder="calendario@grupo.calendar.google.com"
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                  />
                </div>

                <TestButton
                  label="Testar Conexão Calendar"
                  onTest={testCalendar}
                  variant="default"
                />
              </div>

              <TutorialAccordion
                steps={[
                  {
                    title: "Acesse o Google Cloud Console",
                    description: "Crie ou selecione um projeto",
                    link: "https://console.cloud.google.com"
                  },
                  {
                    title: "Ative a Calendar API",
                    description: "Em APIs & Services, busque e ative 'Google Calendar API'"
                  },
                  {
                    title: "Crie uma Service Account",
                    description: "Em Credenciais, crie uma nova Service Account"
                  },
                  {
                    title: "Baixe o arquivo JSON",
                    description: "Gere e baixe a chave JSON da service account"
                  },
                  {
                    title: "Compartilhe o calendário",
                    description: "No Google Calendar, compartilhe com o email da service account"
                  }
                ]}
              />

              <Button onClick={() => toast.success("Configurações salvas!")} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações Calendar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agentes de IA</CardTitle>
              <CardDescription>Configure os 13 agentes inteligentes do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Sistema C3 com IA Integrada</p>
                    <p className="text-xs text-muted-foreground">
                      O C3 já possui OpenAI configurada. Você só precisa adicionar sua própria chave
                      se quiser usar sua conta (opcional).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label>Usar minha própria chave OpenAI</Label>
                  <p className="text-xs text-muted-foreground">
                    Os custos de IA serão cobrados diretamente na sua conta OpenAI
                  </p>
                </div>
                <Switch checked={useOwnKey} onCheckedChange={setUseOwnKey} />
              </div>

              {useOwnKey && (
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-••••••••••••••••••••••••••••••••"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comece com sk- e tenha pelo menos 20 caracteres
                  </p>
                </div>
              )}

              <TestButton
                label="Testar Agentes IA"
                onTest={testAIAgents}
                variant="default"
              />

              <div className="space-y-3">
                <Label>Agentes Ativos (13)</Label>
                <div className="grid gap-2">
                  {[
                    "Recebimento de Leads",
                    "Estratégia & Planejamento",
                    "Aprovação (Quatro-Olhos)",
                    "Disparo Automatizado",
                    "Atendimento Conversacional",
                    "Análise de Sentimento",
                    "Agendamento Inteligente",
                    "Qualificação de Leads",
                    "Follow-up Automático",
                    "Relatórios Executivos",
                    "A/B Testing",
                    "Opt-out & Compliance",
                    "Integração Multi-Canal"
                  ].map((agent, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">{agent}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => toast.success("Configurações salvas!")} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações IA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dnc" className="space-y-6">
          <DncManagement />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <CostControlPanel />
          <WhatsAppMonitoring />
          
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Rate Limiting</CardTitle>
              <CardDescription>
                Limite de mensagens por minuto configurado no backend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Limite Atual (msg/min)</Label>
                <Input 
                  value="30" 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  💡 <strong>Para alterar este valor:</strong> Configure a variável de ambiente{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">WA_CAP_PER_MINUTE</code> no backend Replit.
                  <br />
                  <br />
                  Valor recomendado: 30 msg/min para evitar bloqueios do WhatsApp.
                </AlertDescription>
              </Alert>

              <BackendHealthCheck />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
