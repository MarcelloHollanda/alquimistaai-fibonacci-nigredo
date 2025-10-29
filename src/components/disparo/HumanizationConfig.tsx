import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Hand, PenTool, Smile, Info } from "lucide-react";
import { useState } from "react";

export function HumanizationConfig() {
  const [level, setLevel] = useState("2");

  const levels = [
    {
      value: "0",
      icon: Bot,
      label: "🤖 Nível 0: Robô",
      description: "Sem variação, mensagens idênticas",
      example: "Olá. Gostaria de agendar uma reunião.",
      recommended: false,
    },
    {
      value: "1",
      icon: Hand,
      label: "👋 Nível 1: Cumprimentos",
      description: "Variações em saudações (Olá/Oi/Bom dia)",
      example: "Oi! Gostaria de agendar uma reunião.",
      recommended: false,
    },
    {
      value: "2",
      icon: PenTool,
      label: "✍️ Nível 2: Pontuação Natural",
      description: "Variações em pontuação e estrutura de frases",
      example: "Oi, tudo bem? Gostaria de agendar uma reunião :)",
      recommended: true,
    },
    {
      value: "3",
      icon: Smile,
      label: "😊 Nível 3: Emojis + Tom Casual",
      description: "Tom conversacional com emojis e gírias",
      example: "E aí, blz? 😊 Vamos marcar aquela call?",
      recommended: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Nível de Humanização
        </CardTitle>
        <CardDescription>
          Escolha o nível de variação natural nas mensagens para evitar detecção como spam
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={level} onValueChange={setLevel}>
          <div className="space-y-4">
            {levels.map((levelConfig) => {
              const Icon = levelConfig.icon;
              const isSelected = level === levelConfig.value;
              
              return (
                <div
                  key={levelConfig.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setLevel(levelConfig.value)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={levelConfig.value} id={`level-${levelConfig.value}`} />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`level-${levelConfig.value}`}
                        className="flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                        {levelConfig.label}
                        {levelConfig.recommended && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Recomendado
                          </span>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {levelConfig.description}
                      </p>
                      <div className="bg-muted p-2 rounded text-xs font-mono">
                        {levelConfig.example}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuração Backend:</strong> Para aplicar a humanização, configure a variável de ambiente{" "}
            <code className="bg-muted px-1 py-0.5 rounded">HUMANIZATION_LEVEL={level}</code> no Replit Secrets.
            <br />
            <span className="text-xs text-muted-foreground">
              Níveis mais altos aumentam naturalidade mas podem gerar variações inesperadas.
            </span>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm font-medium">Nível Atual</p>
            <p className="text-2xl font-bold text-primary">{level}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {level === "0" ? "⚠️ Sem proteção anti-spam" : "✅ Humanização ativa"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
