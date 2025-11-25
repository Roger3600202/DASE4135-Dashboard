import { useEffect, useState } from 'react';
import { fetchHistory, fetchLatestMetrics } from '../api/client.js';

export const useMetrics = (refreshMs = 5000) => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [source, setSource] = useState('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const [latest, historical] = await Promise.all([fetchLatestMetrics(), fetchHistory(48)]);
      setMetrics(latest);
      setHistory(historical.data || []);
      setSource(latest.source || historical.source || 'unknown');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return { metrics, history, source, loading, error, reload: load };
};
