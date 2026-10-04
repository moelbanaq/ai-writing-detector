import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { analyzeRoute } from './routes/analyze.js';
import { healthRoute } from './routes/health.js';
import { verifyRoute } from './routes/verify.js';
import { analyticsRoute } from './routes/analytics.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api', healthRoute);
app.use('/api', analyzeRoute);
app.use('/api', verifyRoute);
app.use('/api', analyticsRoute);

// Serve static frontend assets from public/
const publicDir = typeof __dirname !== 'undefined' ? path.join(__dirname, 'public') : path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

// Fallback to index.html for client-side SPA routing (Compatible with Express 4 & 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  next();
});

app.use(errorHandler);

// Listen only when not in serverless (e.g. Vercel) environment
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Writing Forensic Analyzer v3.0.0`);
    console.log(`🌐 Live Server Running at: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

export default app;
export { app };
