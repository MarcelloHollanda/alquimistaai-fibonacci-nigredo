import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CorrecaoLead, Inconformidade } from "@/types/enrichment";
import { Save, RotateCcw } from "lucide-react";

interface CorrectionsFormProps {
  batchId: string;
  inconformidades: Inconformidade[];
  onSubmit: (corrections: CorrecaoLead[]) => void;
  isLoading?: boolean;
}

const fieldLabels: Record<string, string> = {
  cnpj: "CNPJ",
  razao_social: "Razão Social",
  email: "E-mail",
  telefone: "Telefone",
  site: "Site",
  uf: "UF",
  cidade: "Cidade",
};

export function CorrectionsForm({ batchId, inconformidades, onSubmit, isLoading }: CorrectionsFormProps) {
  const [corrections, setCorrections] = useState<Map<string, CorrecaoLead>>(new Map());

  const handleFieldChange = (linha: number, field: string, value: string) => {
    const key = `${linha}-${field}`;
    const newCorrections = new Map(corrections);
    
    if (value.trim()) {
      newCorrections.set(key, {
        linha,
        field: field as CorrecaoLead['field'],
        new_value: value.trim(),
      });
    } else {
      newCorrections.delete(key);
    }
    
    setCorrections(newCorrections);
  };

  const handleSubmit = () => {
    const correctionsList = Array.from(corrections.values());
    onSubmit(correctionsList);
  };

  const handleReset = () => {
    setCorrections(new Map());
  };

  // Agrupa inconformidades por linha
  const groupedByLine = inconformidades.reduce((acc, inc) => {
    if (!acc[inc.linha]) {
      acc[inc.linha] = [];
    }
    acc[inc.linha].push(inc);
    return acc;
  }, {} as Record<number, Inconformidade[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correções Manuais</CardTitle>
        <CardDescription>
          Corrija os dados dos leads com inconformidades. CNPJs corrigidos serão re-processados automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Novo Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedByLine).map(([linha, incs]) => (
                incs.map((inc, idx) => {
                  // Tentar extrair o campo do motivo (ex: "CNPJ inválido" -> "cnpj")
                  const field = inc.motivo.toLowerCase().split(' ')[0];
                  const validField = Object.keys(fieldLabels).find(f => 
                    field.includes(f.replace('_', ''))
                  ) || 'razao_social';
                  
                  const key = `${linha}-${validField}`;
                  
                  return (
                    <TableRow key={`${linha}-${idx}`}>
                      <TableCell>
                        <Badge variant="outline">{linha}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">{inc.motivo}</p>
                          {inc.sugestao && (
                            <p className="text-muted-foreground text-xs mt-1">
                              {inc.sugestao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {fieldLabels[validField]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder={`Novo ${fieldLabels[validField]}`}
                          value={corrections.get(key)?.new_value || ''}
                          onChange={(e) => handleFieldChange(Number(linha), validField, e.target.value)}
                          disabled={isLoading}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={corrections.size === 0 || isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={corrections.size === 0 || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Aplicar {corrections.size} Correção(ões)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
