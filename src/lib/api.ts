import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

// URL base do backend C3 no Replit
const API_URL = import.meta.env.VITE_API_URL || "https://middleware-c-3-C3Comercial.replit.app";
const TENANT_KEY = import.meta.env.VITE_TENANT_KEY || "demo";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://middleware-c-3-C3Comercial.replit.app';

// Legacy axios instance (mantido para compatibilidade)
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Tenant": TENANT_KEY,
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Novo helper SaaS-Ready para requests à API
 * Adiciona automaticamente trace ID e headers necessários
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Trace-ID': uuidv4(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// T4/T5 API Integration
export { API_BASE_URL };

export default api;
