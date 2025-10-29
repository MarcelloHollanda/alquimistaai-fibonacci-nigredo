import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Building2, TrendingUp, Users, ChevronDown, ChevronRight, Factory, ShoppingCart, Store, Briefcase, Boxes, Star } from "lucide-react";
import { useState } from "react";

interface RamoAtuacao {
  nome: string;
  total_leads: number;
  percentual: number;
}

interface StrategicBatch {
  id: string;
  nome: string;
  setor: string;
  ramos_atuacao: RamoAtuacao[];
  porte: 'MEI' | 'ME' | 'EPP' | 'MEDIO' | 'GRANDE';
  valor_comercial: 'BAIXO' | 'MEDIO' | 'ALTO' | 'PREMIUM';
  total_leads: number;
  faturamento_medio_estimado?: number;
  prioridade: number; // 1-5
}

interface StrategicBatchesPanelProps {
  batches: StrategicBatch[];
}

export function StrategicBatchesPanel({ batches }: StrategicBatchesPanelProps) {
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const getSetorIcon = (setor: string) => {
    const icons: Record<string, any> = {
      'Tecnologia': Briefcase,
      'Indústria': Factory,
      'Varejo': ShoppingCart,
      'Serviços': Briefcase,
      'Atacado': Boxes,
      'Diversos': Store
    };
    return icons[setor] || Building2;
  };

  const getPorteBadgeVariant = (porte: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      'MEI': 'outline',
      'ME': 'secondary',
      'EPP': 'secondary',
      'MEDIO': 'default',
      'GRANDE': 'default'
    };
    return variants[porte] || 'outline';
  };

  const getValorColor = (valor: string) => {
    const colors: Record<string, string> = {
      'BAIXO': 'text-muted-foreground',
      'MEDIO': 'text-blue-600 dark:text-blue-400',
      'ALTO': 'text-green-600 dark:text-green-400',
      'PREMIUM': 'text-yellow-600 dark:text-yellow-400'
    };
    return colors[valor] || 'text-muted-foreground';
  };

  const getPrioridadeProgress = (prioridade: number) => {
    return (prioridade / 5) * 100;
  };

  const totalLeads = batches.reduce((acc, batch) => acc + batch.total_leads, 0);
  const batchesPorSetor = batches.reduce((acc, batch) => {
    acc[batch.setor] = (acc[batch.setor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const batchesPorValor = batches.reduce((acc, batch) => {
    acc[batch.valor_comercial] = (acc[batch.valor_comercial] || 0) + batch.total_leads;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Lotes Estratégicos por Segmento
        </CardTitle>
        <CardDescription>
          Leads organizados e priorizados por setor, ramo de atuação, porte e valor comercial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Executivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5">
            <Package className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">{batches.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Lotes Criados</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalLeads}</p>
            <p className="text-xs text-muted-foreground mt-1">Total de Leads</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-green-500/10 to-green-500/5">
            <Building2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Object.keys(batchesPorSetor).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Setores Distintos</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round((totalLeads / batches.length) * 10) / 10}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Média por Lote</p>
          </div>
        </div>

        {/* Distribuição por Valor Comercial */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Distribuição por Valor Comercial
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(batchesPorValor).map(([valor, count]) => (
              <div key={valor} className="text-center p-3 rounded-lg border bg-gradient-to-br from-background to-accent/20">
                <p className={`text-2xl font-bold ${getValorColor(valor)}`}>{count}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{valor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Lotes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Lotes Organizados (Maior → Menor Prioridade)
          </h4>
          <div className="space-y-4">
            {batches
              .sort((a, b) => b.prioridade - a.prioridade)
              .map((batch) => {
                const isExpanded = expandedBatches.has(batch.id);
                const SetorIcon = getSetorIcon(batch.setor);
                
                return (
                  <div key={batch.id} className="border-2 rounded-xl bg-gradient-to-br from-card to-accent/5 overflow-hidden hover:shadow-lg transition-all">
                    <div 
                      className="p-5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => toggleBatch(batch.id)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <SetorIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-lg">{batch.nome}</h5>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />
                                {batch.setor}
                              </p>
                            </div>
                            <Badge variant={getPorteBadgeVariant(batch.porte)} className="text-xs font-semibold">
                              {batch.porte}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm ml-14">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-blue-600 dark:text-blue-400">{batch.total_leads}</span>
                              <span className="text-muted-foreground">leads</span>
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Package className="h-3 w-3" />
                              {batch.ramos_atuacao.length} ramos
                            </span>
                            {batch.faturamento_medio_estimado && (
                              <span className="flex items-center gap-1 font-medium">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">
                                  R$ {batch.faturamento_medio_estimado.toFixed(1)}M
                                </span>
                                <span className="text-muted-foreground text-xs">médio</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getValorColor(batch.valor_comercial)} font-bold text-sm px-3 py-1`}>
                            {batch.valor_comercial}
                          </Badge>
                        </div>
                      </div>

                      {/* Barra de Prioridade */}
                      <div className="space-y-2 ml-14 bg-accent/20 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Nível de Prioridade</span>
                          <span className="font-bold text-primary">{batch.prioridade}/5</span>
                        </div>
                        <Progress value={getPrioridadeProgress(batch.prioridade)} className="h-3" />
                      </div>
                    </div>

                    {/* Ramos de Atuação (expandível) */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-4 border-t-2 bg-accent/20">
                        <h6 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 ml-14">
                          <Store className="h-4 w-4 text-primary" />
                          RAMOS DE ATUAÇÃO — SEGMENTAÇÃO DETALHADA
                        </h6>
                        <div className="space-y-3 ml-14">
                          {batch.ramos_atuacao.map((ramo, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-4 rounded-lg bg-card border-2 hover:border-primary/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-semibold">{ramo.nome}</p>
                                <div className="mt-2">
                                  <Progress value={ramo.percentual} className="h-2" />
                                </div>
                              </div>
                              <div className="flex items-center gap-4 ml-4">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">{ramo.total_leads}</p>
                                  <p className="text-xs text-muted-foreground">leads</p>
                                </div>
                                <Badge variant="outline" className="text-sm font-bold px-3 py-1">
                                  {ramo.percentual.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
