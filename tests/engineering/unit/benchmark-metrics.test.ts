import { describe, expect, it } from 'vitest';
import {
  accuracy,
  precision,
  recall,
  f1Score,
  specificity,
  falsePositiveRate,
  falseNegativeRate,
} from '../../../packages/benchmark/src/index.js';

describe('benchmark-metrics', () => {
  it('calculates metrics correctly for TP=80, TN=90, FP=10, FN=20', () => {
    const cm = { tp: 80, tn: 90, fp: 10, fn: 20 };
    expect(accuracy(cm)).toBeCloseTo(0.85, 3);
    expect(precision(cm)).toBeCloseTo(0.8889, 3);
    expect(recall(cm)).toBeCloseTo(0.8, 3);
    expect(f1Score(cm)).toBeCloseTo(0.8421, 3);
    expect(specificity(cm)).toBeCloseTo(0.9, 3);
    expect(falsePositiveRate(cm)).toBeCloseTo(0.1, 3);
    expect(falseNegativeRate(cm)).toBeCloseTo(0.2, 3);
  });
  it('Zero denominator cases return 0', () => {
    const cm = { tp: 0, tn: 0, fp: 0, fn: 0 };
    expect(precision(cm)).toBe(0);
    expect(recall(cm)).toBe(0);
    expect(f1Score(cm)).toBe(0);
  });
  it('All-correct case returns accuracy=1.0', () => {
    const cm = { tp: 100, tn: 100, fp: 0, fn: 0 };
    expect(accuracy(cm)).toBe(1.0);
  });
});
