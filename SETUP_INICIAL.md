# 🚀 Setup Inicial - Nigredo

## Criação Automática do Administrador

O sistema Nigredo possui um mecanismo de **setup automático inteligente** que simplifica a configuração inicial.

### Como Funciona

Quando o **primeiro usuário** se cadastra na plataforma:

1. ✅ O sistema detecta automaticamente que é o primeiro cadastro
2. ✅ Atribui automaticamente a **role 'master'** (administrador)
3. ✅ Cria o perfil completo com todas as permissões

### Próximos Usuários

Os usuários subsequentes:

- Recebem automaticamente a **role 'usuario'** (padrão)
- Podem ter suas permissões ajustadas pelo administrador via interface

### Estrutura de Roles

O sistema utiliza as seguintes roles (mapeadas do banco para o frontend):

| Role no Banco | Role no Frontend | Descrição |
|---------------|------------------|-----------|
| `master` / `admin` | `admin` | Administrador com acesso total |
| `gerente` / `gestor` | `gestor` | Gestor com acesso à maioria das funcionalidades |
| `operador` / `usuario` | `operador` | Operador com acesso limitado |
| - | `leitura` | Usuário apenas visualização (atribuído manualmente) |

### Passo a Passo - Primeiro Acesso

1. **Acesse a página de cadastro**: `/auth`
2. **Preencha os dados**:
   - Nome completo
   - E-mail válido
   - Senha (mínimo 6 caracteres)
3. **Clique em "Criar Conta"**
4. **Faça login** com as credenciais criadas
5. **Pronto!** Você já é administrador e pode:
   - Gerenciar usuários
   - Configurar o sistema
   - Acessar todas as funcionalidades

### Funcionalidades do Administrador Master

O primeiro usuário (Master) pode:

- ✅ Gerenciar todos os usuários
- ✅ Atribuir e modificar roles
- ✅ Configurar integrações (WhatsApp, APIs)
- ✅ Acessar todas as páginas do sistema
- ✅ Visualizar e exportar relatórios
- ✅ Configurar campanhas e estratégias
- ✅ Gerenciar aprovações

### Segurança

- ✅ Autenticação via Supabase (segura e criptografada)
- ✅ Tokens JWT com refresh automático
- ✅ RLS (Row Level Security) no banco de dados
- ✅ Verificação de permissões em todas as rotas
- ✅ Auto-confirmação de e-mail ativada para agilidade

### Troubleshooting

**Problema**: "Não consigo criar o primeiro usuário"
- **Solução**: Verifique se o backend está rodando e se o Supabase está configurado

**Problema**: "Não recebi permissões de admin"
- **Solução**: Verifique no banco se já existem outros usuários cadastrados antes

**Problema**: "Erro ao fazer login"
- **Solução**: Verifique se o e-mail e senha estão corretos. A senha deve ter no mínimo 6 caracteres.

### Arquitetura Técnica

O setup automático é implementado através de:

```sql
-- Função PostgreSQL executada automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  -- Conta usuários existentes
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Primeiro usuário = Master, demais = Usuario
  IF user_count <= 1 THEN
    assigned_role := 'master';
  ELSE
    assigned_role := 'usuario';
  END IF;
  
  -- Cria perfil e role
  INSERT INTO public.profiles (id, full_name, tenant_id) VALUES (...);
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, assigned_role);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Esta função é executada **automaticamente** via trigger toda vez que um novo usuário é criado no sistema de autenticação.

---

## 🎯 Próximos Passos

Após criar o primeiro usuário:

1. **Customize a identidade visual** em Configurações
2. **Configure as integrações** (WhatsApp, APIs)
3. **Crie usuários adicionais** via Gerenciamento de Usuários
4. **Importe seus leads** via Upload CSV
5. **Configure suas campanhas** em Estratégia

---

**Desenvolvido com** ⚗️ **pela equipe Alquimista.IA - Nigredo**
