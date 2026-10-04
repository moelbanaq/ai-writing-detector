import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  analyzeText,
  fitCalibration,
  evaluateCalibration,
  type LabeledSample,
  type CalibrationProfile,
} from '../../packages/core/src/index.js';

interface Sample {
  id: string;
  category: string;
  label: 0 | 1;
  text: string;
}

const shouldCalibrate = process.argv.includes('--calibrate');
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

const trainSamples = [...aiSplit.train, ...humanSplit.train];
const valSamples = [...aiSplit.val, ...humanSplit.val];
const testSamples = [...aiSplit.test, ...humanSplit.test];

console.log('===============================================================');
console.log(`BENCHMARK VALIDATION SUITE (Calibrate Mode: ${shouldCalibrate ? 'ENABLED' : 'DISABLED'})`);
console.log(`Splits: Train=${trainSamples.length} (60%), Val=${valSamples.length} (20%), Test=${testSamples.length} (20%)`);
console.log('===============================================================\n');

if (!shouldCalibrate) {
  console.log('Mode: Uncalibrated Forensic Baseline');
  console.log('Status: VALIDATION REQUIRED (Scores represent deterministic forensic signals, not calibrated probabilities)\n');

  let correct = 0;
  for (const s of valSamples) {
    const report = analyzeText({ text: s.text });
    const pred = (report.classification.aiLikelihood ?? report.classification.forensicSignal) >= 0.5 ? 1 : 0;
    if (pred === s.label) correct++;
  }

  const valAcc = (correct / valSamples.length) * 100;
  console.log(`Validation Split Accuracy: ${correct}/${valSamples.length} (${valAcc.toFixed(1)}%)`);
  console.log('Note: To train calibration weights, run: npm run test:accuracy:validation\n');
} else {
  console.log('Training Platt / Logistic Calibration on 60% Train split...');
  const trainLabeled: LabeledSample[] = trainSamples.map((s) => ({ text: s.text, label: s.label }));
  const valLabeled: LabeledSample[] = valSamples.map((s) => ({ text: s.text, label: s.label }));

  const profile: CalibrationProfile = fitCalibration(trainLabeled, {
    epochs: 400,
    learningRate: 0.1,
  });

  console.log('Calibration Profile Generated:');
  console.log(`- Intercept:   ${profile.intercept}`);
  console.log(`- Prior:       ${profile.prior}`);
  console.log(`- Train Brier: ${profile.brierScore}`);
  console.log(`- Weights:     `, profile.weights);

  console.log('\nEvaluating on independent 20% Validation split...');
  const valEval = evaluateCalibration(profile, valLabeled);

  console.log('VALIDATION METRICS:');
  console.log('---------------------------------------------------------------');
  console.log(`Accuracy:    ${(valEval.accuracy * 100).toFixed(1)}%`);
  console.log(`Precision:   ${(valEval.precision * 100).toFixed(1)}%`);
  console.log(`Recall:      ${(valEval.recall * 100).toFixed(1)}%`);
  console.log(`Specificity: ${(valEval.specificity * 100).toFixed(1)}%`);
  console.log(`F1 Score:    ${(valEval.f1 * 100).toFixed(1)}%`);
  console.log(`Brier Score: ${valEval.brierScore.toFixed(4)}`);
  console.log(`ROC-AUC:     ${valEval.rocAuc !== null ? valEval.rocAuc.toFixed(3) : 'N/A'}`);
}

console.log('\n===============================================================');
console.log('VALIDATION RUN FINISHED');
console.log('===============================================================');
