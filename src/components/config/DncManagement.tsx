import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Ban, Plus, Trash2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useDNCList, useAddDNC, useRemoveDNC } from "@/hooks/useDNC";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DncEntry {
  id: string;
  trace_id?: string;
  lead_id?: string;
  canal: 'whatsapp' | 'email';
  origem: 'manual' | 'auto';
  motivo?: string;
  created_at?: string;
}

export function DncManagement() {
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newType, setNewType] = useState<"telefone" | "email">("telefone");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dncList = [], isLoading, isError } = useDNCList();
  const addMutation = useAddDNC();
  const removeMutation = useRemoveDNC();

  const handleAdd = () => {
    if (!newIdentifier.trim()) {
      toast.error("Digite um telefone ou email válido");
      return;
    }
    
    const payload = {
      canal: newType === "telefone" ? "whatsapp" as const : "email" as const,
      origem: "manual" as const,
      motivo: "bloqueio_manual",
      ...(newType === "telefone" ? { telefone: newIdentifier } : { email: newIdentifier }),
    };
    
    addMutation.mutate(payload);
    setNewIdentifier("");
  };

  const filteredList = dncList.filter((entry: DncEntry) =>
    entry.origem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMotivoLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      opt_out_whatsapp: "Opt-out WhatsApp",
      opt_out_email: "Opt-out Email",
      bloqueio_manual: "Bloqueio Manual",
      solicitacao_usuario: "Solicitação do Usuário",
    };
    return labels[motivo] || motivo;
  };

  const getCanalVariant = (canal: string): "default" | "secondary" | "outline" => {
    switch (canal) {
      case "whatsapp": return "default";
      case "email": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Bloqueio (DNC)</CardTitle>
          <CardDescription>
            Adicione números ou emails que não devem receber comunicações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {newType === "telefone" ? "Telefone (E.164)" : "Email"}
              </Label>
              <Input
                placeholder={newType === "telefone" ? "+5511999998888" : "exemplo@email.com"}
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAdd} 
                disabled={addMutation.isPending}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Bloqueio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Lista de Bloqueios (DNC)
            </div>
            <Badge variant="secondary">
              {dncList.length} bloqueios
            </Badge>
          </CardTitle>
          <CardDescription>
            Gerenciar contatos bloqueados para comunicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Falha ao carregar lista de bloqueios
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando lista...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Nenhum bloqueio encontrado</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identificador</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredList.map((entry: DncEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">
                          {entry.origem}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCanalVariant(entry.canal)}>
                            {entry.canal}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getMotivoLabel(entry.motivo)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMutation.mutate(entry.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
