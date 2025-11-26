'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import supabase from '@/lib/supabase';

const SUPABASE_SOURCE = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Supabase: inspection_logs';

const buildHistory = (logs) => {
  let total = 0;
  let defects = 0;

  return [...logs]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((log) => {
      total += 1;
      defects += log.status === 'defective' ? 1 : 0;
      const goodCount = total - defects;

      return {
        capturedAt: log.created_at,
        totalBricks: total,
        defectCount: defects,
        goodCount,
        defectRate: total ? (defects / total) * 100 : 0,
      };
    });
};

export const useMetrics = (refreshMs = 1000) => {
  const [logs, setLogs] = useState([]);
  const [source, setSource] = useState(SUPABASE_SOURCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('inspection_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
      setSource(SUPABASE_SOURCE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Supabase data');
    } finally {
      // Only clear loading; do not flip it back on for subsequent refreshes.
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [load, refreshMs]);

  useEffect(() => {
    const channel = supabase
      .channel('inspection_logs_inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inspection_logs' },
        (payload) => {
          const incoming = payload.new;
          setLogs((prev) => {
            return [incoming, ...prev.filter((log) => log.id !== incoming.id)].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const metrics = useMemo(() => {
    const totalBricks = logs.length;
    const defectCount = logs.filter((log) => log.status === 'defective').length;
    const goodCount = totalBricks - defectCount;

    return {
      totalBricks,
      defectCount,
      goodCount,
      defectRate: totalBricks ? (defectCount / totalBricks) * 100 : 0,
      capturedAt: logs[0]?.created_at,
    };
  }, [logs]);

  const history = useMemo(() => buildHistory(logs), [logs]);

  return { metrics, history, logs, source, loading, error, reload: load };
};

export default useMetrics;
