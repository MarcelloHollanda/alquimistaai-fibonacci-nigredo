# Guia de Multi-Tenancy

## Visão Geral

O sistema implementa isolamento multi-tenant através de `tenant_id` nas tabelas críticas, garantindo que cada empresa (tenant) só acesse seus próprios dados.

## Arquitetura

### 1. Associação Usuário-Tenant

Cada usuário está associado a um tenant através da coluna `tenant_id` na tabela `profiles`:

```sql
-- Tabela profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  ...
);
```

### 2. Função de Segurança

A função `get_user_tenant_id()` retorna o tenant do usuário atual de forma segura:

```sql
CREATE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;
```

### 3. Políticas RLS

As políticas RLS usam `get_user_tenant_id()` para filtrar dados por tenant:

```sql
CREATE POLICY "Usuários podem ver configurações da própria empresa"
ON public.company_settings
FOR SELECT
USING (
  (has_role(auth.uid(), 'master'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND tenant_id = get_user_tenant_id()
);
```

## Modo de Operação

### Single-Tenant (Atual)

- `DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000"`
- Todos os usuários compartilham o mesmo tenant
- Isolamento desabilitado mas estrutura preparada

### Multi-Tenant (Futuro)

Para ativar multi-tenancy completo:

1. **Criar tabela de tenants:**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

2. **Atualizar signup para incluir tenant_id:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      tenant_id: newTenantId, // Gerar ou selecionar tenant
    },
  },
});
```

3. **Aplicar tenant_id a todas as tabelas sensíveis:**
```sql
ALTER TABLE <tabela> ADD COLUMN tenant_id UUID;
CREATE INDEX idx_<tabela>_tenant ON <tabela>(tenant_id);
```

4. **Atualizar políticas RLS:**
```sql
CREATE POLICY "Isolamento por tenant"
ON <tabela>
FOR ALL
USING (tenant_id = get_user_tenant_id());
```

## Segurança

### Proteção de Dados Sensíveis

Tabelas com informações sensíveis (PII) devem ter:
- ✅ RLS habilitado
- ✅ Coluna `tenant_id`
- ✅ Políticas que usam `get_user_tenant_id()`

### Tabelas Protegidas

- `company_settings` - Contatos e informações da empresa
- `user_contacts` - Telefones dos usuários
- `profiles` - Dados dos usuários

### Prevenção de Vazamento

As políticas RLS garantem que:
- Gerentes de Empresa A não veem dados da Empresa B
- Mesmo com role adequado, o acesso é filtrado por tenant
- Queries maliciosas retornam apenas dados do tenant do usuário

## Frontend

### Obter Tenant Atual

```typescript
import { getCurrentTenantId } from "@/lib/tenant-config";

const tenantId = getCurrentTenantId();
```

### Inserir Dados com Tenant

```typescript
import { withTenantId } from "@/lib/tenant-config";

const dataWithTenant = withTenantId({ campo: "valor" });
await supabase.from("tabela").insert(dataWithTenant);
```

### Query com Filtro de Tenant

```typescript
import { tenantFilter } from "@/lib/tenant-config";

const { data } = await supabase
  .from("tabela")
  .select("*")
  .match(tenantFilter()); // Adiciona WHERE tenant_id = <current>
```

## Checklist de Implementação

Para adicionar isolamento de tenant a uma nova tabela:

- [ ] Adicionar coluna `tenant_id UUID NOT NULL`
- [ ] Criar índice em `tenant_id`
- [ ] Habilitar RLS na tabela
- [ ] Criar políticas que usam `get_user_tenant_id()`
- [ ] Atualizar inserts no frontend para incluir `tenant_id`
- [ ] Testar com múltiplos tenants

## Migração de Dados

Ao ativar multi-tenancy em sistema existente:

```sql
-- 1. Backup dos dados
CREATE TABLE backup_<tabela> AS SELECT * FROM <tabela>;

-- 2. Adicionar tenant_id
ALTER TABLE <tabela> ADD COLUMN tenant_id UUID;

-- 3. Atribuir tenant padrão aos dados existentes
UPDATE <tabela> SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- 4. Tornar NOT NULL
ALTER TABLE <tabela> ALTER COLUMN tenant_id SET NOT NULL;

-- 5. Criar índice
CREATE INDEX idx_<tabela>_tenant ON <tabela>(tenant_id);
```

## Troubleshooting

### Usuário não vê dados

1. Verificar se usuário tem `tenant_id` em `profiles`
2. Confirmar que políticas RLS usam `get_user_tenant_id()`
3. Verificar se dados têm `tenant_id` preenchido

### Erro "violates row-level security"

- Certifique-se que inserts incluem `tenant_id`
- Verifique se usuário tem role adequado
- Confirme que `tenant_id` do insert = `tenant_id` do usuário
