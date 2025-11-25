import { Router } from 'express';
import { fetchHistory, fetchLatestMetrics } from '../services/metricsService.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { data, source } = await fetchLatestMetrics();
    res.json({ ...data, source });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load metrics', detail: err.message });
  }
});

router.get('/history', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 48, 200);
  try {
    const { data, source } = await fetchHistory(limit);
    res.json({ data, source });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history', detail: err.message });
  }
});

export default router;
