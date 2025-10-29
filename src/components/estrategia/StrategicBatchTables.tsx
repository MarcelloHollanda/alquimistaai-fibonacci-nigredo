import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, ShoppingCart, Store, Briefcase, Boxes, Package, TrendingUp, Users } from "lucide-react";

interface LeadDetail {
  linha: number;
  empresa: string;
  cnpj?: string;
  ramo_atuacao: string;
  porte: "MEI" | "ME" | "EPP" | "MEDIO" | "GRANDE";
  faturamento_estimado?: number;
  tempo_abertura_anos: number;
  telefone?: string;
  email?: string;
  valor_comercial: "BAIXO" | "MEDIO" | "ALTO" | "PREMIUM";
  prioridade: number;
}

interface BatchSegment {
  setor: string;
  total_leads: number;
  leads: LeadDetail[];
}

interface StrategicBatchTablesProps {
  segments: BatchSegment[];
}

const setorIcons: Record<string, any> = {
  Tecnologia: Briefcase,
  Indústria: Factory,
  Varejo: ShoppingCart,
  Serviços: Briefcase,
  Atacado: Boxes,
  Diversos: Store,
};

const porteVariants = {
  MEI: "outline",
  ME: "secondary",
  EPP: "secondary",
  MEDIO: "default",
  GRANDE: "default",
} as const;

const valorColors = {
  BAIXO: "text-muted-foreground",
  MEDIO: "text-blue-600 dark:text-blue-400",
  ALTO: "text-green-600 dark:text-green-400",
  PREMIUM: "text-yellow-600 dark:text-yellow-400",
};

const prioridadeColors = {
  1: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  2: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  4: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  5: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export function StrategicBatchTables({ segments }: StrategicBatchTablesProps) {
  const totalLeads = segments.reduce((acc, seg) => acc + seg.total_leads, 0);
  const activeSegments = segments.filter(seg => seg.leads.length > 0);

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Tabelas Detalhadas por Segmento
          </CardTitle>
          <CardDescription>
            Visualização completa dos leads organizados estrategicamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{totalLeads}</div>
              <div className="text-xs text-muted-foreground mt-1">Total de Leads</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {activeSegments.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Segmentos Ativos</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-gradient-to-br from-green-500/10 to-green-500/5">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round((totalLeads / activeSegments.length) * 10) / 10}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Média por Segmento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Organizados por Setor</CardTitle>
          <CardDescription>
            Explore cada segmento para visualizar leads, ramos de atuação e perfis comerciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={segments[0]?.setor || ""}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${segments.length}, 1fr)` }}>
              {segments.map((segment) => {
                const Icon = setorIcons[segment.setor] || Store;
                return (
                  <TabsTrigger
                    key={segment.setor}
                    value={segment.setor}
                    disabled={segment.leads.length === 0}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{segment.setor}</span>
                    <span className="sm:hidden">{segment.setor.substring(0, 3)}</span>
                    <Badge variant="outline" className="ml-2">
                      {segment.total_leads}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {segments.map((segment) => (
              <TabsContent key={segment.setor} value={segment.setor} className="space-y-4">
                {segment.leads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum lead identificado neste segmento</p>
                  </div>
                ) : (
                  <>
                    {/* Estatísticas do Segmento */}
                    <div className="grid gap-4 md:grid-cols-4 p-4 rounded-lg border bg-accent/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{segment.total_leads}</div>
                        <div className="text-xs text-muted-foreground">Leads no Segmento</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {segment.leads.filter(l => l.valor_comercial === 'PREMIUM' || l.valor_comercial === 'ALTO').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Alto Valor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {new Set(segment.leads.map(l => l.ramo_atuacao)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">Ramos Distintos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {segment.leads.filter(l => l.faturamento_estimado && l.faturamento_estimado > 10).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Faturamento &gt; R$10M</div>
                      </div>
                    </div>

                    {/* Tabela de Leads */}
                    <div className="rounded-lg border overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-16">Linha</TableHead>
                            <TableHead className="min-w-[200px]">Empresa</TableHead>
                            <TableHead className="min-w-[150px]">Ramo de Atuação</TableHead>
                            <TableHead>Porte</TableHead>
                            <TableHead>Faturamento</TableHead>
                            <TableHead>Tempo</TableHead>
                            <TableHead className="min-w-[150px]">Contato</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Prior.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segment.leads.slice(0, 100).map((lead) => (
                            <TableRow key={lead.linha} className="hover:bg-accent/50">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {lead.linha}
                              </TableCell>
                              <TableCell className="font-semibold">
                                <div className="max-w-[250px]">
                                  <div className="truncate">{lead.empresa}</div>
                                  {lead.cnpj && (
                                    <div className="text-xs text-muted-foreground font-mono">
                                      {lead.cnpj}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{lead.ramo_atuacao}</TableCell>
                              <TableCell>
                                <Badge variant={porteVariants[lead.porte]}>
                                  {lead.porte}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {lead.faturamento_estimado ? (
                                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                    R$ {lead.faturamento_estimado.toFixed(1)}M
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">N/D</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {lead.tempo_abertura_anos}a
                              </TableCell>
                              <TableCell className="text-xs">
                                {lead.telefone && <div className="mb-1">📞 {lead.telefone}</div>}
                                {lead.email && <div className="truncate max-w-[150px]">✉️ {lead.email}</div>}
                                {!lead.telefone && !lead.email && (
                                  <span className="text-muted-foreground">Sem contato</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={valorColors[lead.valor_comercial]}>
                                  {lead.valor_comercial}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={prioridadeColors[lead.prioridade as keyof typeof prioridadeColors]}
                                >
                                  {lead.prioridade}/5
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {segment.leads.length > 100 && (
                        <div className="p-4 text-center text-sm text-muted-foreground border-t bg-muted/30">
                          Mostrando 100 de {segment.leads.length} leads. Exporte para ver todos.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
