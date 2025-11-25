import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import metricsRouter from './routes/metrics.js';

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigins,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/metrics', metricsRouter);

  app.use((err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Unexpected server error' });
  });

  return app;
};
