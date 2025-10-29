import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Mustache from "mustache";
import { MessageSquare } from "lucide-react";

interface TemplatePreviewProps {
  template: string;
  variables?: Record<string, string>;
  title?: string;
  showVariables?: boolean;
}

export function TemplatePreview({ 
  template, 
  variables = {}, 
  title = "Preview",
  showVariables = true 
}: TemplatePreviewProps) {
  // Renderizar template com Mustache
  const rendered = Mustache.render(template, variables);

  // Extrair variáveis do template
  const extractedVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]);
  const uniqueVars = [...new Set(extractedVars)];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {title}
          </CardTitle>
          {uniqueVars.length > 0 && (
            <Badge variant="secondary">{uniqueVars.length} variáveis</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template original */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Template Original</div>
          <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
            {template}
          </div>
        </div>

        {/* Variáveis detectadas */}
        {showVariables && uniqueVars.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Variáveis Detectadas</div>
            <div className="flex flex-wrap gap-2">
              {uniqueVars.map((varName) => (
                <Badge key={varName} variant="outline">
                  {varName}: {variables[varName] || '(não fornecido)'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preview renderizado */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Preview Renderizado</div>
          <div className="bg-card border rounded-md p-4 text-sm whitespace-pre-wrap">
            {rendered}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
