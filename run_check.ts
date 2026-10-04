import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

const text = fs.readFileSync('2nd_test_tight.txt', 'utf-8');
const report = analyzeText({ text });
console.log('AI Likelihood:', (report.classification.aiLikelihood * 100).toFixed(2) + '%');
console.log('Label:', report.classification.label);
report.detectors.forEach(d => console.log(d.detectorId, d.score !== null ? (d.score * 100).toFixed(1) + '%' : 'null'));
