import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeText } from '../../packages/core/src/index.js';
import {
  accuracy,
  precision,
  recall,
  specificity,
  f1Score,
  brierScore,
  expectedCalibrationError,
  calculateRocAuc,
  type ConfusionMatrix,
} from '../../packages/benchmark/src/index.js';

interface Sample {
  id: string;
  category: string;
  label: 0 | 1;
  text: string;
  sourceModel?: string | null;
}

const datasetPath = resolve(process.cwd(), 'data/benchmark/dataset.json');
const rawData = readFileSync(datasetPath, 'utf-8');
const samples: Sample[] = JSON.parse(rawData);

console.log('===============================================================');
console.log('AI WRITING FORENSIC ANALYZER 4.0 — COMPREHENSIVE BENCHMARK');
console.log(`Loaded ${samples.length} labeled benchmark samples.`);
console.log('===============================================================\n');

const predictions: number[] = [];
const binaryPredictions: (0 | 1)[] = [];
const trueLabels: (0 | 1)[] = [];
const categoryStats: Record<string, { total: number; correct: number; scores: number[] }> = {};

for (const sample of samples) {
  const report = analyzeText({ text: sample.text });
  const score = report.classification.aiLikelihood ?? report.classification.forensicSignal;
  const pred: 0 | 1 = score >= 0.5 ? 1 : 0;

  predictions.push(score);
  binaryPredictions.push(pred);
  trueLabels.push(sample.label);

  if (!categoryStats[sample.category]) {
    categoryStats[sample.category] = { total: 0, correct: 0, scores: [] };
  }
  categoryStats[sample.category]!.total++;
  if (pred === sample.label) {
    categoryStats[sample.category]!.correct++;
  }
  categoryStats[sample.category]!.scores.push(score);
}

const cm: ConfusionMatrix = { tp: 0, tn: 0, fp: 0, fn: 0 };
for (let i = 0; i < samples.length; i++) {
  const y = trueLabels[i]!;
  const p = binaryPredictions[i]!;
  if (y === 1 && p === 1) cm.tp++;
  else if (y === 0 && p === 0) cm.tn++;
  else if (y === 0 && p === 1) cm.fp++;
  else cm.fn++;
}

const acc = accuracy(cm);
const prec = precision(cm);
const rec = recall(cm);
const spec = specificity(cm);
const f1 = f1Score(cm);
const brier = brierScore(predictions, trueLabels);
const eceResult = expectedCalibrationError(predictions, trueLabels, 5);
const auc = calculateRocAuc(predictions, trueLabels);

console.log('GLOBAL PERFORMANCE METRICS:');
console.log('---------------------------------------------------------------');
console.log(`Accuracy:          ${(acc * 100).toFixed(1)}%`);
console.log(`Precision:         ${(prec * 100).toFixed(1)}%`);
console.log(`Recall:            ${(rec * 100).toFixed(1)}%`);
console.log(`Specificity:       ${(spec * 100).toFixed(1)}%`);
console.log(`F1 Score:          ${(f1 * 100).toFixed(1)}%`);
console.log(`ROC-AUC:           ${auc !== null ? auc.toFixed(3) : 'N/A'}`);
console.log(`Brier Score:       ${brier.toFixed(4)} (lower is better)`);
console.log(`ECE:               ${(eceResult.ece * 100).toFixed(2)}% (lower is better)`);
console.log('Confusion Matrix:  ', cm);
console.log('\nCATEGORY BREAKDOWN:');
console.log('---------------------------------------------------------------');
for (const [cat, stat] of Object.entries(categoryStats)) {
  const catAcc = (stat.correct / stat.total) * 100;
  const avgScore = stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length;
  console.log(`- ${cat.padEnd(20)}: ${stat.correct}/${stat.total} correct (${catAcc.toFixed(0)}%) | Mean Signal: ${avgScore.toFixed(2)}`);
}

console.log('\n===============================================================');
console.log('BENCHMARK RUN COMPLETE');
console.log('===============================================================');
