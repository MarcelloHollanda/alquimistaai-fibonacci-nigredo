import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWhatsAppMonitoring } from "@/hooks/useWhatsAppMonitoring";
import { PacingHistoryPoint } from "@/types/whatsapp";
import { Activity } from "lucide-react";

const MAX_HISTORY_POINTS = 20;

export function PacingUsageChart() {
  const { data: status } = useWhatsAppMonitoring();
  const [history, setHistory] = useState<PacingHistoryPoint[]>([]);

  useEffect(() => {
    if (status?.pacing) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const newPoint: PacingHistoryPoint = {
        time: timeStr,
        sent: status.pacing.sent_this_minute,
        limit: status.pacing.cap_per_minute,
      };

      setHistory((prev) => {
        const updated = [...prev, newPoint];
        // Manter apenas os últimos 20 pontos
        if (updated.length > MAX_HISTORY_POINTS) {
          return updated.slice(updated.length - MAX_HISTORY_POINTS);
        }
        return updated;
      });
    }
  }, [status?.pacing.sent_this_minute]);

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Rate Limiting
          </CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Aguardando dados do WhatsApp...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Uso de Rate Limiting (Últimos 20 minutos)
        </CardTitle>
        <CardDescription>
          Monitoramento em tempo real do consumo de mensagens por minuto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sent" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Mensagens Enviadas"
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line 
              type="monotone" 
              dataKey="limit" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Limite (msg/min)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
