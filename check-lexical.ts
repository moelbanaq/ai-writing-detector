import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

function checkLexical(file: string) {
  const text = fs.readFileSync(file, 'utf-8');
  const report = analyzeText({ text });
  const ttr = report.statistics.typeTokenRatio;
  const words = report.statistics.words;
  const lexScore = report.detectors.find(d => d.detectorId === 'lexical-diversity')?.score;
  const aiLikelihood = report.classification.aiLikelihood;
  console.log(`${file}:`);
  console.log(`  Words: ${words}, TTR: ${(ttr * 100).toFixed(2)}%`);
  console.log(`  Lexical score: ${(lexScore! * 100).toFixed(1)}%`);
  console.log(`  AI Likelihood: ${(aiLikelihood * 100).toFixed(1)}%`);
  console.log(`  Formula diff: |${ttr.toFixed(4)} - 0.4000| = ${Math.abs(ttr - 0.4).toFixed(4)}`);
  console.log(`  Score = max(0, 1 - diff * 2) = ${Math.max(0, 1 - Math.abs(ttr - 0.4) * 2).toFixed(4)}`);
}

checkLexical('1st_enriched.txt');
checkLexical('1st_humanized_v2.txt');
checkLexical('2nd_humanized_v2.txt');
