import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Factory, Store, Briefcase, PackageSearch, TrendingUp } from "lucide-react";

interface LeadSegment {
  linha: number;
  empresa: string;
  cnpj?: string;
  setor: "industria" | "atacado" | "distribuidor" | "varejo" | "servicos";
  atividade: string;
  porte: "MEI" | "ME" | "EPP" | "Média" | "Grande";
  tempo_abertura_anos: number;
  telefone?: string;
  email?: string;
  prioridade: "alta" | "media" | "baixa";
}

interface SegmentationResult {
  total_leads: number;
  segmentos: {
    industria: LeadSegment[];
    atacado: LeadSegment[];
    distribuidor: LeadSegment[];
    varejo: LeadSegment[];
    servicos: LeadSegment[];
  };
  lotes_criados: {
    id: string;
    setor: string;
    quantidade: number;
    prioridade_media: string;
  }[];
}

interface SegmentationPanelProps {
  result: SegmentationResult;
}

const setorIcons = {
  industria: Factory,
  atacado: PackageSearch,
  distribuidor: TrendingUp,
  varejo: Store,
  servicos: Briefcase,
};

const setorLabels = {
  industria: "Indústria",
  atacado: "Atacado",
  distribuidor: "Distribuidor",
  varejo: "Varejo",
  servicos: "Serviços",
};

const porteColors = {
  MEI: "bg-slate-100 text-slate-700",
  ME: "bg-blue-100 text-blue-700",
  EPP: "bg-purple-100 text-purple-700",
  Média: "bg-orange-100 text-orange-700",
  Grande: "bg-green-100 text-green-700",
};

const prioridadeColors = {
  alta: "bg-green-100 text-green-700",
  media: "bg-yellow-100 text-yellow-700",
  baixa: "bg-gray-100 text-gray-700",
};

export function SegmentationPanel({ result }: SegmentationPanelProps) {
  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Segmentação Estratégica
          </CardTitle>
          <CardDescription>
            Leads organizados por setor, atividade e porte para campanhas direcionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{result.total_leads}</div>
              <div className="text-sm text-muted-foreground">Total de Leads Qualificados</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{result.lotes_criados.length}</div>
              <div className="text-sm text-muted-foreground">Lotes Criados</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {Object.keys(result.segmentos).filter(
                  (k) => result.segmentos[k as keyof typeof result.segmentos].length > 0
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Setores Identificados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lotes Criados */}
      <Card>
        <CardHeader>
          <CardTitle>Lotes Prontos para Campanha</CardTitle>
          <CardDescription>Agrupamentos homogêneos otimizados para ação comercial</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Lote</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Prioridade Média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.lotes_criados.map((lote) => (
                <TableRow key={lote.id}>
                  <TableCell className="font-mono text-sm">{lote.id}</TableCell>
                  <TableCell>{lote.setor}</TableCell>
                  <TableCell>{lote.quantidade} leads</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={prioridadeColors[lote.prioridade_media as keyof typeof prioridadeColors]}
                    >
                      {lote.prioridade_media}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabelas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Leads por Categoria</CardTitle>
          <CardDescription>Visualização detalhada da base segmentada</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="industria">
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(setorLabels).map(([key, label]) => {
                const Icon = setorIcons[key as keyof typeof setorIcons];
                const count = result.segmentos[key as keyof typeof result.segmentos].length;
                return (
                  <TabsTrigger key={key} value={key} disabled={count === 0}>
                    <Icon className="h-4 w-4 mr-1" />
                    {label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(result.segmentos).map(([setor, leads]) => (
              <TabsContent key={setor} value={setor} className="space-y-4">
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum lead identificado neste setor
                  </div>
                ) : (
                  <div className="rounded-md border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Linha</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Atividade</TableHead>
                          <TableHead>Porte</TableHead>
                          <TableHead>Tempo</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead>Prioridade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.slice(0, 50).map((lead) => (
                          <TableRow key={lead.linha}>
                            <TableCell className="font-mono text-sm">{lead.linha}</TableCell>
                            <TableCell className="font-medium">{lead.empresa}</TableCell>
                            <TableCell className="text-sm">{lead.atividade}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={porteColors[lead.porte]}>
                                {lead.porte}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{lead.tempo_abertura_anos}a</TableCell>
                            <TableCell className="text-sm">
                              {lead.telefone && <div>📞 {lead.telefone}</div>}
                              {lead.email && <div>✉️ {lead.email}</div>}
                              {!lead.telefone && !lead.email && (
                                <span className="text-muted-foreground">Sem contato</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={prioridadeColors[lead.prioridade]}
                              >
                                {lead.prioridade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {leads.length > 50 && (
                      <div className="p-4 text-center text-sm text-muted-foreground border-t">
                        Mostrando 50 de {leads.length} leads. Exporte para ver todos.
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
