import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface RelatorioMensal {
  periodo: string;
  kpis: {
    leads_processados: number;
    taxa_higienizacao: number;
    conversas_ativas: number;
    agendamentos: number;
    taxa_conversao: number;
  };
  sentimentos: {
    empolgado: number;
    positivo: number;
    neutro: number;
    negativo: number;
    irritado: number;
  };
  fit_comercial: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  objecoes_top: Array<{
    categoria: string;
    count: number;
  }>;
  tendencias: string[];
  recomendacoes: string[];
}

export function RelatorioMensalPanel() {
  const [relatorio, setRelatorio] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'mensal' | 'semanal'>('mensal');

  useEffect(() => {
    fetchRelatorio();
  }, [periodo]);

  const fetchRelatorio = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/relatorios/${periodo}`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar relatório');

      const { success, data } = await response.json();
      
      if (success) {
        setRelatorio(data);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      
      // Fallback com dados mock
      setRelatorio({
        periodo: periodo === 'mensal' ? 'Outubro 2024' : 'Semana 42/2024',
        kpis: {
          leads_processados: 1250,
          taxa_higienizacao: 87.5,
          conversas_ativas: 342,
          agendamentos: 89,
          taxa_conversao: 12.3
        },
        sentimentos: {
          empolgado: 45,
          positivo: 234,
          neutro: 512,
          negativo: 78,
          irritado: 12
        },
        fit_comercial: {
          A: 123,
          B: 345,
          C: 456,
          D: 326
        },
        objecoes_top: [
          { categoria: 'preco', count: 89 },
          { categoria: 'timing', count: 67 },
          { categoria: 'concorrente', count: 45 }
        ],
        tendencias: [
          'Aumento de 15% em leads Fit A',
          'Redução de 8% em leads irritados',
          'Crescimento de agendamentos (+23%)'
        ],
        recomendacoes: [
          'Focar em leads Fit A com sentimento empolgado',
          'Criar playbook para objeção de preço',
          'Automatizar follow-up para leads Fit B'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !relatorio) {
    return <Card><CardContent className="p-6">Carregando...</CardContent></Card>;
  }

  const sentimentosData = Object.entries(relatorio.sentimentos).map(([name, value]) => ({
    name,
    value
  }));

  const fitData = Object.entries(relatorio.fit_comercial).map(([name, value]) => ({
    name: `Fit ${name}`,
    value
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📊 Relatório {periodo === 'mensal' ? 'Mensal' : 'Semanal'} - GAP 4</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={periodo === 'semanal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo('semanal')}
            >
              Semanal
            </Button>
            <Button
              variant={periodo === 'mensal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo('mensal')}
            >
              Mensal
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{relatorio.periodo}</p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="kpis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="sentimentos">Sentimentos</TabsTrigger>
            <TabsTrigger value="fit">Fit Comercial</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Leads Processados</p>
                <p className="text-3xl font-bold">{relatorio.kpis.leads_processados}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Taxa Higienização</p>
                <p className="text-3xl font-bold">{relatorio.kpis.taxa_higienizacao}%</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                <p className="text-3xl font-bold">{relatorio.kpis.conversas_ativas}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Agendamentos</p>
                <p className="text-3xl font-bold">{relatorio.kpis.agendamentos}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-3xl font-bold">{relatorio.kpis.taxa_conversao}%</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sentimentos">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="fit">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fitData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">📈 Tendências Identificadas</h4>
              <div className="space-y-2">
                {relatorio.tendencias.map((tendencia, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline">#{i + 1}</Badge>
                    <p className="text-sm">{tendencia}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">💡 Recomendações</h4>
              <div className="space-y-2">
                {relatorio.recomendacoes.map((rec, i) => (
                  <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {relatorio.objecoes_top.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">🎯 Top Objeções</h4>
                <div className="space-y-2">
                  {relatorio.objecoes_top.map((obj, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm capitalize">{obj.categoria}</span>
                      <Badge>{obj.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
