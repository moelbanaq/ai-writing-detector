import express from 'express';
import cors from 'cors';
import { analyzeRoute } from './routes/analyze.js';
import { healthRoute } from './routes/health.js';
import { verifyRoute } from './routes/verify.js';
import { analyticsRoute } from './routes/analytics.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', healthRoute);
app.use('/api', analyzeRoute);
app.use('/api', verifyRoute);
app.use('/api', analyticsRoute);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[API] AI Writing Forensic Analyzer API running on port ${PORT}`);
});

export { app };
