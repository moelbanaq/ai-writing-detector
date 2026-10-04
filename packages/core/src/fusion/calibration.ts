import type { CalibrationStatus } from '@ai-detector/shared';

export interface CalibrationProfile {
  version: string;
  status: CalibrationStatus;
  intercept: number;
  weights: Record<string, number>;
  temperature: number;
  prior: number;
  brierScore?: number;
  ece?: number;
  trainingSamples?: number;
  validationAccuracy?: number;
  fittedAt?: string;
}

export interface CalibrationEvaluation {
  n: number;
  brierScore: number;
  ece: number; // Expected Calibration Error
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
  rocAuc: number | null;
  calibrationSlope: number;
  calibrationIntercept: number;
  reliabilityDiagram: { bin: string; predictedProb: number; trueFraction: number; count: number }[];
}

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))));
const logit = (p: number): number => {
  const clamped = Math.max(0.001, Math.min(0.999, p));
  return Math.log(clamped / (1 - clamped));
};

export const UNCALIBRATED_DEFAULT_PROFILE: CalibrationProfile = {
  version: 'unvalidated-4.0.0',
  status: 'not_calibrated',
  intercept: 0,
  weights: {},
  temperature: 1.0,
  prior: 0.50,
};

/**
 * Apply calibrated logistic model to compute formal calibrated probability.
 * Returns null if no validated calibration profile is provided.
 */
export function applyCalibration(
  detectorScores: Record<string, number>,
  profile?: CalibrationProfile | null
): { calibratedProbability: number | null; status: CalibrationStatus } {
  if (!profile || profile.status === 'not_calibrated' || !Object.keys(profile.weights || {}).length) {
    return {
      calibratedProbability: null,
      status: 'not_calibrated',
    };
  }

  let z = logit(profile.prior ?? 0.50) + profile.intercept;
  for (const [id, weight] of Object.entries(profile.weights)) {
    if (detectorScores[id] !== undefined) {
      z += weight * (detectorScores[id]! - 0.50);
    }
  }

  const p = sigmoid(z / (profile.temperature || 1.0));
  return {
    calibratedProbability: Number(Math.max(0.01, Math.min(0.99, p)).toFixed(4)),
    status: profile.status,
  };
}

/**
 * Fit a logistic calibration profile using gradient descent with L2 regularization on labeled samples.
 */
export function fitLogisticCalibration(
  samples: { features: Record<string, number>; label: 0 | 1 }[],
  options: { learningRate?: number; epochs?: number; l2?: number } = {}
): CalibrationProfile {
  if (samples.length < 10) {
    throw new Error('Calibration fitting requires at least 10 labeled samples.');
  }

  const featureKeys = [...new Set(samples.flatMap((s) => Object.keys(s.features)))];
  const weights: Record<string, number> = Object.fromEntries(featureKeys.map((k) => [k, 0]));
  let b = 0;
  const lr = options.learningRate ?? 0.05;
  const epochs = options.epochs ?? 800;
  const l2 = options.l2 ?? 0.01;

  for (let ep = 0; ep < epochs; ep++) {
    let gradB = 0;
    const gradW: Record<string, number> = Object.fromEntries(featureKeys.map((k) => [k, 0]));

    for (const sample of samples) {
      const z = b + featureKeys.reduce((acc, k) => acc + (weights[k] || 0) * ((sample.features[k] ?? 0.5) - 0.5), 0);
      const pred = sigmoid(z);
      const err = pred - sample.label;
      gradB += err;

      for (const k of featureKeys) {
        gradW[k] = (gradW[k] ?? 0) + err * ((sample.features[k] ?? 0.5) - 0.5);
      }
    }

    b -= (lr * gradB) / samples.length;
    for (const k of featureKeys) {
      weights[k] = (weights[k] || 0) - lr * (gradW[k]! / samples.length + l2 * (weights[k] || 0));
    }
  }

  const predictions = samples.map((s) =>
    sigmoid(b + featureKeys.reduce((acc, k) => acc + (weights[k] || 0) * ((s.features[k] ?? 0.5) - 0.5), 0))
  );

  const brier =
    predictions.reduce((acc, p, i) => acc + Math.pow(p - samples[i]!.label, 2), 0) / samples.length;

  return {
    version: `calibrated-4.0.0-${Date.now().toString(36)}`,
    status: 'calibrated',
    intercept: Number(b.toFixed(4)),
    weights: Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, Number(v.toFixed(4))])),
    temperature: 1.0,
    prior: Number((samples.filter((s) => s.label === 1).length / samples.length).toFixed(4)),
    brierScore: Number(brier.toFixed(4)),
    trainingSamples: samples.length,
    fittedAt: new Date().toISOString(),
  };
}

/**
 * Compute Expected Calibration Error (ECE) across 10 probability bins.
 */
export function calculateECE(
  predictedProbs: number[],
  trueLabels: (0 | 1)[],
  numBins = 10
): { ece: number; bins: { bin: string; predictedProb: number; trueFraction: number; count: number }[] } {
  const binResults: { bin: string; predictedProb: number; trueFraction: number; count: number }[] = [];
  let totalEce = 0;
  const n = predictedProbs.length;

  for (let i = 0; i < numBins; i++) {
    const lower = i / numBins;
    const upper = (i + 1) / numBins;
    const inBin = predictedProbs
      .map((p, idx) => ({ p, y: trueLabels[idx]! }))
      .filter((item) => (i === numBins - 1 ? item.p >= lower && item.p <= upper : item.p >= lower && item.p < upper));

    if (inBin.length === 0) {
      binResults.push({
        bin: `[${lower.toFixed(1)}-${upper.toFixed(1)}]`,
        predictedProb: 0,
        trueFraction: 0,
        count: 0,
      });
      continue;
    }

    const avgPred = inBin.reduce((acc, item) => acc + item.p, 0) / inBin.length;
    const trueFraction = inBin.filter((item) => item.y === 1).length / inBin.length;
    const binDiff = Math.abs(avgPred - trueFraction);

    totalEce += (inBin.length / n) * binDiff;
    binResults.push({
      bin: `[${lower.toFixed(1)}-${upper.toFixed(1)}]`,
      predictedProb: Number(avgPred.toFixed(3)),
      trueFraction: Number(trueFraction.toFixed(3)),
      count: inBin.length,
    });
  }

  return {
    ece: Number(totalEce.toFixed(4)),
    bins: binResults,
  };
}
