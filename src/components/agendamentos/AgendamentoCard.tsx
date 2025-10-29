import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor, getTipoIcon } from '@/hooks/useAgendamentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoCardProps {
  agendamento: {
    id: string;
    razao_social: string;
    tipo: string;
    data_hora: string;
    status: string;
    resumo_comercial?: {
      fit_comercial?: {
        score: number;
        categoria: string;
      };
      sentimento_atual?: {
        sentimento: string;
        intensidade: number;
      };
      conversas_recentes?: number;
    };
    notas?: string;
  };
  onStatusChange?: (id: string, status: string) => void;
}

export function AgendamentoCard({ agendamento, onStatusChange }: AgendamentoCardProps) {
  const { id, razao_social, tipo, data_hora, status, resumo_comercial, notas } = agendamento;
  
  const dataFormatada = format(new Date(data_hora), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTipoIcon(tipo)}</span>
            <div>
              <CardTitle className="text-lg">{razao_social}</CardTitle>
              <p className="text-sm text-muted-foreground">{dataFormatada}</p>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Comercial - GAP 1 IMPLEMENTADO */}
        {resumo_comercial && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">📊 Resumo Comercial</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {resumo_comercial.fit_comercial && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fit:</span>
                  <Badge variant="outline">
                    {resumo_comercial.fit_comercial.categoria} ({resumo_comercial.fit_comercial.score}/100)
                  </Badge>
                </div>
              )}
              
              {resumo_comercial.sentimento_atual && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sentimento:</span>
                  <Badge variant="outline">
                    {resumo_comercial.sentimento_atual.sentimento}
                  </Badge>
                </div>
              )}
              
              {resumo_comercial.conversas_recentes !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Conversas:</span>
                  <span className="font-medium">{resumo_comercial.conversas_recentes}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {notas && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Notas:</p>
            <p className="italic">{notas}</p>
          </div>
        )}
        
        {status === 'agendado' && onStatusChange && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(id, 'confirmado')}
            >
              ✓ Confirmar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(id, 'cancelado')}
            >
              ✕ Cancelar
            </Button>
          </div>
        )}
        
        {status === 'confirmado' && onStatusChange && (
          <Button
            size="sm"
            onClick={() => onStatusChange(id, 'concluido')}
          >
            ✓ Marcar como Concluído
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
