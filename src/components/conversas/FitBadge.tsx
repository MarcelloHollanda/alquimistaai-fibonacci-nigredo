import { Badge } from '@/components/ui/badge';
import { useFitComercial, getCategoriaConfig } from '@/hooks/useFitComercial';
import { Skeleton } from '@/components/ui/skeleton';

interface FitBadgeProps {
  leadId: string;
  showScore?: boolean;
}

export function FitBadge({ leadId, showScore = true }: FitBadgeProps) {
  const { fit, loading } = useFitComercial(leadId);

  if (loading) {
    return <Skeleton className="h-6 w-32" />;
  }

  if (!fit) return null;

  const config = getCategoriaConfig(fit.categoria);

  return (
    <Badge className={config.color}>
      {config.label}
      {showScore && ` (${fit.score}/100)`}
    </Badge>
  );
}
