import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { CsvUploader } from "@/components/leads/CsvUploader";
import { ColumnMapper } from "@/components/leads/ColumnMapper";
import { mockLotes } from "@/lib/mock-data";

import { EnrichmentReport as EnrichmentReportType, Inconformidade } from "@/types/enrichment";
import { EnrichmentReport } from "@/components/leads/EnrichmentReport";
import { InconformidadesReport } from "@/components/leads/InconformidadesReport";
import { CorrectionsForm } from "@/components/leads/CorrectionsForm";
import { useCorrections } from "@/hooks/useCorrections";
import { SegmentationPanel } from "@/components/leads/SegmentationPanel";

interface UploadResult {
  path: string;
  rows: number;
  headers: string[];
}

interface SegmentationResult {
  total_leads: number;
  segmentos: {
    industria: any[];
    atacado: any[];
    distribuidor: any[];
    varejo: any[];
    servicos: any[];
  };
  lotes_criados: Array<{
    id: string;
    setor: string;
    quantidade: number;
    prioridade_media: string;
  }>;
}

interface ProcessResult {
  ok: boolean;
  stats: {
    validos: number;
    duplicados: number;
    invalidos: number;
  };
  lote_id?: string;
  inconformidades?: Inconformidade[];
  enrichment_report?: EnrichmentReportType;
  segmentation?: SegmentationResult;
}

