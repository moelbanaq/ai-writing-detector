import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

export class StylometricDetector implements Detector {
  readonly id = 'stylometric';
  readonly version = '2.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    if (context.statistics.words < 10) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          score: null,
          confidence: 0,
          reliability: 0,
          status: 'insufficient_data',
          evidenceIds: [],
          limitations: [],
        },
        evidence: [],
      };
    }

    const wordCount = context.statistics.words;
    const sentenceCount = context.statistics.sentences;

    // 1. Sentence length uniformity (CV)
    const sentCv = context.features.stylometric.sentenceLengthCv?.value ?? 0;
    const uniformityScore = Math.max(0, 1 - sentCv / 0.7);

    // 2. Hapax Legomena conformity — AI clusters around 0.45-0.55 for 200+ word texts
    const hapaxRatio = context.features.lexical.hapaxLegomenaRatio?.value ?? 0;
    const expectedHapax = wordCount > 200 ? 0.50 : 0.65;
    const hapaxDeviation = Math.abs(hapaxRatio - expectedHapax);
    const hapaxConformity = Math.max(0, 1 - hapaxDeviation * 3);

    // 3. Function word ratio — AI typically stays in 0.28-0.35 range
    const funcWordRatio = context.features.lexical.functionWordRatio?.value ?? 0;
    const funcWordDeviation = Math.abs(funcWordRatio - 0.32);
    const funcWordConformity = Math.max(0, 1 - funcWordDeviation * 5);

    // 4. Punctuation diversity — AI uses narrower punctuation variety
    const punctDiv = context.features.stylometric.punctuationDiversity?.value ?? 0;
    const punctScore = Math.max(0, 1 - punctDiv * 2);

    // 5. Average word length conformity — AI averages ~4.5-5.5 chars
    const avgWordLen = context.features.lexical.averageWordLength?.value ?? 5.0;
    const wordLenDeviation = Math.abs(avgWordLen - 5.0);
    const wordLenConformity = Math.max(0, 1 - wordLenDeviation / 2);

    // Weighted composite across all stylometric signals
    const score = Math.min(
      1,
      Math.max(
        0,
        uniformityScore * 0.30 +
          hapaxConformity * 0.20 +
          funcWordConformity * 0.20 +
          punctScore * 0.15 +
          wordLenConformity * 0.15,
      ),
    );

    const confidence = Math.min(1, wordCount / 100);
    const reliability = Math.min(1, sentenceCount / 10);

    const evidence: EvidenceItem[] = [];
    if (sentCv < 0.3) {
      evidence.push({
        id: `${this.id}-uniform-sentences`,
        detectorId: this.id,
        feature: 'sentenceLengthCv',
        observedValue: sentCv,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `Low sentence length variation (CV=${sentCv.toFixed(2)}), typical of AI-generated uniform rhythm.`,
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }
    if (hapaxConformity > 0.7 && wordCount > 100) {
      evidence.push({
        id: `${this.id}-hapax-conformity`,
        detectorId: this.id,
        feature: 'hapaxLegomenaRatio',
        observedValue: hapaxRatio,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `Hapax ratio (${(hapaxRatio * 100).toFixed(1)}%) closely matches AI-typical vocabulary distribution.`,
        reliability: 0.75,
        regionIds: [],
        limitations: [],
      });
    }
    if (funcWordConformity > 0.7) {
      evidence.push({
        id: `${this.id}-funcword-conformity`,
        detectorId: this.id,
        feature: 'functionWordRatio',
        observedValue: funcWordRatio,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `Function word ratio (${(funcWordRatio * 100).toFixed(1)}%) falls within AI-typical range.`,
        reliability: 0.7,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        score,
        confidence,
        reliability,
        status: 'active',
        evidenceIds: evidence.map((e) => e.id),
        limitations: [],
      },
      evidence,
    };
  }
}
