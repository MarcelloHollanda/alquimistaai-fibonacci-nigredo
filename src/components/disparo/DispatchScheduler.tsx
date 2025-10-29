import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calendar, RefreshCw, AlertTriangle, Zap } from "lucide-react";
import { useState } from "react";

interface DispatchConfig {
  enableFollowUps: boolean;
  followUpDelayHours: number;
  maxMessagesPerLead: number;
  restPeriodDays: number;
  enableIdempotency: boolean;
  enableNaturalVariation: boolean;
}

export function DispatchScheduler() {
  const [config, setConfig] = useState<DispatchConfig>({
    enableFollowUps: true,
    followUpDelayHours: 48,
    maxMessagesPerLead: 3,
    restPeriodDays: 7,
    enableIdempotency: true,
    enableNaturalVariation: true,
  });

  return (
    <div className="space-y-4">
      {/* Políticas de Frequência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Políticas de Frequência
          </CardTitle>
          <CardDescription>
            Controle de limite de mensagens e período de descanso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-messages">Máximo de mensagens por Lead</Label>
            <Input
              id="max-messages"
              type="number"
              min={1}
              max={10}
              value={config.maxMessagesPerLead}
              onChange={(e) =>
                setConfig({ ...config, maxMessagesPerLead: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Limite total de mensagens que um Lead pode receber (incluindo follow-ups)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rest-period">Período de descanso (dias)</Label>
            <Input
              id="rest-period"
              type="number"
              min={1}
              max={30}
              value={config.restPeriodDays}
              onChange={(e) =>
                setConfig({ ...config, restPeriodDays: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Tempo mínimo entre campanhas para o mesmo Lead (evita spam)
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Proteção anti-spam ativa:</strong> Leads que já receberam{" "}
              {config.maxMessagesPerLead} mensagens entram em descanso por{" "}
              {config.restPeriodDays} dias automaticamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Follow-ups Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Follow-ups Automáticos
          </CardTitle>
          <CardDescription>
            Reenvio inteligente para Leads sem resposta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-followups">Ativar follow-ups</Label>
              <p className="text-xs text-muted-foreground">
                Reenviar mensagens para Leads que não responderam
              </p>
            </div>
            <Switch
              id="enable-followups"
              checked={config.enableFollowUps}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enableFollowUps: checked })
              }
            />
          </div>

          {config.enableFollowUps && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="followup-delay">Intervalo do follow-up (horas)</Label>
                <Input
                  id="followup-delay"
                  type="number"
                  min={24}
                  max={168}
                  step={24}
                  value={config.followUpDelayHours}
                  onChange={(e) =>
                    setConfig({ ...config, followUpDelayHours: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Tempo de espera antes de enviar novo follow-up (mínimo 24h)
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">Regra de Follow-up:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Mensagem inicial enviada → aguarda {config.followUpDelayHours}h</li>
                  <li>✓ Se sem resposta → envia follow-up #1</li>
                  <li>✓ Aguarda mais {config.followUpDelayHours}h → follow-up #2</li>
                  <li>✓ Limite máximo: {config.maxMessagesPerLead} mensagens</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Humanização e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Humanização e Segurança
          </CardTitle>
          <CardDescription>
            Recursos para evitar bloqueios e parecer natural
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-idempotency">Idempotency Keys</Label>
              <p className="text-xs text-muted-foreground">
                Previne mensagens duplicadas entre canais (WhatsApp + Email)
              </p>
            </div>
            <Switch
              id="enable-idempotency"
              checked={config.enableIdempotency}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enableIdempotency: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-variation">Variação Natural de Tom</Label>
              <p className="text-xs text-muted-foreground">
                Pequenas mudanças no texto para parecer mais humano
              </p>
            </div>
            <Switch
              id="enable-variation"
              checked={config.enableNaturalVariation}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enableNaturalVariation: checked })
              }
            />
          </div>

          {config.enableNaturalVariation && (
            <Alert>
              <AlertDescription className="text-xs">
                ℹ️ Variações aplicadas: sinônimos, ordem de frases, saudações
                alternativas. O núcleo da mensagem permanece intacto.
              </AlertDescription>
            </Alert>
          )}

          {config.enableIdempotency && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-400">
                ✅ <strong>Proteção ativa:</strong> Cada mensagem recebe um ID único.
                Se o mesmo Lead estiver em múltiplas campanhas, receberá apenas 1 vez.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Janela de Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Janela de Horários
          </CardTitle>
          <CardDescription>Período permitido para envios (já configurado)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Horário:</p>
              <Badge variant="outline">08:00 - 18:00</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Dias:</p>
              <Badge variant="outline">Segunda a Sexta</Badge>
            </div>
          </div>
          <Alert className="mt-4">
            <AlertDescription className="text-xs">
              ⚠️ Mensagens fora desse período são bloqueadas automaticamente para
              evitar incômodo e melhorar taxa de resposta.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Button className="w-full">Salvar Configurações de Disparo</Button>
    </div>
  );
}
