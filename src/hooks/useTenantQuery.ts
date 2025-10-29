import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentTenantId, withTenantId, tenantFilter } from "@/lib/tenant-config";
import { toast } from "sonner";

/**
 * Hook para queries Supabase com tenant_id automático
 * 
 * IMPORTANTE: Só funciona quando as tabelas tiverem a coluna tenant_id
 * Atualmente em preparação para SaaS-Ready
 */

interface UseTenantQueryOptions<T> {
  table: string;
  queryKey: string[];
  select?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
}

/**
 * Query automática com tenant_id
 * 
 * NOTA: Atualmente comentado pois as tabelas ainda não têm tenant_id
 * Descomentar após executar a migration SQL do TENANT_MIGRATION.md
 */
export function useTenantQuery<T = any>({
  table,
  queryKey,
  select = "*",
  filters = {},
  enabled = true,
}: UseTenantQueryOptions<T>) {
  return useQuery({
    queryKey: [...queryKey, getCurrentTenantId()],
    queryFn: async () => {
      // @ts-ignore - Tabela genérica, tipos serão validados em runtime
      let query = supabase.from(table).select(select);

      // Adicionar filtro de tenant (quando coluna existir)
      // @ts-ignore
      query = query.eq("tenant_id", getCurrentTenantId());

      // Adicionar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        // @ts-ignore
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;
      return data as T[];
    },
    enabled,
  });
}

/**
 * Insert automático com tenant_id
 * 
 * NOTA: Descomentar após executar a migration SQL
 */
export function useTenantInsert<T = any>(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const dataWithTenant = withTenantId(data);

      // @ts-ignore - Tabela genérica
      const query: any = supabase.from(table);
      const { data: result, error } = await query
        .insert(dataWithTenant)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey, getCurrentTenantId()] });
      toast.success("Registro criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });
}

/**
 * Update automático com tenant_id
 * 
 * NOTA: Descomentar após executar a migration SQL
 */
export function useTenantUpdate<T = any>(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // @ts-ignore - Tabela genérica
      const query: any = supabase.from(table);
      const { data: result, error } = await query
        .update(data)
        .eq("id", id)
        .eq("tenant_id", getCurrentTenantId()) // Garantir tenant isolation
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey, getCurrentTenantId()] });
      toast.success("Registro atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

/**
 * Delete automático com tenant_id
 * 
 * NOTA: Descomentar após executar a migration SQL
 */
export function useTenantDelete(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // @ts-ignore - Tabela genérica
      const query: any = supabase.from(table);
      const { error } = await query
        .delete()
        .eq("id", id)
        .eq("tenant_id", getCurrentTenantId()); // Garantir tenant isolation

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey, getCurrentTenantId()] });
      toast.success("Registro excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
}
