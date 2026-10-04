import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

function testSection(name: string, text: string) {
  if (text.trim().length < 50) return;
  const report = analyzeText({ text });
  const aiPct = (report.classification.aiLikelihood * 100).toFixed(1);
  console.log(`Section: ${name.padEnd(25)} | Words: ${report.statistics.words.toString().padEnd(5)} | AI: ${aiPct}% | Label: ${report.classification.label}`);
}

const t1 = fs.readFileSync('1st_test_clean.txt', 'utf-8');
const paras1 = t1.split(/\r?\n\r?\n+/);
console.log('--- 1st Research Sections ---');
paras1.forEach((p, i) => testSection('Section ' + (i + 1), p));

const t2 = fs.readFileSync('2nd_test_clean.txt', 'utf-8');
const paras2 = t2.split(/\r?\n\r?\n+/);
console.log('\n--- 2nd Research Sections ---');
paras2.forEach((p, i) => testSection('Section ' + (i + 1), p));
