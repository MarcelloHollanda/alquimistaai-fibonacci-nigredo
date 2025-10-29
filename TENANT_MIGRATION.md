# Migração SaaS-Ready - Guia de Implementação

## Status Atual: SINGLE-TENANT (SaaS-Ready)

O sistema está preparado para multi-tenancy mas atualmente opera em **modo single-tenant** com `tenant_id` fixo: `00000000-0000-0000-0000-000000000000`.

---

## Fase 1: Preparação Database (Supabase) ✅ PENDENTE

### 1.1 - Migration SQL: Adicionar `tenant_id` em todas as tabelas

Execute esta migration no Supabase SQL Editor:

```sql
-- ==================================================================
-- MIGRATION: Adicionar tenant_id em todas as tabelas (SaaS-Ready)
-- Versão: 1.0
-- Data: 2025-01-XX
-- ==================================================================

-- Tenant padrão para modo single-tenant
DO $$
DECLARE
  default_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'leads', 'empresas', 'mensagens_modelo', 'campanhas', 'disparos',
    'conversas', 'agentes', 'agendamentos', 'dnc_list', 'aprovacoes',
    'outbox_whatsapp', 'outbox_email', 'outbox_calendar', 'metrics_cache',
    'whatsapp_integrations', 'gmail_integrations', 'calendar_integrations',
    'webhooks_config', 'user_roles', 'audit_log', 'tenant_settings',
    'rate_limits', 'api_keys'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    -- Step 1: Adicionar coluna como NULL
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id UUID', table_name);
    
    -- Step 2: Preencher com valor padrão
    EXECUTE format('UPDATE %I SET tenant_id = $1 WHERE tenant_id IS NULL', table_name)
    USING default_tenant_id;
    
    -- Step 3: Tornar NOT NULL e adicionar DEFAULT
    EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', table_name);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET DEFAULT $1', table_name)
    USING default_tenant_id;
    
    RAISE NOTICE 'Tabela % atualizada com tenant_id', table_name;
  END LOOP;
END $$;

-- Criar índices compostos para queries com tenant_id
CREATE INDEX IF NOT EXISTS idx_leads_tenant_lote ON leads(tenant_id, lote_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_empresas_tenant ON empresas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_tenant ON mensagens_modelo(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_tenant_status ON campanhas(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_disparos_tenant_campanha ON disparos(tenant_id, campanha_id);
CREATE INDEX IF NOT EXISTS idx_conversas_tenant_lead ON conversas(tenant_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_agentes_tenant ON agentes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_outbox_wa_tenant_status ON outbox_whatsapp(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_outbox_email_tenant_status ON outbox_email(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_timestamp ON metrics_cache(tenant_id, timestamp);

-- Criar tabela de tenants (para futura ativação multi-tenant)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}'::jsonb
);

-- Inserir tenant padrão
INSERT INTO tenants (id, name, slug, is_active, plan)
VALUES ('00000000-0000-0000-0000-000000000000', 'Núcleo de Prospecção', 'default', true, 'enterprise')
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'Migration SaaS-Ready concluída com sucesso!';
```

### 1.2 - Verificação

```sql
-- Verificar se todas as tabelas têm tenant_id
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
ORDER BY table_name;

-- Verificar quantidade de registros por tenant
SELECT 
  'leads' as table_name, 
  tenant_id, 
  COUNT(*) as total 
FROM leads 
GROUP BY tenant_id
UNION ALL
SELECT 
  'empresas' as table_name, 
  tenant_id, 
  COUNT(*) as total 
FROM empresas 
GROUP BY tenant_id;
-- Repetir para outras tabelas críticas
```

---

## Fase 2: Backend (Replit) ✅ PENDENTE

### 2.1 - Criar Middleware `monoTenant`

Criar arquivo `backend/src/middleware/monoTenant.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
}

// Estender o Request do Express
declare global {
  namespace Express {
    interface Request {
      tenant: TenantContext;
    }
  }
}

/**
 * Middleware para modo single-tenant (SaaS-Ready)
 * Injeta tenant fixo em todas as requests
 */
export function monoTenant() {
  return (req: Request, res: Response, next: NextFunction) => {
    req.tenant = {
      tenantId: DEFAULT_TENANT_ID,
      tenantName: 'default',
    };
    next();
  };
}
```

### 2.2 - Registrar Middleware no Express

Em `backend/src/index.ts`:

```typescript
import { monoTenant } from './middleware/monoTenant';

// Registrar ANTES das rotas
app.use(monoTenant());
```

### 2.3 - Criar Tenant Helpers

Criar arquivo `backend/src/db/tenantHelpers.ts`:

