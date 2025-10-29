import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";

export function InboundActivityWidget() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ["inbound-summary"],
    queryFn: async () => {
      const response = await api.get("/api/inbound/summary");
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Atividade Inbound
          </CardTitle>
          <CardDescription>Últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Atividade Inbound
          </CardTitle>
          <CardDescription>Últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Falha ao carregar atividade inbound
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalMessages = summary.total || 0;
  const optOutRate = summary.opt_out_rate || 0;
  const breakdown = summary.breakdown || [];

  // Calcular pico de mensagens
  const peakHour = breakdown.length > 0 
    ? breakdown.reduce((max: any, curr: any) => curr.count > max.count ? curr : max, breakdown[0])
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Atividade Inbound
        </CardTitle>
        <CardDescription>Últimas 24 horas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{totalMessages}</p>
            <p className="text-sm text-muted-foreground">Mensagens recebidas</p>
          </div>
          {totalMessages > 0 && (
            <Badge variant={optOutRate > 0.05 ? "destructive" : "secondary"}>
              {(optOutRate * 100).toFixed(1)}% opt-out
            </Badge>
          )}
        </div>

        {peakHour && (
          <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Pico de atividade</p>
              <p className="text-xs text-muted-foreground">
                {peakHour.hour}h - {peakHour.count} mensagens
              </p>
            </div>
          </div>
        )}

        {breakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Distribuição por hora</p>
            <div className="flex gap-1 h-16 items-end">
              {breakdown.slice(-12).map((item: any, idx: number) => {
                const maxCount = Math.max(...breakdown.map((b: any) => b.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '2px' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.hour}h: {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{breakdown[breakdown.length - 12]?.hour || '00'}h</span>
              <span>{breakdown[breakdown.length - 1]?.hour || '23'}h</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
