import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "./TemplatePreview";
import { Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function TemplateEditor() {
  const [template, setTemplate] = useState(
    "Olá {{nome}},\n\nSua consulta está marcada para {{data}} às {{hora}}.\n\nLocal: {{local}}\n\nAté breve!"
  );
  
  const [variables, setVariables] = useState<Record<string, string>>({
    nome: "João Silva",
    data: "15/10/2025",
    hora: "14:30",
    local: "Clínica ABC - Sala 203"
  });

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(template);
    toast.success("Template copiado!");
  };

  const handleAddVariable = () => {
    const varName = prompt("Nome da variável (ex: telefone):");
    if (varName) {
      setVariables(prev => ({ ...prev, [varName]: "" }));
    }
  };

  const handleRemoveVariable = (varName: string) => {
    setVariables(prev => {
      const updated = { ...prev };
      delete updated[varName];
      return updated;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Editor de Template</CardTitle>
          <CardDescription>
            Use a sintaxe Mustache: {`{{variavel}}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Text */}
          <div>
            <Label htmlFor="template">Template Mustache</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Digite seu template..."
              className="font-mono min-h-[200px]"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyTemplate}
              className="mt-2"
            >
              <Copy className="h-3 w-3 mr-2" />
              Copiar Template
            </Button>
          </div>

          {/* Variables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Dados de Teste (Preview)</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddVariable}
              >
                <Plus className="h-3 w-3 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <Input
                    value={key}
                    disabled
                    className="flex-1 font-mono text-sm"
                  />
                  <Input
                    value={value}
                    onChange={(e) => setVariables(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Valor de teste"
                    className="flex-[2]"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveVariable(key)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <TemplatePreview 
        template={template} 
        variables={variables}
        title="Preview em Tempo Real"
      />
    </div>
  );
}
