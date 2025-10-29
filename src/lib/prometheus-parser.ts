export type Counter = Record<string, number>;

export interface Histogram {
  buckets: { le: number; value: number }[];
  count: number;
  sum: number;
}

export interface Metrics {
  event_total: Counter;
  inbound_total: Counter;
  disparo_total: Record<string, number>;
  agendamento_proposta_total: Counter;
  agendamento_confirmado_total: Counter;
  agendamento_falha_total: Record<string, number>;
  latency_ms: Histogram;
  p50?: number;
  p95?: number;
}

const RX = {
  sample: /^([a-zA-Z_:][a-zA-Z0-9_:]*)\{?([^}]*)\}?\s+([+-]?\d+(\.\d+)?([eE][+-]?\d+)?)$/,
  label: /(\w+)\s*=\s*"(.*?)"/g,
};

function parseLabels(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!s) return out;
  let m: RegExpExecArray | null;
  while ((m = RX.label.exec(s))) out[m[1]] = m[2];
  return out;
}

function pushCounter(dst: Counter, key: string, v: number) {
  dst[key] = (dst[key] ?? 0) + v;
}

export function parsePrometheusMetrics(text: string): Metrics {
  const m: Metrics = {
    event_total: {},
    inbound_total: {},
    disparo_total: {},
    agendamento_proposta_total: {},
    agendamento_confirmado_total: {},
    agendamento_falha_total: {},
    latency_ms: { buckets: [], count: 0, sum: 0 },
  };

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const sm = RX.sample.exec(line.trim());
    if (!sm) continue;
    const [, name, rawLabels, valStr] = sm;
    const val = Number(valStr);
    const L = parseLabels(rawLabels);

    // Histogram (latency_ms)
    if (name === "latency_ms_bucket" && L.le) {
      m.latency_ms.buckets.push({ le: Number(L.le), value: val });
      continue;
    }
    if (name === "latency_ms_count") { m.latency_ms.count = val; continue; }
    if (name === "latency_ms_sum")   { m.latency_ms.sum   = val; continue; }

    // Counters canônicos
    if (name === "event_total" && L.event_type) {
      pushCounter(m.event_total, L.event_type, val); continue;
    }
    if (name === "inbound_total" && L.canal) {
      pushCounter(m.inbound_total, L.canal, val); continue;
    }
    if (name === "disparo_total" && L.canal && L.status) {
      const key = `${L.canal}|${L.status}`;
      m.disparo_total[key] = val; continue;
    }
    if (name === "agendamento_proposta_total" && L.canal) {
      pushCounter(m.agendamento_proposta_total, L.canal, val); continue;
    }
    if (name === "agendamento_confirmado_total" && L.canal) {
      pushCounter(m.agendamento_confirmado_total, L.canal, val); continue;
    }
    if (name === "agendamento_falha_total" && L.fase && L.erro) {
      const key = `${L.fase}|${L.erro}`;
      m.agendamento_falha_total[key] = val; continue;
    }
  }

  // ordenar buckets e estimar p50/p95 por interpolação acumulada
  m.latency_ms.buckets.sort((a, b) => a.le - b.le);
  const q = (p: number) => {
    if (!m.latency_ms.count || m.latency_ms.buckets.length === 0) return undefined;
    const target = m.latency_ms.count * p;
    let prevLe = 0, prevC = 0;
    for (const b of m.latency_ms.buckets) {
      const c = b.value;
      if (c >= target) {
        const spanC = Math.max(c - prevC, 1);
        const spanLe = Math.max(b.le - prevLe, 1);
        const within = (target - prevC) / spanC;
        return prevLe + within * spanLe;
      }
      prevLe = b.le; prevC = c;
    }
    return m.latency_ms.buckets[m.latency_ms.buckets.length - 1].le;
  };
  m.p50 = q(0.5);
  m.p95 = q(0.95);

  return m;
}

// Legacy function - deprecated, use metrics.p50 and metrics.p95 directly
export function calculatePercentile(histogram: Histogram, percentile: number): number {
  if (!histogram.count || histogram.count === 0) return 0;
  const target = (percentile / 100) * histogram.count;
  const sortedBuckets = [...histogram.buckets].sort((a, b) => a.le - b.le);
  let prevCount = 0;
  for (const bucket of sortedBuckets) {
    if (bucket.value >= target) {
      if (prevCount === bucket.value) return bucket.le;
      const ratio = (target - prevCount) / (bucket.value - prevCount);
      const prevLe = sortedBuckets[sortedBuckets.indexOf(bucket) - 1]?.le || 0;
      return prevLe + ratio * (bucket.le - prevLe);
    }
    prevCount = bucket.value;
  }
  return sortedBuckets[sortedBuckets.length - 1]?.le || 0;
}
