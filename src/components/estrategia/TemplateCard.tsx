import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  stage: string;
  variante: string;
  canal: string;
  template: string;
  risco: string;
}

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(template.template);
    toast.success("Template copiado!");
  };

  // Preview com dados de exemplo
  const previewData = {
    razao_social: "Empresa Exemplo LTDA",
    nome_fantasia: "Exemplo Corp",
    contato: "João Silva",
  };

  const preview = template.template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return previewData[key as keyof typeof previewData] || `{{${key}}}`;
  });

  const Icon = template.canal === "whatsapp" ? MessageSquare : Mail;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-base">{template.variante}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={template.risco === "baixo" ? "default" : "secondary"}>
              {template.canal}
            </Badge>
            <Badge
              variant={
                template.risco === "baixo"
                  ? "default"
                  : template.risco === "medio"
                  ? "secondary"
                  : "destructive"
              }
            >
              {template.risco}
            </Badge>
          </div>
        </div>
        <CardDescription>Preview com dados de exemplo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">{preview}</div>
        <Button onClick={handleCopy} variant="outline" size="sm" className="w-full">
          <Copy className="mr-2 h-4 w-4" />
          Copiar Template
        </Button>
      </CardContent>
    </Card>
  );
}
