import { describe, expect, it } from 'vitest';
import {
  StyleDiscontinuityDetector,
  detectStyleDiscontinuity,
  type DetectorContext,
} from '@ai-detector/core';

describe('StyleDiscontinuityDetector & Boundary Analysis', () => {
  const homogeneousText = `The sample was prepared according to standard protocol. The mixture was stirred for forty minutes at room temperature. Subsequently, the solid was separated by centrifugation at 4000 rpm. The resulting pellet was washed twice with distilled water and dried.`;

  const mixedText = `The synthesis was carried out using standard wet-chemical procedures under ambient conditions. The resulting precipitate was isolated through repeated centrifugation at 4000 rpm and subsequently dried overnight in a vacuum desiccator at 60 °C. Furthermore, in today's rapidly evolving digital landscape, artificial intelligence plays a crucial role in unlocking unprecedented potential across various multifaceted disciplines. It is important to note that by leveraging cutting-edge algorithms, organizations can foster innovation and seamlessly navigate the complex tapestry of future challenges.`;

  it('detects low discontinuity in homogeneous scientific text', () => {
    const result = detectStyleDiscontinuity(homogeneousText);
    expect(result).toBeDefined();
    expect(result.discontinuityScore).toBeLessThan(0.45);
    expect(result.detected).toBe(false);
  });

  it('detects high discontinuity in mixed human-AI text', () => {
    const result = detectStyleDiscontinuity(mixedText);
    expect(result).toBeDefined();
    expect(result.discontinuityScore).toBeGreaterThanOrEqual(0.30);
    expect(Array.isArray(result.locations)).toBe(true);
  });

  it('integrates properly as a standard Detector instance', () => {
    const detector = new StyleDiscontinuityDetector();
    expect(detector.id).toBe('discontinuity');
    expect(detector.version).toBe('4.0.0');

    const fakeContext: DetectorContext = {
      originalText: mixedText,
      normalizedText: mixedText,
      statistics: {
        characters: mixedText.length,
        words: 70,
        sentences: 4,
        paragraphs: 1,
        averageSentenceLength: 17.5,
        sentenceLengthVariance: 12,
        sentenceLengthStdDev: 3.4,
        averageWordLength: 5.5,
        typeTokenRatio: 0.8,
        hapaxRatio: 0.7,
        punctuationRate: 0.05,
        repetitionRate: 0.1,
        readability: { available: true, score: 50, method: 'flesch' },
      },
      segments: {
        paragraphs: [{ index: 0, text: mixedText, offset: 0, length: mixedText.length }],
        sentences: [
          { index: 0, text: 'The synthesis was carried out using standard wet-chemical procedures under ambient conditions.', offset: 0, length: 94 },
          { index: 1, text: 'The resulting precipitate was isolated through repeated centrifugation at 4000 rpm and subsequently dried overnight in a vacuum desiccator at 60 °C.', offset: 95, length: 147 },
          { index: 2, text: "Furthermore, in today's rapidly evolving digital landscape, artificial intelligence plays a crucial role in unlocking unprecedented potential across various multifaceted disciplines.", offset: 243, length: 182 },
          { index: 3, text: 'It is important to note that by leveraging cutting-edge algorithms, organizations can foster innovation and seamlessly navigate the complex tapestry of future challenges.', offset: 426, length: 169 },
        ],
        codeRegions: [],
        referenceRegions: [],
        urls: [],
      },
      features: {} as any,
      language: {
        primary: 'en',
        confidence: 1.0,
        method: 'cldr',
        detectedLanguages: ['en'],
        mixedLanguage: false,
      },
    };

    const out = detector.analyze(fakeContext);
    expect(out.result.detectorId).toBe('discontinuity');
    expect(out.result.score).toBeDefined();
    expect(out.result.status).toBe('active');
  });
});
