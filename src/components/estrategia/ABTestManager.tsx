import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ABTest, ABTestVariant } from "@/types/strategy";
import { FlaskConical, TrendingUp, Crown, Play, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ABTestManagerProps {
  tests: ABTest[];
  onCreateTest?: () => void;
  onStartTest?: (testId: string) => void;
}

export function ABTestManager({ tests, onCreateTest, onStartTest }: ABTestManagerProps) {
  const [selectedStage, setSelectedStage] = useState<'TOPO' | 'MEIO' | 'FUNDO'>('TOPO');

  const activeTests = tests.filter(t => t.variants.some(v => v.status === 'running'));
  const completedTests = tests.filter(t => t.variants.some(v => v.status === 'completed'));

  const getVariantBadge = (variant: ABTestVariant) => {
    if (variant.status === 'winner') {
      return <Badge className="bg-yellow-500"><Crown className="h-3 w-3 mr-1" />Vencedor</Badge>;
    }
    if (variant.status === 'running') {
      return <Badge variant="default"><Play className="h-3 w-3 mr-1" />Rodando</Badge>;
    }
    if (variant.status === 'completed') {
      return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completo</Badge>;
    }
    return <Badge variant="outline">Rascunho</Badge>;
  };

  const stageTests = tests.filter(t => t.stage === selectedStage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Testes A/B Automáticos
        </CardTitle>
        <CardDescription>
          Otimização contínua de mensagens através de testes comparativos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-primary">{activeTests.length}</p>
            <p className="text-sm text-muted-foreground">Testes Ativos</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTests.length}
            </p>
            <p className="text-sm text-muted-foreground">Completados</p>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {tests.reduce((acc, t) => acc + t.variants.filter(v => v.status === 'winner').length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Vencedores</p>
          </div>
        </div>

        {/* Tabs por Estágio */}
        <Tabs value={selectedStage} onValueChange={(v) => setSelectedStage(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="TOPO">TOPO</TabsTrigger>
            <TabsTrigger value="MEIO">MEIO</TabsTrigger>
            <TabsTrigger value="FUNDO">FUNDO</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStage} className="space-y-4 mt-4">
            {stageTests.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Nenhum teste A/B configurado para {selectedStage}. Crie seu primeiro teste para começar a otimizar.
                </AlertDescription>
              </Alert>
            ) : (
              stageTests.map(test => (
                <div key={test.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Amostra: {test.sample_size} leads
                      </p>
                    </div>
                    {test.variants.every(v => v.status === 'draft') && onStartTest && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartTest(test.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Teste
                      </Button>
                    )}
                  </div>

                  {/* Variantes */}
                  <div className="space-y-3">
                    {test.variants.map(variant => (
                      <div 
                        key={variant.id}
                        className="border rounded-lg p-3 bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{variant.name}</span>
                              {getVariantBadge(variant)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {variant.template}
                            </p>
                          </div>
                        </div>

                        {variant.metrics && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Enviadas</p>
                              <p className="text-sm font-semibold">{variant.metrics.sent}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Aberturas</p>
                              <p className="text-sm font-semibold">{variant.metrics.opened}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Taxa Abertura</p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {variant.metrics.open_rate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Taxa Resposta</p>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {variant.metrics.reply_rate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {onCreateTest && (
          <Button onClick={onCreateTest} variant="outline" className="w-full">
            <FlaskConical className="h-4 w-4 mr-2" />
            Criar Novo Teste A/B
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
