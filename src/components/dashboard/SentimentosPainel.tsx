import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, Flame, AlertCircle } from 'lucide-react';

export function SentimentosPainel() {
  // TODO: Integrar com endpoint GET /api/sentimento/estatisticas/global
  const stats = {
    empolgado: 12,
    positivo: 34,
    neutro: 18,
    negativo: 5,
    irritado: 2,
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  const sentimentos = [
    { 
      key: 'empolgado', 
      label: 'Empolgados', 
      icon: Flame, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      key: 'positivo', 
      label: 'Positivos', 
      icon: Smile, 
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      key: 'neutro', 
      label: 'Neutros', 
      icon: Meh, 
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20'
    },
    { 
      key: 'negativo', 
      label: 'Negativos', 
      icon: Frown, 
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    { 
      key: 'irritado', 
      label: 'Irritados', 
      icon: AlertCircle, 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panorama de Sentimentos</CardTitle>
        <CardDescription>
          Distribuição emocional de {total} leads ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {sentimentos.map(({ key, label, icon: Icon, color, bgColor }) => (
            <div
              key={key}
              className={`${bgColor} rounded-lg p-4 text-center transition-transform hover:scale-105`}
            >
              <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
              <div className="text-3xl font-bold">{stats[key as keyof typeof stats]}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
              <div className="text-xs text-muted-foreground">
                {((stats[key as keyof typeof stats] / total) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
