import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

const text = fs.readFileSync('1st_tex_prose.txt', 'utf-8');
const report = analyzeText({ text });
const high = report.segments.sentences.filter((s: any) => (s.analysis?.aiLikelihood ?? 0) >= 0.6);
high.forEach((s: any) => {
  console.log('--- HIGH AI SENTENCE ---');
  console.log('AI:', (s.analysis.aiLikelihood * 100).toFixed(0) + '%');
  console.log(s.text);
  console.log(s.analysis.tells);
});
