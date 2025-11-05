# Deploy do Projeto C3 Comercial no Replit

Este guia explica passo a passo como fazer o deploy deste projeto no Replit.

## 📋 Pré-requisitos

- Conta no [Replit](https://replit.com)
- Conta no [GitHub](https://github.com) (para importar o repositório)
- Acesso às credenciais do Lovable Cloud/Supabase

## 🚀 Passo 1: Conectar Lovable ao GitHub

1. No editor Lovable, clique em **GitHub** → **Connect to GitHub**
2. Autorize o Lovable GitHub App
3. Selecione a conta/organização onde o repositório será criado
4. Clique em **Create Repository** para gerar um novo repositório com o código do projeto

> **Nota**: O Lovable mantém sincronização bidirecional com o GitHub. Mudanças no Lovable são automaticamente enviadas ao GitHub e vice-versa.

## 📦 Passo 2: Importar Repositório no Replit

1. Acesse [Replit.com](https://replit.com) e faça login
2. Clique em **+ Create Repl**
3. Selecione **Import from GitHub**
4. Cole a URL do repositório criado no Passo 1
5. Clique em **Import from GitHub**

O Replit irá clonar o repositório e configurar automaticamente o ambiente.

## 🔐 Passo 3: Configurar Variáveis de Ambiente

No Replit, as variáveis de ambiente são chamadas de **Secrets** e devem ser configuradas para o projeto funcionar corretamente.

### Como adicionar Secrets:

1. No seu Repl, clique no ícone de **cadeado** (🔒) na barra lateral esquerda
2. Ou vá em **Tools** → **Secrets**

### Variáveis obrigatórias:

Adicione cada uma dessas variáveis com seus respectivos valores:

#### Configurações do Supabase (Lovable Cloud)
```
VITE_SUPABASE_URL=https://mhfyayefabejyrrzrnwa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZnlheWVmYWJlanlycnpybndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2OTI2MDQsImV4cCI6MjA3NzI2ODYwNH0.Pghbaexr1J6aRWmsIyPMOXY29WqBe5bf8UTvMy5ib80
VITE_SUPABASE_PROJECT_ID=mhfyayefabejyrrzrnwa
```

#### Configurações da API Backend
```
VITE_API_URL=https://2ad44573-a35e-4fd8-8bd8-539a30e1cd72-00-21nube1itjgz7.spock.replit.dev
VITE_METRICS_URL=https://2ad44573-a35e-4fd8-8bd8-539a30e1cd72-00-21nube1itjgz7.spock.replit.dev
```

#### Configuração Multi-tenant
```
VITE_TENANT_ID=00000000-0000-0000-0000-000000000000
```

> **⚠️ Importante**: 
> - Substitua as URLs `VITE_API_URL` e `VITE_METRICS_URL` pela URL do seu backend Node.js/Express no Replit
> - As credenciais do Supabase devem ser mantidas em segredo
> - Nunca commite o arquivo `.env` no Git

## ⚙️ Passo 4: Configurar Comandos de Execução

O Replit deve detectar automaticamente o projeto como um projeto Node.js/Vite. Caso precise configurar manualmente:

### 4.1 Configurar `.replit`

Crie ou edite o arquivo `.replit` na raiz do projeto:

```toml
run = "npm run dev"
entrypoint = "src/main.tsx"

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "npm run build && npm run preview"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 8080
externalPort = 80
```

### 4.2 Instalar Dependências

No Shell do Replit, execute:

```bash
npm install
```

Ou se preferir usar Bun (mais rápido):

```bash
curl -fsSL https://bun.sh/install | bash
bun install
```

## ▶️ Passo 5: Executar o Projeto

### Modo Desenvolvimento

Clique no botão **Run** no topo do Replit, ou execute no Shell:

```bash
npm run dev
```

O Vite iniciará o servidor de desenvolvimento na porta **8080**.

### Modo Produção

Para build de produção:

```bash
npm run build
npm run preview
```

## 🌐 Passo 6: Acessar a Aplicação

Após executar o projeto:

1. O Replit abrirá automaticamente uma janela de preview
2. A URL será algo como: `https://[seu-projeto].replit.app`
3. Clique em **Open in new tab** para visualizar em tela cheia

## 🔧 Troubleshooting

### Erro: "Table does not exist"

Se você encontrar erros relacionados a tabelas não existentes no Supabase:

1. As tabelas são criadas automaticamente pelo Lovable Cloud
2. Certifique-se de que as credenciais do Supabase estão corretas
3. Verifique se as migrações em `supabase/migrations/` foram aplicadas

### Erro: "Failed to fetch"

Se a API backend não responder:

1. Verifique se as URLs em `VITE_API_URL` e `VITE_METRICS_URL` estão corretas
2. Certifique-se de que o backend está rodando
3. Verifique CORS no backend

### Tipos do Supabase desatualizados

Os tipos TypeScript do Supabase são auto-gerados. Se houver erros de tipo:

1. No Lovable, os tipos são regenerados automaticamente
2. No Replit, você pode precisar regenerar manualmente
3. Os erros de tipo não impedem a execução, apenas o TypeScript checker

### Performance lenta

O Replit pode ser mais lento que o ambiente Lovable:

- Considere usar a versão gratuita do Replit para testes
- Para produção, considere deploy em Vercel, Netlify ou Cloudflare Pages
- O backend pode precisar de um plano pago do Replit para melhor performance

## 📚 Recursos Adicionais

- [Documentação do Replit](https://docs.replit.com/)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do Lovable](https://docs.lovable.dev/)
- [Documentação do Supabase](https://supabase.com/docs)

## 🔄 Sincronização com Lovable

Lembre-se que o repositório GitHub está sincronizado bidirecionalmente:

- **Lovable → GitHub → Replit**: Mudanças no Lovable são automaticamente enviadas ao GitHub
- **Replit → GitHub → Lovable**: Commits no Replit podem ser enviados ao GitHub e sincronizados de volta ao Lovable

Para manter sincronização:

1. No Replit, faça commits e push para o GitHub normalmente
2. As mudanças aparecerão automaticamente no Lovable
3. Vice-versa: mudanças no Lovable aparecem no GitHub e podem ser puxadas no Replit

## 📞 Suporte

Para problemas específicos:
- **Lovable**: [Discord da comunidade Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Replit**: [Fórum de suporte do Replit](https://ask.replit.com/)
- **Supabase**: [Discord do Supabase](https://discord.supabase.com/)

---

**Última atualização**: 2025-11-05
