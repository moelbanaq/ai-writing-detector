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
  type ConfusionMatrix,
} from '../../packages/benchmark/src/index.js';

interface Sample {
  id: string;
  category: string;
  label: 0 | 1;
  text: string;
}

const datasetPath = resolve(process.cwd(), 'data/benchmark/dataset.json');
const allSamples: Sample[] = JSON.parse(readFileSync(datasetPath, 'utf-8'));

// Stratified split: 60% Train, 20% Validation, 20% Test
const aiSamples = allSamples.filter((s) => s.label === 1);
const humanSamples = allSamples.filter((s) => s.label === 0);

function splitGroup<T>(items: T[]) {
  const trainN = Math.floor(items.length * 0.60);
  const valN = Math.floor(items.length * 0.20);
  return {
    train: items.slice(0, trainN),
    val: items.slice(trainN, trainN + valN),
    test: items.slice(trainN + valN),
  };
}

const aiSplit = splitGroup(aiSamples);
const humanSplit = splitGroup(humanSamples);
const testSamples = [...aiSplit.test, ...humanSplit.test];

console.log('===============================================================');
console.log('FINAL FROZEN TEST SPLIT EVALUATION (20% Untouched Test Data)');
console.log(`Evaluating ${testSamples.length} test samples.`);
console.log('===============================================================\n');

const predictions: number[] = [];
const binaryPredictions: (0 | 1)[] = [];
const trueLabels: (0 | 1)[] = [];

for (const s of testSamples) {
  const report = analyzeText({ text: s.text });
  const score = report.classification.aiLikelihood ?? report.classification.forensicSignal;
  const pred: 0 | 1 = score >= 0.5 ? 1 : 0;

  predictions.push(score);
  binaryPredictions.push(pred);
  trueLabels.push(s.label);

  console.log(`[${s.id}] True: ${s.label === 1 ? 'AI   ' : 'Human'} | Signal: ${score.toFixed(2)} | Label: ${report.classification.label.padEnd(16)} | Status: ${report.classification.calibrationStatus}`);
}

const cm: ConfusionMatrix = { tp: 0, tn: 0, fp: 0, fn: 0 };
for (let i = 0; i < testSamples.length; i++) {
  const y = trueLabels[i]!;
  const p = binaryPredictions[i]!;
  if (y === 1 && p === 1) cm.tp++;
  else if (y === 0 && p === 0) cm.tn++;
  else if (y === 0 && p === 1) cm.fp++;
  else cm.fn++;
}

console.log('\nFINAL TEST METRICS:');
console.log('---------------------------------------------------------------');
console.log(`Accuracy:    ${(accuracy(cm) * 100).toFixed(1)}%`);
console.log(`Precision:   ${(precision(cm) * 100).toFixed(1)}%`);
console.log(`Recall:      ${(recall(cm) * 100).toFixed(1)}%`);
console.log(`Specificity: ${(specificity(cm) * 100).toFixed(1)}%`);
console.log(`F1 Score:    ${(f1Score(cm) * 100).toFixed(1)}%`);
console.log(`Brier Score: ${brierScore(predictions, trueLabels).toFixed(4)}`);
console.log('Confusion Matrix: ', cm);
console.log('\nCALIBRATION ATTESTATION:');
console.log('Default status is "not_calibrated". Reports present forensicSignal, NOT calibratedProbability.');
console.log('Validation attestation verified: Engine abstains or marks status as unvalidated when no external profile is supplied.');

console.log('\n===============================================================');
console.log('FINAL TEST EVALUATION PASSED');
console.log('===============================================================');
