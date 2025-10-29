import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestButton } from "@/components/config/TestButton";
import { apiRequest } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, MessageSquare, Shield, Users, Zap } from "lucide-react";

export default function IntegrationTests() {
  const testBackendHealth = async () => {
    try {
      const data = await apiRequest<{ status: string; timestamp: string }>('/health');
      return {
        success: data.status === 'ok',
        message: `Backend online! Status: ${data.status} | Timestamp: ${data.timestamp}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao conectar com backend',
      };
    }
  };

  const testWhatsAppStatus = async () => {
    try {
      const data = await apiRequest<{ connected: boolean; phone?: string }>('/api/whatsapp/status');
      return {
        success: data.connected,
        message: data.connected 
          ? `WhatsApp conectado: ${data.phone || 'N/A'}` 
          : 'WhatsApp desconectado',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao verificar WhatsApp',
      };
    }
  };

  const testLeadsAPI = async () => {
    try {
      const data = await apiRequest<any[]>('/api/leads');
      return {
        success: Array.isArray(data),
        message: `API de Leads OK! Total: ${data.length} leads encontrados`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar leads',
      };
    }
  };

  const testDNCList = async () => {
    try {
      const data = await apiRequest<any[]>('/api/dnc/list');
      return {
        success: Array.isArray(data),
        message: `API DNC OK! Total: ${data.length} contatos na lista`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar DNC',
      };
    }
  };

  const testInboundMessages = async () => {
    try {
      const data = await apiRequest<any[]>('/api/inbound/messages?limit=10');
      return {
        success: Array.isArray(data),
        message: `API de Mensagens OK! ${data.length} mensagens recentes`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar mensagens',
      };
    }
  };

  const testInboundSummary = async () => {
    try {
      const data = await apiRequest<{ total_mensagens: number; ultimas_24h: number }>('/api/inbound/summary');
      return {
        success: true,
        message: `Resumo OK! Total: ${data.total_mensagens} | 24h: ${data.ultimas_24h}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar resumo',
      };
    }
  };

  const testMetrics = async () => {
    try {
      const data = await apiRequest<any>('/metrics');
      return {
        success: true,
        message: 'Métricas Prometheus disponíveis',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar métricas',
      };
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Testes de Integração</h1>
        <p className="text-muted-foreground">
          Teste todas as integrações da API Replit em um só lugar
        </p>
      </div>

      <Tabs defaultValue="backend" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="backend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status do Backend
              </CardTitle>
              <CardDescription>
                Verifica se o backend Replit está online e respondendo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TestButton label="Testar Backend Health" onTest={testBackendHealth} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Métricas Prometheus
              </CardTitle>
              <CardDescription>
                Verifica disponibilidade das métricas de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestButton label="Testar Métricas" onTest={testMetrics} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Status WhatsApp
              </CardTitle>
              <CardDescription>
                Verifica conexão e status do WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestButton label="Testar WhatsApp Status" onTest={testWhatsAppStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens Inbound
              </CardTitle>
              <CardDescription>
                Testa API de mensagens recebidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TestButton label="Testar Mensagens" onTest={testInboundMessages} />
              <TestButton label="Testar Resumo" onTest={testInboundSummary} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                API de Leads
              </CardTitle>
              <CardDescription>
                Testa busca e listagem de leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestButton label="Testar API Leads" onTest={testLeadsAPI} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Lista DNC
              </CardTitle>
              <CardDescription>
                Testa API de lista "Não Contactar"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestButton label="Testar DNC List" onTest={testDNCList} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informações da Integração
              </CardTitle>
              <CardDescription>
                Configuração atual da API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">
                  <strong>URL Base:</strong> {import.meta.env.VITE_API_URL || 'https://middleware-c-3-C3Comercial.replit.app'}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono">
                  <strong>Tenant:</strong> {import.meta.env.VITE_TENANT_KEY || 'demo'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
