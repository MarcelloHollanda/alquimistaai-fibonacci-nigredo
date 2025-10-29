import { useSentimentHistory } from '@/hooks/useSentimentAnalysis';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface EmocaoTimelineProps {
  leadId: string;
}

export function EmocaoTimeline({ leadId }: EmocaoTimelineProps) {
  const { historico, loading } = useSentimentHistory(leadId, 20);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando timeline...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const chartData = historico.map((analise, index) => ({
    x: index + 1,
    intensidade: analise.intensidade,
    sentimento: analise.sentimento,
    data: new Date(analise.created_at).toLocaleDateString(),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Emocional
        </CardTitle>
        <CardDescription>
          Histórico de intensidade emocional nas últimas {historico.length} interações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="x" 
                label={{ value: 'Interação', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                domain={[0, 10]} 
                label={{ value: 'Intensidade', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background p-3 border rounded-lg shadow-lg">
                      <p className="font-bold capitalize">{data.sentimento}</p>
                      <p className="text-sm">Intensidade: {data.intensidade}/10</p>
                      <p className="text-xs text-muted-foreground">{data.data}</p>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="intensidade" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
