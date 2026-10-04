export interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export function accuracy(cm: ConfusionMatrix): number {
  const total = cm.tp + cm.tn + cm.fp + cm.fn;
  if (total === 0) return 0;
  return (cm.tp + cm.tn) / total;
}

export function precision(cm: ConfusionMatrix): number {
  const denom = cm.tp + cm.fp;
  if (denom === 0) return 0;
  return cm.tp / denom;
}

export function recall(cm: ConfusionMatrix): number {
  const denom = cm.tp + cm.fn;
  if (denom === 0) return 0;
  return cm.tp / denom;
}

export function f1Score(cm: ConfusionMatrix): number {
  const p = precision(cm);
  const r = recall(cm);
  if (p + r === 0) return 0;
  return (2 * p * r) / (p + r);
}

export function specificity(cm: ConfusionMatrix): number {
  const denom = cm.tn + cm.fp;
  if (denom === 0) return 0;
  return cm.tn / denom;
}

export function falsePositiveRate(cm: ConfusionMatrix): number {
  return 1 - specificity(cm);
}

export function falseNegativeRate(cm: ConfusionMatrix): number {
  return 1 - recall(cm);
}

export function brierScore(predictions: number[], labels: (0 | 1)[]): number {
  if (predictions.length === 0 || predictions.length !== labels.length) return 0;
  const sum = predictions.reduce((acc, p, i) => acc + Math.pow(p - labels[i]!, 2), 0);
  return Number((sum / predictions.length).toFixed(4));
}

export function expectedCalibrationError(
  predictions: number[],
  labels: (0 | 1)[],
  numBins = 10
): { ece: number; bins: { bin: string; avgPred: number; trueFraction: number; count: number }[] } {
  const n = predictions.length;
  if (n === 0) return { ece: 0, bins: [] };

  const bins: { bin: string; avgPred: number; trueFraction: number; count: number }[] = [];
  let totalEce = 0;

  for (let b = 0; b < numBins; b++) {
    const lower = b / numBins;
    const upper = (b + 1) / numBins;
    const inBin = predictions
      .map((p, idx) => ({ p, y: labels[idx]! }))
      .filter((item) =>
        b === numBins - 1 ? item.p >= lower && item.p <= upper : item.p >= lower && item.p < upper
      );

    if (inBin.length === 0) {
      bins.push({ bin: `[${lower.toFixed(1)}-${upper.toFixed(1)}]`, avgPred: 0, trueFraction: 0, count: 0 });
      continue;
    }

    const avgPred = inBin.reduce((acc, item) => acc + item.p, 0) / inBin.length;
    const trueFraction = inBin.filter((item) => item.y === 1).length / inBin.length;
    totalEce += (inBin.length / n) * Math.abs(avgPred - trueFraction);

    bins.push({
      bin: `[${lower.toFixed(1)}-${upper.toFixed(1)}]`,
      avgPred: Number(avgPred.toFixed(3)),
      trueFraction: Number(trueFraction.toFixed(3)),
      count: inBin.length,
    });
  }

  return {
    ece: Number(totalEce.toFixed(4)),
    bins,
  };
}

export function calculateRocAuc(predictions: number[], labels: (0 | 1)[]): number | null {
  const n = predictions.length;
  const pos = labels.filter((y) => y === 1).length;
  const neg = n - pos;
  if (pos === 0 || neg === 0) return null;

  const pairs = predictions.map((p, i) => ({ p, y: labels[i]! })).sort((a, b) => b.p - a.p);
  let rankSum = 0;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i]!.y === 1) rankSum += i + 1;
  }

  const u = rankSum - (pos * (pos + 1)) / 2;
  const auc = 1 - u / (pos * neg);
  return Number(Math.max(0, Math.min(1, auc)).toFixed(4));
}
