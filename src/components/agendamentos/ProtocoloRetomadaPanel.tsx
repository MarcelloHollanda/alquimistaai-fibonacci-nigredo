import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProtocoloRetomada, getPrioridadeConfig } from '@/hooks/useProtocoloRetomada';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProtocoloRetomadaPanel() {
  const { protocolos, loading, executarRetomada, adiarRetomada } = useProtocoloRetomada();

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (protocolos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">✅ Nenhuma retomada pendente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔄 Protocolo de Retomada - GAP 2</span>
          <Badge variant="outline">{protocolos.length} pendente(s)</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {protocolos.map((protocolo) => {
          const prioridadeConfig = getPrioridadeConfig(protocolo.prioridade);
          
          return (
            <div
              key={protocolo.id}
              className={`p-4 border rounded-lg ${prioridadeConfig.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{protocolo.razao_social}</h4>
                  <p className="text-sm opacity-80">
                    {protocolo.tipo_acao.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <Badge className={prioridadeConfig.color}>
                  {prioridadeConfig.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="opacity-80">Sem resposta há:</span>
                  <p className="font-semibold">{protocolo.dias_sem_resposta} dias</p>
                </div>
                <div>
                  <span className="opacity-80">Próximo contato:</span>
                  <p className="font-semibold">
                    {format(new Date(protocolo.proximo_contato), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {protocolo.mensagem_sugerida && (
                <div className="bg-background/50 p-3 rounded mb-3">
                  <p className="text-sm font-medium mb-1">💬 Mensagem Sugerida:</p>
                  <p className="text-sm italic">{protocolo.mensagem_sugerida}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => executarRetomada(protocolo.id)}
                >
                  📤 Executar Retomada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adiarRetomada(protocolo.id, 3)}
                >
                  ⏰ Adiar 3 dias
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
