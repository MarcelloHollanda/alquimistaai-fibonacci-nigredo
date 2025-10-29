import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LeadIrritado {
  id: string;
  nome: string;
  ultima_mensagem: string;
  intensidade: number;
}

export function AlertasLeadsIrritados() {
  const [leadsIrritados, setLeadsIrritados] = useState<LeadIrritado[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implementar pooling ou WebSocket
    // GET /api/sentimento/alertas?sentimento=irritado&horas=24
    
    const interval = setInterval(() => {
      // Simular dados para demonstração
      // Substituir por chamada real à API
      setLeadsIrritados([
        {
          id: 'lead_123',
          nome: 'João Silva',
          ultima_mensagem: 'Já falei que não tenho interesse!',
          intensidade: 9,
        },
        {
          id: 'lead_456',
          nome: 'Maria Santos',
          ultima_mensagem: 'Parem de me enviar mensagens',
          intensidade: 8,
        },
      ]);
    }, 30000); // A cada 30s

    return () => clearInterval(interval);
  }, []);

  if (leadsIrritados.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">
        ⚠️ {leadsIrritados.length} lead(s) irritado(s) detectados
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Atenção necessária imediata para evitar churn e problemas de reputação.
        </p>
        <div className="space-y-2">
          {leadsIrritados.map((lead) => (
            <div
              key={lead.id}
              className="bg-background p-3 rounded-lg border border-destructive/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{lead.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    "{lead.ultima_mensagem}"
                  </p>
                  <p className="text-xs mt-1">
                    Intensidade: {lead.intensidade}/10
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/conversas')}
                  variant="outline"
                >
                  Atender Agora
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
