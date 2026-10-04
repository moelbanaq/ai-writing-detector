import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

export class StructuralRegularityDetector implements Detector {
  readonly id = 'structural-regularity';
  readonly version = '1.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    // Only return insufficient_data if text has fewer than 2 sentences and under 25 words
    if (context.statistics.sentences < 2 && context.statistics.words < 25) {
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

    const sentenceCvFeature = context.features.structural?.sentenceLengthCV;
    const sentenceCv = sentenceCvFeature ? sentenceCvFeature.value : 0;

    // Sentence length uniformity: AI writing tends to produce uniform sentence lengths (CV < 0.35)
    // Human writing has organic variance (CV > 0.45)
    const sentenceUniformity = Math.max(0, Math.min(1, 1 - sentenceCv / 0.6));

    // Paragraph length uniformity (evaluated when 2 or more paragraphs exist)
    const paraCvFeature = context.features.structural?.paragraphLengthCV;
    const paraCv = paraCvFeature ? paraCvFeature.value : 0;
    const hasMultipleParas = context.statistics.paragraphs >= 2;
    const paraUniformity = hasMultipleParas ? Math.max(0, Math.min(1, 1 - paraCv / 0.5)) : sentenceUniformity;

    // Combined structural score
    const score = hasMultipleParas
      ? Number((sentenceUniformity * 0.6 + paraUniformity * 0.4).toFixed(3))
      : Number(sentenceUniformity.toFixed(3));

    const confidence = Math.min(1, context.statistics.words / 60);
    const reliability = 0.8;

    const evidence: EvidenceItem[] = [];

    if (sentenceCv < 0.30 && context.statistics.sentences >= 3) {
      evidence.push({
        id: `${this.id}-uniform-sentences`,
        detectorId: this.id,
        feature: 'sentenceLengthCV',
        observedValue: sentenceCv,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation:
          'Low sentence length variation across sentences (uniform rhythm typical of AI generation).',
        reliability: 0.85,
        regionIds: [],
        limitations: [],
      });
    }

    if (hasMultipleParas && paraCv < 0.20) {
      evidence.push({
        id: `${this.id}-uniform-paragraphs`,
        detectorId: this.id,
        feature: 'paragraphLengthCv',
        observedValue: paraCv,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation:
          'Highly uniform paragraph lengths detected, typical of structured AI output.',
        reliability: 0.8,
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
