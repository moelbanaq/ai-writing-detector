import { describe, expect, it } from 'vitest';
import {
  calculateUncertainty,
  calculateECE,
  fitLogisticCalibration,
  applyCalibration,
  runForensicFusion,
  type DetectorContext,
} from '@ai-detector/core';

describe('Evidence Fusion, Uncertainty Modeling & Calibration', () => {
  it('calculates epistemic uncertainty correctly', () => {
    const lowUncertainty = calculateUncertainty({
      detectorAgreement: 0.95,
      wordCount: 500,
      sentenceCount: 20,
      languageConfidence: 0.99,
      featureCoverage: 0.95,
      isCalibrated: true,
    });

    expect(lowUncertainty.level).toBe('low');
    expect(lowUncertainty.recommendation).toBe('accept');
    expect(lowUncertainty.score).toBeLessThan(0.35);

    const highUncertainty = calculateUncertainty({
      detectorAgreement: 0.05,
      wordCount: 25,
      sentenceCount: 1,
      languageConfidence: 0.20,
      featureCoverage: 0.20,
      isCalibrated: false,
    });

    expect(highUncertainty.score).toBeGreaterThan(0.70);
    expect(highUncertainty.recommendation).toBe('abstain');
  });

  it('computes Expected Calibration Error (ECE) across bins', () => {
    const preds = [0.1, 0.2, 0.8, 0.9, 0.85, 0.15];
    const labels: (0 | 1)[] = [0, 0, 1, 1, 1, 0];
    const { ece, bins } = calculateECE(preds, labels, 5);

    expect(typeof ece).toBe('number');
    expect(ece).toBeGreaterThanOrEqual(0);
    expect(ece).toBeLessThan(0.20);
    expect(bins.length).toBe(5);
  });

  it('fits logistic calibration weights and evaluates properly', () => {
    const samples = [
      { features: { 'ai-patterns': 0.9, stylometric: 0.8 }, label: 1 as const },
      { features: { 'ai-patterns': 0.85, stylometric: 0.75 }, label: 1 as const },
      { features: { 'ai-patterns': 0.95, stylometric: 0.9 }, label: 1 as const },
      { features: { 'ai-patterns': 0.8, stylometric: 0.7 }, label: 1 as const },
      { features: { 'ai-patterns': 0.88, stylometric: 0.82 }, label: 1 as const },
      { features: { 'ai-patterns': 0.1, stylometric: 0.2 }, label: 0 as const },
      { features: { 'ai-patterns': 0.2, stylometric: 0.15 }, label: 0 as const },
      { features: { 'ai-patterns': 0.15, stylometric: 0.25 }, label: 0 as const },
      { features: { 'ai-patterns': 0.05, stylometric: 0.1 }, label: 0 as const },
      { features: { 'ai-patterns': 0.25, stylometric: 0.3 }, label: 0 as const },
    ];

    const profile = fitLogisticCalibration(samples, { epochs: 200, learningRate: 0.1 });
    expect(profile.status).toBe('calibrated');
    expect(profile.weights['ai-patterns']).toBeDefined();

    const calibResult = applyCalibration({ 'ai-patterns': 0.9, stylometric: 0.8 }, profile);
    expect(calibResult.calibratedProbability).toBeDefined();
    expect(calibResult.calibratedProbability).toBeGreaterThan(0.7);
  });

  it('separates AI and Human evidence pools cleanly in fusion', () => {
    const text = `The rapid development of artificial intelligence underscores the importance of ethical governance in contemporary data science. Furthermore, machine learning pipelines delve deep into multifaceted structures to streamline modern computational workflows.`;

    const fakeContext: DetectorContext = {
      originalText: text,
      normalizedText: text,
      statistics: {
        characters: text.length,
        words: 35,
        sentences: 2,
        paragraphs: 1,
        averageSentenceLength: 17.5,
        sentenceLengthVariance: 5,
        sentenceLengthStdDev: 2.2,
        averageWordLength: 5.8,
        typeTokenRatio: 0.85,
        hapaxRatio: 0.8,
        punctuationRate: 0.04,
        repetitionRate: 0.05,
        readability: { available: true, score: 35, method: 'flesch' },
      },
      segments: {
        paragraphs: [{ index: 0, text, offset: 0, length: text.length }],
        sentences: [
          { index: 0, text: 'The rapid development of artificial intelligence underscores the importance of ethical governance in contemporary data science.', offset: 0, length: 128 },
          { index: 1, text: 'Furthermore, machine learning pipelines delve deep into multifaceted structures to streamline modern computational workflows.', offset: 129, length: 126 },
        ],
        codeRegions: [],
        referenceRegions: [],
        urls: [],
      },
      features: {
        lexical: {},
        syntactic: {},
        structural: {},
        punctuation: {},
        repetition: {},
        stylometric: {},
      },
      language: {
        primary: 'en',
        confidence: 1.0,
        method: 'cldr',
        detectedLanguages: ['en'],
        mixedLanguage: false,
      },
    };

    const fusion = runForensicFusion(fakeContext);
    expect(fusion.evidencePools).toBeDefined();
    expect(Array.isArray(fusion.evidencePools.aiEvidence)).toBe(true);
    expect(Array.isArray(fusion.evidencePools.humanEvidence)).toBe(true);
    expect(Array.isArray(fusion.evidencePools.neutralEvidence)).toBe(true);
  });
});
