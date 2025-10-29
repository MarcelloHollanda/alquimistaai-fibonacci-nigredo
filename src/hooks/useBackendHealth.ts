import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api';

// Tipos baseados na spec do backend
interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}

interface ApiStatus {
  status: 'running' | 'stopped';
  timestamp: string;
  version: string;
  environment: 'production' | 'development';
}

interface WhatsAppStatus {
  connected: boolean;
  phone?: string;
  status: 'ready' | 'connecting' | 'disconnected';
  last_seen?: string;
}

// Função para verificar health do servidor
async function fetchHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check falhou:', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}

// Função para buscar status da API
async function fetchApiStatus(): Promise<ApiStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Status check falhou:', error);
    return {
      status: 'stopped',
      timestamp: new Date().toISOString(),
      version: 'unknown',
      environment: 'production',
    };
  }
}

// Função para buscar status do WhatsApp
async function fetchWhatsAppStatus(): Promise<WhatsAppStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/status`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar status WhatsApp: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('WhatsApp status indisponível:', error);
    return {
      connected: false,
      status: 'disconnected',
    };
  }
}

// Hooks com retry logic melhorado
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30000, // 30 segundos
    retry: 5, // 5 tentativas (backend pode hibernar)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff até 30s
    staleTime: 10000, // Considera fresh por 10s
  });
}

export function useApiStatus() {
  return useQuery({
    queryKey: ['api-status'],
    queryFn: fetchApiStatus,
    refetchInterval: 60000, // 1 minuto
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
  });
}

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: fetchWhatsAppStatus,
    refetchInterval: 15000, // 15 segundos
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10000,
  });
}
