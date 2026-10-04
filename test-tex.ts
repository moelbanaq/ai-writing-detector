import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

['1st_tex_readable.txt', '2nd_tex_readable.txt'].forEach(fn => {
  const text = fs.readFileSync(fn, 'utf-8');
  const report = analyzeText({ text });
  console.log(fn, 'Words:', text.split(/\s+/).length, 'AI:', (report.classification.aiLikelihood * 100).toFixed(1) + '%', 'Label:', report.classification.label);
  report.detectors.forEach(d => console.log('  ', d.detectorId, d.score !== null ? (d.score * 100).toFixed(1) + '%' : 'null'));
  const high = report.segments.sentences.filter((s: any) => (s.analysis?.aiLikelihood ?? 0) >= 0.6);
  console.log('   High AI sentences:', high.length);
});
