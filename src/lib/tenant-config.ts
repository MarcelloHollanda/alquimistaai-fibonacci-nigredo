/**
 * Configuração de tenant para modo "SaaS-Ready"
 * 
 * Atualmente em modo SINGLE-TENANT com tenant fixo.
 * Para ativar multi-tenancy, veja TENANT_MIGRATION.md
 */

// Tenant padrão para modo single-tenant
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

// Flag para indicar se está em modo multi-tenant
export const IS_MULTI_TENANT = false;

/**
 * Obtém o tenant_id atual baseado no modo de operação
 */
export function getCurrentTenantId(): string {
  if (IS_MULTI_TENANT) {
    // No futuro: pegar do auth.user() ou context
    const storedConfig = localStorage.getItem("tenant_config");
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      return config.id || DEFAULT_TENANT_ID;
    }
  }
  
  return DEFAULT_TENANT_ID;
}

/**
 * Helper para adicionar tenant_id em queries Supabase
 * Usar quando as tabelas tiverem a coluna tenant_id
 */
export function withTenantId<T extends Record<string, any>>(data: T): T & { tenant_id: string } {
  return {
    ...data,
    tenant_id: getCurrentTenantId(),
  };
}

/**
 * Helper para filtrar por tenant_id em queries Supabase
 */
export function tenantFilter() {
  return { tenant_id: getCurrentTenantId() };
}
