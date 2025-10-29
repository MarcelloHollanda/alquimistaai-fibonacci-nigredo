# 📊 Configuração do Servidor de Métricas Prometheus

Este documento explica como conectar o frontend Lovable ao seu servidor de métricas Prometheus.

## ✅ Frontend já implementado

O frontend está **100% pronto** para consumir métricas Prometheus do seu backend Node.js/Express. Já inclui:

- ✅ Parser de métricas Prometheus
- ✅ Dashboard com KPIs em tempo real
- ✅ Widget de saúde do sistema
- ✅ Relatórios de qualidade com breakdown de falhas
- ✅ Alertas proativos
- ✅ Fallback automático para dados simulados

## 🔧 Configuração

### 1. Configure a variável de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_METRICS_URL=https://seu-servidor.com
```

**Exemplos:**
- Produção: `VITE_METRICS_URL=https://api.seudominio.com`
- Desenvolvimento local: `VITE_METRICS_URL=http://localhost:3000`
- Homologação: `VITE_METRICS_URL=https://staging-api.seudominio.com`

### 2. Requisitos do backend

Seu servidor Node.js/Express deve expor o endpoint:

```
GET /metrics
```

**Resposta esperada:** Texto no formato Prometheus (conforme o guia que você enviou)

**Exemplo de resposta:**
```
# HELP inbound_total Mensagens recebidas por canal
# TYPE inbound_total counter
inbound_total{canal="whatsapp"} 892
inbound_total{canal="email"} 347

# HELP agendamento_proposta_total Totais de propostas
# TYPE agendamento_proposta_total counter
agendamento_proposta_total{canal="whatsapp"} 145
agendamento_proposta_total{canal="email"} 62

# HELP agendamento_confirmado_total Agendamentos confirmados
# TYPE agendamento_confirmado_total counter
agendamento_confirmado_total{canal="whatsapp"} 98
agendamento_confirmado_total{canal="email"} 41

# HELP agendamento_falha_total Falhas em agendamentos
# TYPE agendamento_falha_total counter
agendamento_falha_total{fase="proposta",erro="timeout"} 12
agendamento_falha_total{fase="confirmacao",erro="calendar_unavailable"} 5

# HELP latency_ms Latência em ms
# TYPE latency_ms histogram
latency_ms_bucket{le="50"} 1234
latency_ms_bucket{le="100"} 2345
latency_ms_bucket{le="250"} 2789
latency_ms_bucket{le="500"} 2890
latency_ms_bucket{le="1000"} 2945
latency_ms_bucket{le="+Inf"} 3000
latency_ms_sum 125678
latency_ms_count 3000
```

### 3. CORS (se backend em domínio diferente)

Seu backend deve permitir requisições do domínio Lovable:

```javascript
// Node.js/Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

## 🚀 Como funciona

### Sem configuração (desenvolvimento)
- Frontend usa **dados simulados** automaticamente
- Exibe alerta informando modo simulado
- Todas as funcionalidades visíveis para desenvolvimento

### Com VITE_METRICS_URL configurada
- Frontend busca métricas do servidor a cada 15 segundos
- Se servidor estiver offline → fallback para dados simulados
- Exibe alertas de erro se conexão falhar

## 📝 Métricas suportadas

O frontend consome automaticamente:

| Métrica | Uso |
|---------|-----|
| `event_total{event_type}` | Eventos processados |
| `inbound_total{canal}` | Mensagens recebidas (WhatsApp/Email) |
| `disparo_total{canal,status}` | Envios por canal |
| `agendamento_proposta_total{canal}` | Propostas de agendamento |
| `agendamento_confirmado_total{canal}` | Agendamentos confirmados |
| `agendamento_falha_total{fase,erro}` | Falhas detalhadas |
| `latency_ms` | Histograma de latência (P50, P95) |

## 🧪 Testando a conexão

1. **Verifique se o endpoint está respondendo:**
   ```bash
   curl http://localhost:3000/metrics
   ```

2. **Configure a variável:**
   ```bash
   echo "VITE_METRICS_URL=http://localhost:3000" > .env
   ```

3. **Reinicie o servidor de desenvolvimento Lovable**

4. **Abra o console do navegador:**
   - ✅ Deve aparecer: `📡 Buscando métricas de http://localhost:3000/metrics...`
   - ✅ Depois: `✅ Métricas recebidas do servidor`

5. **Verifique no Dashboard:**
   - O alerta de "dados simulados" deve desaparecer
   - Métricas reais devem aparecer nos cards

## ⚙️ Configurações avançadas

Edite `src/lib/config.ts` para ajustar:

```typescript
export const METRICS_CONFIG = {
  refetchInterval: 15000,     // Intervalo de atualização (ms)
  timeout: 10000,              // Timeout da requisição (ms)
  useMockFallback: true,       // Fallback para mock em caso de erro
};
```

## 🐛 Troubleshooting

**"Exibindo dados simulados"**
- ✅ Normal: VITE_METRICS_URL não está configurada
- Solução: Configure a variável de ambiente

**"Erro ao conectar ao servidor de métricas"**
- ❌ Servidor offline ou URL incorreta
- Verifique se o backend está rodando
- Verifique CORS
- Confirme que `/metrics` está exposto

**Métricas não atualizam**
- Verifique o console do navegador
- Confirme que o backend está enviando dados atualizados
- Limpe o cache do navegador (Ctrl+Shift+R)

## 📚 Próximos passos

1. **Backend:** Implemente o guia Prometheus que você enviou
2. **Configure:** Adicione `VITE_METRICS_URL` no `.env`
3. **Deploy:** Configure a variável no ambiente de produção
4. **Monitore:** Use o Dashboard e Relatórios para visualizar métricas reais

## 🔗 Links úteis

- [Documentação Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Guia de implementação backend](arquivo enviado pelo usuário)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