export default function Leads() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const correctionsMutation = useCorrections();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<UploadResult>("/upload/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      toast.success(`Arquivo enviado: ${data.rows} linhas detectadas`);
    },
    onError: () => {
      // Modo simulado
      const mockResult: UploadResult = {
        path: "/mnt/data/mock-upload.csv",
        rows: 1247,
        headers: ["razao_social", "cnpj", "email", "telefone", "uf", "cidade", "cnae"],
      };
      setUploadResult(mockResult);
      toast.info("Modo simulado ativado - API ausente");
    },
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ProcessResult>("/process/csv", {
        path: uploadResult!.path,
        origem: "ui:upload",
        mapping: columnMapping,
      });
      return data;
    },
    onSuccess: (data) => {
      setProcessResult(data);
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
      toast.success("Lote processado com sucesso!");
    },
    onError: () => {
      // Modo simulado com dados de enriquecimento e segmentação
      const mockResult: ProcessResult = {
        ok: true,
        stats: {
          validos: 1089,
          duplicados: 123,
          invalidos: 35,
        },
        lote_id: "lote-" + Date.now(),
        inconformidades: [
          {
            linha: 5,
            motivo: "CNPJ inválido",
            sugestao: "Verificar formato do CNPJ (deve ter 14 dígitos)"
          },
          {
            linha: 12,
            motivo: "Email inválido",
            sugestao: "Formato deve ser usuario@dominio.com"
          },
          {
            linha: 23,
            motivo: "Telefone faltante",
            sugestao: "Adicionar telefone válido com DDD"
          }
        ],
        enrichment_report: {
          total_enriched: 1050,
          sources_used: ["receita_federal", "google_places", "web_search"],
          total_adjusted_fields: 2340,
          total_missing_fields: 156,
          details: [
            {
              linha: 1,
              enrichment_sources: ["receita_federal"],
              adjusted_fields: ["razao_social", "cnae"],
              missing_fields: ["site"]
            },
            {
              linha: 3,
              enrichment_sources: ["receita_federal", "google_places"],
              adjusted_fields: ["razao_social", "telefone", "endereco"],
              missing_fields: []
            },
            {
              linha: 7,
              enrichment_sources: ["web_search"],
              adjusted_fields: ["site", "email"],
              missing_fields: ["telefone"]
            }
          ]
        },
        segmentation: {
          total_leads: 1089,
          segmentos: {
            industria: [
              {
                linha: 1,
                empresa: "Metalúrgica Silva Ltda",
                cnpj: "12.345.678/0001-90",
                setor: "industria",
                atividade: "Fabricação de peças metálicas",
                porte: "Média",
                tempo_abertura_anos: 15,
                telefone: "(11) 98765-4321",
                email: "contato@metalurgicasilva.com.br",
                prioridade: "alta"
              },
              {
                linha: 8,
                empresa: "Indústria de Plásticos XYZ",
                cnpj: "23.456.789/0001-01",
                setor: "industria",
                atividade: "Moldagem de plásticos",
                porte: "Grande",
                tempo_abertura_anos: 22,
                telefone: "(19) 3456-7890",
                email: "vendas@plasticosxyz.com.br",
                prioridade: "alta"
              }
            ],
            atacado: [
              {
                linha: 3,
                empresa: "Distribuidora ABC Atacado",
                cnpj: "34.567.890/0001-12",
                setor: "atacado",
                atividade: "Distribuição de alimentos",
                porte: "EPP",
                tempo_abertura_anos: 8,
                telefone: "(21) 2345-6789",
                email: "comercial@abcatacado.com.br",
                prioridade: "media"
              }
            ],
            distribuidor: [
              {
                linha: 6,
                empresa: "Logística Rápida Dist",
                cnpj: "45.678.901/0001-23",
                setor: "distribuidor",
                atividade: "Logística e distribuição",
                porte: "Média",
                tempo_abertura_anos: 12,
                telefone: "(11) 3333-4444",
                prioridade: "alta"
              }
            ],
            varejo: [
              {
                linha: 2,
                empresa: "Loja do João",
                cnpj: "56.789.012/0001-34",
                setor: "varejo",
                atividade: "Comércio varejista de roupas",
                porte: "ME",
                tempo_abertura_anos: 5,
                email: "contato@lojadojoao.com.br",
                prioridade: "baixa"
              },
              {
                linha: 10,
                empresa: "Supermercado Central",
                cnpj: "67.890.123/0001-45",
                setor: "varejo",
                atividade: "Supermercado",
                porte: "Média",
                tempo_abertura_anos: 18,
                telefone: "(85) 98888-7777",
                email: "gerencia@supercentral.com.br",
                prioridade: "media"
              }
            ],
            servicos: [
              {
                linha: 4,
                empresa: "Consultoria Tech Solutions",
                cnpj: "78.901.234/0001-56",
                setor: "servicos",
                atividade: "Consultoria em TI",
                porte: "EPP",
                tempo_abertura_anos: 6,
                telefone: "(11) 99999-8888",
                email: "contato@techsolutions.com.br",
                prioridade: "alta"
              }
            ]
          },
          lotes_criados: [
            {
              id: "LOTE-IND-001",
              setor: "Indústria",
              quantidade: 450,
              prioridade_media: "alta"
            },
            {
              id: "LOTE-ATA-001",
              setor: "Atacado",
              quantidade: 230,
              prioridade_media: "media"
            },
            {
              id: "LOTE-DIS-001",
              setor: "Distribuidor",
              quantidade: 180,
              prioridade_media: "alta"
            },
            {
              id: "LOTE-VAR-001",
              setor: "Varejo",
              quantidade: 150,
              prioridade_media: "media"
            },
            {
              id: "LOTE-SER-001",
              setor: "Serviços",
              quantidade: 79,
              prioridade_media: "alta"
            }
          ]
        }
      };
      setProcessResult(mockResult);
      toast.info("Processamento simulado - API ausente");
    },
  });

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleProcess = () => {
    if (!uploadResult) return;
    processMutation.mutate();
  };

  const handleGoToStrategy = () => {
    if (processResult?.lote_id) {
      navigate("/estrategia?lote_id=" + processResult.lote_id);
    }
  };

  const handleCorrections = (corrections: any[]) => {
    if (!processResult?.lote_id) return;
    
    correctionsMutation.mutate({
      batch_id: processResult.lote_id,
      corrections,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">Upload e higienização de leads via CSV</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload CSV</CardTitle>
            <CardDescription>Arraste ou selecione um arquivo CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <CsvUploader
              onUpload={handleUpload}
              isUploading={uploadMutation.isPending}
            />
            {uploadResult && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadResult.rows} linhas detectadas • {uploadResult.headers.length} colunas
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Mapear Colunas</CardTitle>
            <CardDescription>Relacione as colunas do CSV com os campos internos</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadResult ? (
              <ColumnMapper
                headers={uploadResult.headers}
                mapping={columnMapping}
                onMappingChange={setColumnMapping}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Aguardando upload...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>3. Higienizar & Processar</CardTitle>
            <CardDescription>Validar, deduplicar e criar lote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleProcess}
              disabled={processMutation.isPending || Object.keys(columnMapping).length === 0}
              className="w-full"
            >
              {processMutation.isPending ? "Processando..." : "Higienizar & Criar Lote"}
            </Button>

            {processResult && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <div className="text-2xl font-bold">{processResult.stats.validos}</div>
                      <div className="text-sm text-muted-foreground">Válidos</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div>
                      <div className="text-2xl font-bold">{processResult.stats.duplicados}</div>
                      <div className="text-sm text-muted-foreground">Duplicados</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold">{processResult.stats.invalidos}</div>
                      <div className="text-sm text-muted-foreground">Inválidos</div>
                    </div>
                  </div>
                </div>

                {processResult.lote_id && (
                  <Button onClick={handleGoToStrategy} className="w-full">
                    Ir para Estratégia <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Relatórios de Validação e Enriquecimento */}
      {processResult && (
        <div className="grid gap-6 lg:grid-cols-2">
          {processResult.inconformidades && processResult.inconformidades.length > 0 && (
            <InconformidadesReport inconformidades={processResult.inconformidades} />
          )}
          
          {processResult.enrichment_report && (
            <EnrichmentReport report={processResult.enrichment_report} />
          )}
        </div>
      )}

      {/* Segmentação Estratégica */}
      {processResult && processResult.segmentation && (
        <SegmentationPanel result={processResult.segmentation} />
      )}

      {/* Formulário de Correções */}
      {processResult && processResult.inconformidades && processResult.inconformidades.length > 0 && (
        <CorrectionsForm
          batchId={processResult.lote_id || ''}
          inconformidades={processResult.inconformidades}
          onSubmit={handleCorrections}
          isLoading={correctionsMutation.isPending}
        />
      )}
    </div>
  );
}
