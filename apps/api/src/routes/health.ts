import { Router, Request, Response } from 'express';

export const healthRoute = Router();

healthRoute.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});
