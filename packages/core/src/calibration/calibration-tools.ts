import { analyzeText } from '../analysis/analyze.js';
import type { CalibrationProfile } from '../config/detection-rules.js';

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))));
const mean = (a: number[]): number => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const round = (x: number, n = 4): number => Number(Number(x).toFixed(n));

export interface LabeledSample {
  text: string;
  label: 0 | 1; // 0 = human, 1 = AI
}

export interface CalibrationOptions {
  learningRate?: number;
  epochs?: number;
  l2?: number;
}

export interface EvaluationResult {
  n: number;
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
  rocAuc: number | null;
  brierScore: number;
  confusionMatrix: { tp: number; tn: number; fp: number; fn: number };
  recommendation: string;
}

export function trainingVector(report: any): Record<string, number> {
  const v: Record<string, number> = {};
  if (Array.isArray(report.detectors)) {
    for (const d of report.detectors) {
      if (d.score !== null) {
        v[d.detectorId] = d.detectorId === 'human-irregularity' ? 1 - d.score : d.score;
      }
    }
  }
  return v;
}

/**
 * Fits logistic calibration weights on a labeled dataset using gradient descent with L2 regularization.
 */
export function fitCalibration(
  samples: LabeledSample[],
  options: CalibrationOptions = {},
): CalibrationProfile {
  if (!Array.isArray(samples) || samples.length < 5) {
    throw new Error('fitCalibration requires at least 5 labeled samples for training.');
  }

  const rows: { x: Record<string, number>; y: number }[] = [];
  for (const s of samples) {
    if (typeof s.text !== 'string' || (s.label !== 0 && s.label !== 1)) continue;
    const r = analyzeText({ text: s.text });
    rows.push({ x: trainingVector(r), y: s.label });
  }

  if (rows.length < 5) {
    throw new Error('At least 5 valid labeled samples are required.');
  }

  const ids = [...new Set(rows.flatMap((r) => Object.keys(r.x)))];
  const w: Record<string, number> = Object.fromEntries(ids.map((k) => [k, 0]));
  let b = 0;
  const lr = options.learningRate ?? 0.05;
  const epochs = options.epochs ?? 900;
  const l2 = options.l2 ?? 0.01;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gb =
      rows.reduce(
        (s, r) =>
          s +
          (sigmoid(b + ids.reduce((z, k) => z + (w[k] || 0) * ((r.x[k] ?? 0.5) - 0.5), 0)) - r.y),
        0,
      ) / rows.length;
    b -= lr * gb;

    for (const k of ids) {
      let g = 0;
      for (const r of rows) {
        const z = b + ids.reduce((zz, j) => zz + (w[j] || 0) * ((r.x[j] ?? 0.5) - 0.5), 0);
        g += (sigmoid(z) - r.y) * ((r.x[k] ?? 0.5) - 0.5);
      }
      g /= rows.length;
      w[k] = (w[k] ?? 0) - lr * (g + l2 * (w[k] ?? 0));
    }
  }

  const probs = rows.map((r) =>
    sigmoid(b + ids.reduce((z, k) => z + (w[k] || 0) * ((r.x[k] ?? 0.5) - 0.5), 0)),
  );
  const brier = mean(probs.map((p, i) => (p - rows[i]!.y) ** 2));

  return {
    version: 'trained-3.0.0',
    validated: false,
    intercept: round(b),
    weights: Object.fromEntries(Object.entries(w).map(([k, v]) => [k, round(v)])),
    temperature: 1,
    prior: round(mean(rows.map((r) => r.y))),
    trainingSamples: rows.length,
    brierScore: round(brier),
    validationRequired: true,
  };
}

/**
 * Evaluates calibration performance against an independent test set.
 */
export function evaluateCalibration(
  calibration: CalibrationProfile,
  samples: LabeledSample[],
): EvaluationResult {
  if (!calibration || !Array.isArray(samples) || !samples.length) {
    throw new Error('Calibration profile and labeled samples are required.');
  }

  const rows = samples
    .filter((s) => typeof s.text === 'string' && (s.label === 0 || s.label === 1))
    .map((s) => {
      const r = analyzeText({ text: s.text, options: { calibrationProfile: calibration } });
      const x = trainingVector(r);
      const ids = Object.keys(calibration.weights || {});
      const z = (calibration.intercept ?? 0) + ids.reduce(
        (acc, k) => acc + (calibration.weights[k] || 0) * ((x[k] ?? 0.5) - 0.5),
        0
      );
      const calibratedP = sigmoid(z / (calibration.temperature || 1));
      return {
        r,
        p: r.classification.calibratedProbability ?? calibratedP,
        y: s.label,
      };
    });

  const p = rows.map((x) => x.p);
  const y = rows.map((x) => x.y);
  const threshold = 0.5;
  const pred = p.map((x) => (x >= threshold ? 1 : 0));

  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < y.length; i++) {
    if (y[i] && pred[i]) tp++;
    else if (!y[i] && !pred[i]) tn++;
    else if (!y[i] && pred[i]) fp++;
    else fn++;
  }

  const precision = tp / Math.max(1, tp + fp);
  const recall = tp / Math.max(1, tp + fn);
  const specificity = tn / Math.max(1, tn + fp);
  const f1 = (2 * precision * recall) / Math.max(1e-9, precision + recall);
  const accuracy = (tp + tn) / Math.max(1, y.length);
  const brier = mean(p.map((v, i) => (v - y[i]!) ** 2));

  const pairs = p.map((v, i) => [v, y[i]!] as [number, number]).sort((a, b) => b[0] - a[0]);
  const pos = y.filter(Boolean).length;
  const neg = y.length - pos;
  let rankSum = 0;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i]![1]) rankSum += i + 1;
  }
  const auc = pos && neg ? (rankSum - (pos * (pos + 1)) / 2) / (pos * neg) : null;

  return {
    n: y.length,
    accuracy: round(accuracy),
    precision: round(precision),
    recall: round(recall),
    specificity: round(specificity),
    f1: round(f1),
    rocAuc: auc === null ? null : round(auc),
    brierScore: round(brier),
    confusionMatrix: { tp, tn, fp, fn },
    recommendation:
      accuracy >= 0.9 && f1 >= 0.9 && brier <= 0.15
        ? 'PROMISING_BUT_REQUIRES_EXTERNAL_VALIDATION'
        : 'NEEDS_FURTHER_TUNING_OR_MORE_SAMPLES',
  };
}