```typescript
import { Pool } from 'pg';

/**
 * Helpers para queries com tenant_id automático
 */

export async function insertWithTenant(
  pool: Pool,
  table: string,
  data: Record<string, any>,
  tenantId: string
) {
  const columns = [...Object.keys(data), 'tenant_id'];
  const values = [...Object.values(data), tenantId];
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function selectWithTenant(
  pool: Pool,
  table: string,
  tenantId: string,
  filters: Record<string, any> = {}
) {
  const allFilters = { ...filters, tenant_id: tenantId };
  const whereClause = Object.keys(allFilters)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(' AND ');
  
  const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
  const result = await pool.query(query, Object.values(allFilters));
  return result.rows;
}

export async function updateWithTenant(
  pool: Pool,
  table: string,
  id: string,
  data: Record<string, any>,
  tenantId: string
) {
  const setClauses = Object.keys(data)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');
  
  const values = [...Object.values(data), tenantId, id];
  const query = `
    UPDATE ${table}
    SET ${setClauses}
    WHERE tenant_id = $${values.length - 1} AND id = $${values.length}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteWithTenant(
  pool: Pool,
  table: string,
  id: string,
  tenantId: string
) {
  const query = `DELETE FROM ${table} WHERE tenant_id = $1 AND id = $2`;
  await pool.query(query, [tenantId, id]);
}
```

### 2.4 - Atualizar Rotas Críticas

Exemplo em `backend/src/routes/leads.ts`:

```typescript
import { insertWithTenant, selectWithTenant } from '../db/tenantHelpers';

// ANTES:
// const result = await pool.query('INSERT INTO leads (nome, email) VALUES ($1, $2)', [nome, email]);

// DEPOIS:
const lead = await insertWithTenant(pool, 'leads', { nome, email }, req.tenant.tenantId);

// QUERIES:
// ANTES:
// const leads = await pool.query('SELECT * FROM leads WHERE status = $1', ['ativo']);

// DEPOIS:
const leads = await selectWithTenant(pool, 'leads', req.tenant.tenantId, { status: 'ativo' });
```

---

## Fase 3: Prometheus Metrics ✅ PENDENTE

### 3.1 - Adicionar Label `tenant` nas métricas

Em `backend/src/lib/metrics.ts`:

```typescript
// ANTES:
whatsappMessagesSent.inc();

// DEPOIS:
whatsappMessagesSent.inc({ tenant: req.tenant.tenantId });

// Atualizar todas as métricas:
const whatsappMessagesSent = new promClient.Counter({
  name: 'whatsapp_messages_sent_total',
  help: 'Total de mensagens WhatsApp enviadas',
  labelNames: ['tenant', 'status'], // Adicionar 'tenant'
});
```

---

## Fase 4: Workers (Outbox Pattern) ✅ PENDENTE

### 4.1 - Filtrar por tenant_id nos workers

Em `backend/src/workers/whatsappWorker.ts`:

```typescript
const TENANT_ID = process.env.TENANT_ID || '00000000-0000-0000-0000-000000000000';

// ANTES:
const items = await pool.query(`
  SELECT * FROM outbox_whatsapp 
  WHERE status = 'pending' 
  ORDER BY created_at ASC 
  LIMIT 100
`);

// DEPOIS:
const items = await pool.query(`
  SELECT * FROM outbox_whatsapp 
  WHERE status = 'pending' 
    AND tenant_id = $1
  ORDER BY created_at ASC 
  LIMIT 100
`, [TENANT_ID]);
```

---

## Como Ativar Multi-Tenancy no Futuro

Quando decidir ativar multi-tenancy:

1. **Frontend (Lovable):**
   - Alterar `IS_MULTI_TENANT = true` em `src/lib/tenant-config.ts`
   - Implementar seleção de tenant no login
   - Armazenar `tenant_id` no Supabase Auth (`app_metadata`)

2. **Backend (Replit):**
   - Substituir `monoTenant()` por `multiTenant()` que lê de JWT/header
   - Criar tabela `tenant_integrations` para credenciais isoladas
   - Implementar rate limiting por tenant

3. **Database (Supabase):**
   - Habilitar RLS em todas as tabelas
   - Criar políticas: `WHERE tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'`

---

## Rollback (Se Necessário)

```sql
-- Remover tenant_id de todas as tabelas
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY['leads', 'empresas', ...]; -- lista completa
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS tenant_id', table_name);
  END LOOP;
END $$;

DROP TABLE IF EXISTS tenants;
```

---

## Checklist de Validação

- [ ] Migration SQL executada no Supabase
- [ ] Todas as 23 tabelas têm coluna `tenant_id NOT NULL DEFAULT '00000000-...'`
- [ ] Índices compostos criados
- [ ] Middleware `monoTenant()` implementado no backend
- [ ] Helpers `insertWithTenant` funcionando
- [ ] Métricas Prometheus com label `tenant`
- [ ] Workers filtrando por `tenant_id`
- [ ] Sistema funcionando normalmente (sem quebras)
- [ ] Documentação atualizada

---

## Estimativa de Tempo

- **Database Migration**: 30min
- **Backend Middleware**: 1-2h
- **Tenant Helpers**: 1h
- **Atualização de Rotas**: 2-3h (depende do número de endpoints)
- **Workers**: 30min
- **Métricas**: 30min
- **Testes**: 1h

**Total**: ~6-8 horas de trabalho

---

## Suporte

Dúvidas ou problemas? Consulte:
- `src/lib/tenant-config.ts` - Configuração frontend
- `METRICS_SETUP.md` - Setup de métricas
- Documentação Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
