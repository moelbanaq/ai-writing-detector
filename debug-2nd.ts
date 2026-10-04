import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

const text = fs.readFileSync('2nd_docx_rebuilt.txt', 'utf-8');
const r = analyzeText({ text });
console.log('Words:', r.statistics.words, 'Paragraphs:', r.statistics.paragraphs);
const pat = r.detectors.find(d => d.detectorId === 'ai-pattern');
console.log('AI pattern score:', pat?.score);

const matches = text.match(/^\d+\.\s|^-\s|^\*\s/gm) || [];
console.log('Matches:', matches.length, matches);
