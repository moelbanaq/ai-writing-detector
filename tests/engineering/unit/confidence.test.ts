import { describe, expect, it } from 'vitest';
import { calculateConfidence } from '../../../packages/core/src/confidence/calculate-confidence.js';

describe('confidence', () => {
  const dummyLang = { primary: 'en', isSupported: true, confidence: 0.9 } as any;
  const dummyEns = {
    detectorAgreement: 1,
    classification: { aiLikelihood: 0.5, humanLikelihood: 0.5, label: 'inconclusive' },
  } as any;

  it('Short text (<100 words) -> confidence <= 0.35', () => {
    const conf = calculateConfidence({ words: 50 } as any, dummyLang, dummyEns, 1.0);
    expect(conf.score).toBeLessThanOrEqual(0.35);
  });
  it('Medium text (100-249 words) -> confidence <= 0.60', () => {
    const conf = calculateConfidence({ words: 150 } as any, dummyLang, dummyEns, 1.0);
    expect(conf.score).toBeLessThanOrEqual(0.60);
  });
  it('Text 250-499 words -> confidence <= 0.80', () => {
    const conf = calculateConfidence({ words: 300 } as any, dummyLang, dummyEns, 1.0);
    expect(conf.score).toBeLessThanOrEqual(0.80);
  });
  it('Confidence result includes interval', () => {
    const conf = calculateConfidence({ words: 300 } as any, dummyLang, dummyEns, 1.0);
    expect(conf.interval).toBeDefined();
    expect(conf.interval.lower).toBeLessThanOrEqual(conf.interval.upper);
    expect(conf.interval.lower).toBeGreaterThanOrEqual(0);
    expect(conf.interval.upper).toBeLessThanOrEqual(1);
  });
});
