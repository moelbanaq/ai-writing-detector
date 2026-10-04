import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

/**
 * Detector that analyzes statistical over-conformity to expected distributions,
 * identifying texts that are 'statistically too perfect' — a common trait of AI text.
 */
export class DistributionalConformityDetector implements Detector {
  readonly id = 'distributional-conformity';
  readonly version = '1.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    const words = context.statistics.words;
    if (words < 100) {
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

    const distributional = context.features.distributional;
    const informationTheoretic = context.features.informationTheoretic;
    const lexical = context.features.lexical;

    const hasDistributional = distributional !== undefined;

    // Zipf over-conformity
    const zipfR2 = distributional?.zipfR2?.value ?? 0.95;
    const zipfDeviation = distributional?.zipfDeviation?.value ?? 0.1;
    const zipfScore = Math.max(0, Math.min(1, (zipfR2 - 0.93) / 0.07));
    const alphaConformity = Math.max(0, 1 - zipfDeviation * 3);
    const combinedZipf = zipfScore * 0.6 + alphaConformity * 0.4;

    // Entropy conformity
    const entropyVar = informationTheoretic?.entropyVariance?.value ?? 0.5;
    const entropyScore = Math.max(0, 1 - entropyVar * 4);

    // Function word conformity
    const funcWordRatio = lexical?.functionWordRatio?.value ?? 0.3;
    const funcDeviation = Math.abs(funcWordRatio - 0.325);
    const funcScore = Math.max(0, 1 - funcDeviation * 8);

    // Calculate overall score
    let score: number;
    if (hasDistributional) {
      score = combinedZipf * 0.40 + entropyScore * 0.35 + funcScore * 0.25;
    } else {
      score = entropyScore * 0.55 + funcScore * 0.45;
    }
    score = Math.max(0, Math.min(1, score));

    const confidence = Math.max(0, Math.min(1, words / 500));
    const reliability = hasDistributional ? 0.85 : 0.6;

    const evidence: EvidenceItem[] = [];

    if (zipfR2 > 0.97 && hasDistributional) {
      evidence.push({
        id: `${this.id}-zipf-overfit`,
        detectorId: this.id,
        feature: 'zipfR2',
        observedValue: zipfR2,
        unit: 'r-squared',
        direction: 'ai_associated',
        interpretation: `High conformity to Zipf's law (R²=${zipfR2.toFixed(3)}) suggests statistically over-regular word distribution.`,
        reliability: 0.85,
        regionIds: [],
        limitations: [],
      });
    }

    if (entropyVar < 0.1 && (informationTheoretic?.entropyVariance?.available ?? false)) {
      evidence.push({
        id: `${this.id}-entropy-uniform`,
        detectorId: this.id,
        feature: 'entropyVariance',
        observedValue: entropyVar,
        unit: 'variance',
        direction: 'ai_associated',
        interpretation: `Unusually low entropy variance (${entropyVar.toFixed(3)}) across text chunks.`,
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    if (funcDeviation < 0.03) {
      evidence.push({
        id: `${this.id}-funcword-conformity`,
        detectorId: this.id,
        feature: 'functionWordRatio',
        observedValue: funcWordRatio,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `Function word ratio (${(funcWordRatio * 100).toFixed(1)}%) closely matches AI-typical distribution.`,
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
