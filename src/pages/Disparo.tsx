import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, CheckCircle, XCircle, AlertCircle, Ban } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { mockApprovals, mockTemplates } from "@/lib/mock-data";
import { DispatchScheduler } from "@/components/disparo/DispatchScheduler";
import { LoteEfficiencyPanel } from "@/components/disparo/LoteEfficiencyPanel";
import { ResponseRoutingPanel } from "@/components/disparo/ResponseRoutingPanel";
import { HumanizationConfig } from "@/components/disparo/HumanizationConfig";

export default function Disparo() {
  const [selectedEstrategia, setSelectedEstrategia] = useState("");
  const [selectedCanal, setSelectedCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [checkIdentifier, setCheckIdentifier] = useState("");
  const [dncCheckResult, setDncCheckResult] = useState<{ blocked: boolean; reason?: string } | null>(null);

  const { data: estrategiasAprovadas = [] } = useQuery({
    queryKey: ["approvals", "aprovado"],
    queryFn: async () => {
      const { data } = await api.get("/approvals/queue?estado=aprovado&tipo=estrategia");
      return data;
    },
    initialData: mockApprovals.filter(
      (a) => a.tipo === "estrategia" && a.status === "aprovado"
    ),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", selectedEstrategia],
    queryFn: async () => {
      const { data } = await api.get(
        `/mensagens_modelo?estrategia_id=${selectedEstrategia}`
      );
      return data;
    },
    enabled: !!selectedEstrategia,
    initialData: mockTemplates,
  });

  const disparoMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/actions/disparo", {
        estrategia_id: selectedEstrategia,
        canal: selectedCanal,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Disparo iniciado com sucesso!");
    },
    onError: () => {
      toast.info("Disparo automatizado pelo worker");
    },
  });

  const handleDisparo = () => {
    disparoMutation.mutate();
  };

  const handleCheckDnc = async () => {
    if (!checkIdentifier.trim()) {
      toast.error("Digite um telefone ou email");
      return;
    }

    try {
      const response = await api.post("/api/dnc/check", {
        identifier: checkIdentifier,
      });
      setDncCheckResult(response.data);
      
      if (response.data.blocked) {
        toast.warning(`Bloqueado: ${response.data.reason}`);
      } else {
        toast.success("Não está bloqueado, pode enviar!");
      }
    } catch (error) {
      toast.error("Falha ao verificar DNC");
      setDncCheckResult(null);
    }
  };

  const filteredTemplates = templates.filter((t) => t.canal === selectedCanal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disparo</h1>
        <p className="text-muted-foreground">Dispatcher humanizado com follow-ups e roteamento inteligente</p>
      </div>

      <Tabs defaultValue="disparo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="disparo">Disparo</TabsTrigger>
          <TabsTrigger value="configuracao">Agendamento</TabsTrigger>
          <TabsTrigger value="humanizacao">Humanização</TabsTrigger>
          <TabsTrigger value="eficiencia">Eficiência</TabsTrigger>
          <TabsTrigger value="respostas">Respostas</TabsTrigger>
        </TabsList>

        <TabsContent value="disparo" className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Estratégia Aprovada</CardTitle>
          <CardDescription>Apenas estratégias com aprovação podem ser disparadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedEstrategia} onValueChange={setSelectedEstrategia}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma estratégia" />
            </SelectTrigger>
            <SelectContent>
              {estrategiasAprovadas.map((est: any) => (
                <SelectItem key={est.id} value={est.referencia_id}>
                  {est.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEstrategia && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Estratégia selecionada possui aprovação válida
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedEstrategia && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configurar Disparo</CardTitle>
              <CardDescription>Escolha o canal e variantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Canal</label>
                <Select
                  value={selectedCanal}
                  onValueChange={(v) => setSelectedCanal(v as "whatsapp" | "email")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Templates Disponíveis</label>
                <div className="grid gap-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {template.stage} - {template.variante}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Risco: {template.risco}
                        </p>
                      </div>
                      <Badge>{template.canal}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleDisparo}
                disabled={disparoMutation.isPending}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {disparoMutation.isPending ? "Disparando..." : "Iniciar Disparo"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Verificar DNC (Do Not Contact)
              </CardTitle>
              <CardDescription>
                Verifique se um telefone ou email está bloqueado antes de enviar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="+5511999998888 ou email@exemplo.com"
                    value={checkIdentifier}
                    onChange={(e) => setCheckIdentifier(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckDnc()}
                  />
                  <Button onClick={handleCheckDnc} variant="outline">
                    Verificar
                  </Button>
                </div>

                {dncCheckResult && (
                  <Alert variant={dncCheckResult.blocked ? "destructive" : "default"}>
                    {dncCheckResult.blocked ? (
                      <>
                        <Ban className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Bloqueado!</strong> {dncCheckResult.reason || "Está na lista DNC"}
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Liberado!</strong> Não está bloqueado, pode enviar normalmente.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Envios</CardTitle>
              <CardDescription>Acompanhamento em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Enviados OK</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-sm text-muted-foreground">Falhas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
        </TabsContent>

        <TabsContent value="configuracao">
          <DispatchScheduler />
        </TabsContent>

        <TabsContent value="humanizacao">
          <HumanizationConfig />
        </TabsContent>

        <TabsContent value="eficiencia">
          <LoteEfficiencyPanel />
        </TabsContent>

        <TabsContent value="respostas">
          <ResponseRoutingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
