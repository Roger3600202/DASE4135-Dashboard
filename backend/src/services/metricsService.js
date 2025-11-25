import { supabaseClient, supabaseEnabled } from '../supabaseClient.js';

const safeRate = (defects, total) => {
  if (!total || total <= 0) return 0;
  return Number(((defects / total) * 100).toFixed(2));
};

const normalizeRow = (row) => {
  const total = Number(row?.total_bricks ?? row?.total ?? 0);
  const defects = Number(row?.defect_count ?? row?.defects ?? 0);
  const good = Math.max(total - defects, 0);
  return {
    capturedAt: row?.captured_at || row?.capturedAt || new Date().toISOString(),
    totalBricks: total,
    defectCount: defects,
    goodCount: good,
    defectRate: safeRate(defects, total),
  };
};

const makeMockHistory = () => {
  const now = new Date();
  return Array.from({ length: 24 }).map((_, idx) => {
    const base = 120 + idx * 5;
    const defects = Math.max(2, Math.round((Math.sin(idx / 3) + 1.2) * 4));
    const total = base + defects;
    const capturedAt = new Date(now.getTime() - (23 - idx) * 60 * 60 * 1000);
    return {
      capturedAt: capturedAt.toISOString(),
      totalBricks: total,
      defectCount: defects,
      goodCount: Math.max(total - defects, 0),
      defectRate: safeRate(defects, total),
    };
  });
};

const mockHistory = makeMockHistory();

export const fetchLatestMetrics = async () => {
  if (!supabaseEnabled || !supabaseClient) {
    const latest = mockHistory[mockHistory.length - 1];
    return { data: latest, source: 'mock' };
  }

  const { data, error } = await supabaseClient
    .from('brick_quality_events')
    .select('captured_at,total_bricks,defect_count')
    .order('captured_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  const latest = Array.isArray(data) && data.length ? data[0] : null;
  if (!latest) {
    const fallback = mockHistory[mockHistory.length - 1];
    return { data: fallback, source: 'supabase-empty' };
  }

  return { data: normalizeRow(latest), source: 'supabase' };
};

export const fetchHistory = async (limit = 48) => {
  if (!supabaseEnabled || !supabaseClient) {
    return { data: mockHistory.slice(-limit), source: 'mock' };
  }

  const { data, error } = await supabaseClient
    .from('brick_quality_events')
    .select('captured_at,total_bricks,defect_count')
    .order('captured_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  const normalized = (data || []).map(normalizeRow).reverse();
  return { data: normalized, source: 'supabase' };
};
