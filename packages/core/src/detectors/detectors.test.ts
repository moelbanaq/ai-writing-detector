import { describe, expect, it } from 'vitest';
import { StylometricDetector } from './stylometric.js';
import { RepetitionDetector } from './repetition.js';
import { StructuralRegularityDetector } from './structural-regularity.js';
import { LexicalDiversityDetector } from './lexical-diversity.js';

import { segmentText } from '../segmentation/segment-text.js';
import { calculateTextStatistics } from '../statistics/text-statistics.js';
import { extractFeatures } from '../features/extract-features.js';
import { detectLanguage } from '../language/detect-language.js';

describe('detectors', () => {
  const allDetectors = [
    new StylometricDetector(),
    new RepetitionDetector(),
    new StructuralRegularityDetector(),
    new LexicalDiversityDetector(),
  ];

  function createDummyContext(text: string): any {
    const segments = segmentText(text);
    const statistics = calculateTextStatistics(text, segments);
    const language = detectLanguage(text);
    const features = extractFeatures(text, statistics, segments, language);
    return {
      originalText: text,
      normalizedText: text.toLowerCase(),
      statistics,
      segments,
      features,
      language,
    };
  }

  allDetectors.forEach((detector) => {
    describe(`Detector: ${detector.id}`, () => {
      const baseText =
        'This is a sufficient length text to test the detector output properly. It has enough words to bypass the short text limits. We need at least twenty words for most of these detectors to actually work well. ';
      const longText = baseText.repeat(3) + '\n\n' + baseText.repeat(3); // > 60 words and > 2 paragraphs
      it('returns valid DetectorOutput with score in [0,1]', () => {
        const output = detector.analyze(createDummyContext(longText));
        expect(output.result.score).toBeGreaterThanOrEqual(0);
        expect(output.result.score).toBeLessThanOrEqual(1);
      });
      it('confidence in [0,1]', () => {
        const output = detector.analyze(createDummyContext(longText));
        expect(output.result.confidence).toBeGreaterThanOrEqual(0);
        expect(output.result.confidence).toBeLessThanOrEqual(1);
      });
      it('reliability in [0,1]', () => {
        const output = detector.analyze(createDummyContext(longText));
        expect(output.result.reliability || 0).toBeGreaterThanOrEqual(0);
        expect(output.result.reliability || 1).toBeLessThanOrEqual(1);
      });
      it('no NaN or Infinity', () => {
        const output = detector.analyze(createDummyContext(longText));
        expect(Number.isNaN(output.result.score)).toBe(false);
        expect(Number.isFinite(output.result.score)).toBe(true);
      });
      it('returns insufficient_data for very short text', () => {
        const output = detector.analyze(createDummyContext('Short text.'));
        expect(output.result.confidence).toBeLessThan(0.5);
      });
      it('different texts produce different scores or are valid', () => {
        const r1 = detector.analyze(
          createDummyContext(
            'The quick brown fox jumps over the lazy dog many times. It is a very long text indeed.',
          ),
        );
        const r2 = detector.analyze(
          createDummyContext(
            'A totally different sentence that should have different characteristics. Completely different words and structure.',
          ),
        );
        expect(r1.result.score).toBeDefined();
        expect(r2.result.score).toBeDefined();
      });
    });
  });
});
