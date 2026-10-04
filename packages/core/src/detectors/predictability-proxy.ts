import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

const AI_TRANSITIONS = new Set([
  'furthermore',
  'moreover',
  'additionally',
  'in conclusion',
  'it is important to note',
  'it is worth mentioning',
  'on the other hand',
  'in terms of',
  'with regard to',
  'as a result',
  'in this context',
  'ultimately',
  'consequently',
  'subsequently',
  'in summary',
  'to summarize',
  'it should be noted',
  'it is crucial to',
]);

function computeTransitionDensity(text: string, wordCount: number): number {
  if (wordCount === 0) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  AI_TRANSITIONS.forEach((phrase) => {
    let idx = -1;
    while ((idx = lower.indexOf(phrase, idx + 1)) !== -1) {
      count++;
    }
  });
  return count / wordCount;
}

export class PredictabilityProxyDetector implements Detector {
  readonly id = 'predictability-proxy';
  readonly version = '2.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    if (context.statistics.words < 50) {
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

    // 1. Entropy uniformity: low variance of per-chunk entropy → AI
    const entropyVar = context.features.informationTheoretic?.entropyVariance;
    const entropyVarVal = entropyVar?.available ? entropyVar.value : 0.3;
    const entropyScore = Math.max(0, 1 - entropyVarVal * 5);

    // 2. Zipf over-conformity: R² too close to 1.0 → AI
    const zipfR2Feature = context.features.distributional?.zipfR2;
    const zipfR2 = zipfR2Feature?.available ? zipfR2Feature.value : 0.95;
    const zipfScore = Math.max(0, Math.min(1, (zipfR2 - 0.93) / 0.07));

    // 3. Character-bigram entropy: lower → more predictable → AI
    const bigramEntropyFeature = context.features.informationTheoretic?.charBigramEntropy;
    const bigramEntropy = bigramEntropyFeature?.available ? bigramEntropyFeature.value : 4.0;
    const entropyBaseline = 4.2;
    const bigramScore =
      bigramEntropy < entropyBaseline
        ? Math.max(0, 1 - (bigramEntropy - 3.0) / (entropyBaseline - 3.0))
        : 0;

    // 4. Transition phrase density as a sub-signal
    const transitionDensity = computeTransitionDensity(
      context.normalizedText,
      context.statistics.words,
    );
    const transitionScore = Math.min(1, transitionDensity * 30);

    // Determine if advanced features are available
    const hasAdvancedFeatures =
      (entropyVar?.available ?? false) || (zipfR2Feature?.available ?? false);

    // Weighted composite — adjust weights based on feature availability
    let score: number;
    if (hasAdvancedFeatures) {
      score = Math.min(
        1,
        entropyScore * 0.30 + zipfScore * 0.25 + bigramScore * 0.20 + transitionScore * 0.25,
      );
    } else {
      // Fallback: heavier weight on transition phrases when advanced features unavailable
      score = Math.min(1, bigramScore * 0.40 + transitionScore * 0.60);
    }

    const confidence = Math.min(1, context.statistics.words / 200);
    const reliability = hasAdvancedFeatures ? 0.85 : 0.7;

    const evidence: EvidenceItem[] = [];

    if (entropyVarVal < 0.1 && (entropyVar?.available ?? false)) {
      evidence.push({
        id: `${this.id}-entropy-uniform`,
        detectorId: this.id,
        feature: 'entropyVariance',
        observedValue: entropyVarVal,
        unit: 'variance',
        direction: 'ai_associated',
        interpretation: `Very low entropy variance (${entropyVarVal.toFixed(3)}) across text chunks indicates uniform predictability typical of AI.`,
        reliability: 0.85,
        regionIds: [],
        limitations: [],
      });
    }

    if (zipfR2 > 0.97 && (zipfR2Feature?.available ?? false)) {
      evidence.push({
        id: `${this.id}-zipf-overfit`,
        detectorId: this.id,
        feature: 'zipfR2',
        observedValue: zipfR2,
        unit: 'r-squared',
        direction: 'ai_associated',
        interpretation: `Zipf R²=${zipfR2.toFixed(3)} indicates over-conformity to expected word frequency distribution.`,
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    if (transitionScore > 0.5) {
      evidence.push({
        id: `${this.id}-high-transitions`,
        detectorId: this.id,
        feature: 'transitionPhraseDensity',
        observedValue: transitionDensity,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `High density of formulaic transition phrases (${(transitionDensity * 100).toFixed(1)}% of words).`,
        reliability: 0.75,
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
