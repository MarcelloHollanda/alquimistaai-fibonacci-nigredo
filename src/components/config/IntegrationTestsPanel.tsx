import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestButton } from "@/components/config/TestButton";
import { apiRequest } from "@/lib/api";
import { Activity, Database, MessageSquare, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function IntegrationTestsPanel() {
  const testBackendHealth = async () => {
    try {
      const data = await apiRequest<{ status: string; timestamp: string }>('/health');
      return {
        success: data.status === 'ok',
        message: `Backend online! Status: ${data.status}`,
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
        message: `API de Leads OK! Total: ${data.length} leads`,
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
        message: `API DNC OK! ${data.length} contatos na lista`,
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
        message: `API OK! ${data.length} mensagens recentes`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar mensagens',
      };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Backend Health
          </CardTitle>
          <CardDescription>Status do backend Replit</CardDescription>
        </CardHeader>
        <CardContent>
          <TestButton label="Testar Conexão" onTest={testBackendHealth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Status
          </CardTitle>
          <CardDescription>Conexão WhatsApp Business</CardDescription>
        </CardHeader>
        <CardContent>
          <TestButton label="Verificar Status" onTest={testWhatsAppStatus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            API de Leads
          </CardTitle>
          <CardDescription>Busca e listagem de leads</CardDescription>
        </CardHeader>
        <CardContent>
          <TestButton label="Testar Leads API" onTest={testLeadsAPI} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Lista DNC
          </CardTitle>
          <CardDescription>API de lista "Não Contactar"</CardDescription>
        </CardHeader>
        <CardContent>
          <TestButton label="Testar DNC" onTest={testDNCList} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Inbound
          </CardTitle>
          <CardDescription>Mensagens recebidas via WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <TestButton label="Testar Inbound" onTest={testInboundMessages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração
          </CardTitle>
          <CardDescription>Informações da API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-mono break-all">
              <strong>URL:</strong> {import.meta.env.VITE_API_URL || 'https://middleware-c-3-C3Comercial.replit.app'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open('/integration-tests', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Painel Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
