import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

/**
 * Detects AI-generated text by analyzing the consistency of readability scores across paragraphs.
 * AI text tends to have very uniform readability, while human writing varies naturally.
 */
export class ReadabilityConsistencyDetector implements Detector {
  readonly id = 'readability-consistency';
  readonly version = '1.0.0';

  /**
   * Analyzes text for readability consistency.
   *
   * @param context - The detector context.
   * @returns The detector output including score and evidence.
   */
  analyze(context: DetectorContext): DetectorOutput {
    if (context.statistics.words < 100 || context.statistics.paragraphs < 2) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          status: 'insufficient_data',
          score: null,
          confidence: 0,
          reliability: 0,
          evidenceIds: [],
          limitations: [],
        },
        evidence: [],
      };
    }

    const { readabilityFeatures } = context.features;
    const fleschKincaidGrade = readabilityFeatures?.['fleschKincaidGrade'];
    const readabilityVarianceFeature = readabilityFeatures?.['readabilityVariance'];
    const gunningFogIndex = readabilityFeatures?.['gunningFogIndex'];

    if (
      !readabilityFeatures ||
      !fleschKincaidGrade ||
      !fleschKincaidGrade.available
    ) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          status: 'active',
          score: 0.5,
          confidence: 0,
          reliability: 0.3,
          evidenceIds: [],
          limitations: [],
        },
        evidence: [],
      };
    }

    const fkGrade = fleschKincaidGrade.value;
    const readabilityVariance = readabilityVarianceFeature?.available
      ? readabilityVarianceFeature.value
      : 0;

    const readabilityVarianceScore = Math.max(0, 1 - readabilityVariance * 0.5);
    const fkConformity = Math.max(0, 1 - Math.abs(fkGrade - 14) / 6);

    // Clamp score to [0, 1] just in case
    let score = readabilityVarianceScore * 0.65 + fkConformity * 0.35;
    score = Math.max(0, Math.min(1, score));

    const confidence = Math.min(1, context.statistics.words / 300);
    const reliability = 0.8;

    const evidence: EvidenceItem[] = [];

    if (readabilityVariance < 2.0 && context.statistics.paragraphs >= 3) {
      evidence.push({
        id: `${this.id}-low-variance`,
        detectorId: this.id,
        feature: 'readabilityVariance',
        observedValue: readabilityVariance,
        unit: 'variance',
        direction: 'ai_associated',
        interpretation: 'Low variance in readability across paragraphs suggests suspiciously uniform AI generation.',
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    if (fkGrade >= 12 && fkGrade <= 16) {
      evidence.push({
        id: `${this.id}-fk-conformity`,
        detectorId: this.id,
        feature: 'fleschKincaidGrade',
        observedValue: fkGrade,
        unit: 'grade',
        direction: 'ai_associated',
        interpretation: 'Overall readability matches typical AI academic text generation (Grade 12-16).',
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        status: 'active',
        score,
        confidence,
        reliability,
        evidenceIds: evidence.map((e) => e.id),
        limitations: [],
      },
      evidence,
    };
  }
}
