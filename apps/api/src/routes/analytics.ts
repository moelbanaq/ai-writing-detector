import { Router, Request, Response } from 'express';
import { analytics } from '../services/analytics.js';

export const analyticsRoute = Router();

// Record anonymous page visit
analyticsRoute.post('/analytics/visit', (req: Request, res: Response) => {
  const { visitorId } = req.body || {};
  analytics.recordVisit(typeof visitorId === 'string' ? visitorId : undefined);
  res.json({ success: true });
});

// Retrieve aggregated statistics
analyticsRoute.get('/analytics/stats', (req: Request, res: Response) => {
  const configuredPin = process.env.ADMIN_PIN?.trim();
  const providedPin = (req.query.pin as string) || (req.headers['x-admin-pin'] as string);

  // If an ADMIN_PIN is configured in .env, verify it
  if (configuredPin && configuredPin.length > 0) {
    if (providedPin !== configuredPin) {
      res.status(401).json({
        success: false,
        isPinProtected: true,
        error: 'PIN_REQUIRED',
        message: 'This dashboard is protected by an Admin PIN.',
      });
      return;
    }
  }

  const stats = analytics.getStats();
  res.json({
    success: true,
    isPinProtected: Boolean(configuredPin),
    stats,
  });
});

// Reset statistics (Admin only)
analyticsRoute.post('/analytics/reset', (req: Request, res: Response) => {
  const configuredPin = process.env.ADMIN_PIN?.trim();
  const providedPin = (req.body?.pin as string) || (req.headers['x-admin-pin'] as string);

  if (configuredPin && configuredPin.length > 0 && providedPin !== configuredPin) {
    res.status(401).json({ success: false, error: 'INVALID_PIN' });
    return;
  }

  analytics.resetStats();
  res.json({ success: true, message: 'Analytics reset successfully' });
});
