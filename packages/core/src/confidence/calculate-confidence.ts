import type {
  ConfidenceResult,
  ConfidenceFactor,
  LanguageResult,
  TextStatistics,
} from '@ai-detector/shared';
import type { EnsembleResult } from '../ensemble/run-ensemble.js';
import { clamp } from '@ai-detector/shared';

export function calculateConfidence(
  statistics: TextStatistics,
  language: LanguageResult,
  ensembleResult: EnsembleResult,
  extractionQuality: number,
  featureCoverage: number = 1.0,
): ConfidenceResult {
  const factors: ConfidenceFactor[] = [];
  const { words: wordCount } = statistics;

  // 1. Base confidence from text length (smooth square-root curve)
  // 50 words → 0.316, 100 → 0.447, 250 → 0.707, 500 → 1.0
  const lengthBase = Math.min(1.0, Math.sqrt(wordCount / 500));
  let score = lengthBase;

  if (lengthBase < 0.5) {
    factors.push({
      id: 'text-length',
      description: `Text length (${wordCount} words) limits confidence.`,
      impact: lengthBase - 0.8,
    });
  }

  // 2. Language support factor
  if (language.primary === 'unknown') {
    score -= 0.3;
    factors.push({ id: 'unsupported-lang', description: 'Unsupported language', impact: -0.3 });
  } else if (language.confidence < 0.7) {
    const reduction = -(1 - language.confidence) * 0.2;
    score += reduction;
    factors.push({
      id: 'low-lang-confidence',
      description: `Low language confidence (${(language.confidence * 100).toFixed(0)}%)`,
      impact: reduction,
    });
  }

  // 3. Detector agreement factor
  if (ensembleResult.detectorAgreement < 0.5) {
    const reduction = -(0.5 - ensembleResult.detectorAgreement) * 0.4;
    score += reduction;
    factors.push({
      id: 'low-agreement',
      description: `Low detector agreement (${(ensembleResult.detectorAgreement * 100).toFixed(0)}%)`,
      impact: reduction,
    });
  } else if (ensembleResult.detectorAgreement > 0.8) {
    const bonus = (ensembleResult.detectorAgreement - 0.8) * 0.2;
    score += bonus;
    factors.push({
      id: 'high-agreement',
      description: `High detector agreement (${(ensembleResult.detectorAgreement * 100).toFixed(0)}%)`,
      impact: bonus,
    });
  }

  // 4. Extraction quality factor
  if (extractionQuality < 1) {
    const reduction = -(1 - extractionQuality) * 0.5;
    score += reduction;
    factors.push({
      id: 'extraction-quality',
      description: 'Low extraction quality',
      impact: reduction,
    });
  }

  // 5. Feature coverage factor
  if (featureCoverage < 1) {
    const reduction = -(1 - featureCoverage) * 0.3;
    score += reduction;
    factors.push({
      id: 'feature-coverage',
      description: 'Partial feature coverage',
      impact: reduction,
    });
  }

  // 6. Distance-from-boundary factor: borderline results deserve lower confidence
  const aiLikelihood = ensembleResult.classification.aiLikelihood ?? 0.5;
  const distFromBoundary = Math.abs(aiLikelihood - 0.5) * 2; // 0 at boundary, 1 at extremes
  if (distFromBoundary < 0.3) {
    const reduction = -(0.3 - distFromBoundary) * 0.3;
    score += reduction;
    factors.push({
      id: 'borderline-result',
      description: 'Result is near the classification boundary',
      impact: reduction,
    });
  }

  // Hard caps for very short texts (preserve scientific caution)
  let lengthCap = 1.0;
  if (wordCount < 100) lengthCap = 0.35;
  else if (wordCount < 250) lengthCap = 0.60;
  else if (wordCount < 500) lengthCap = 0.80;

  score = clamp(score, 0, 1);
  if (score > lengthCap) score = lengthCap;

  // Confidence level
  let level: 'low' | 'medium' | 'high' = 'medium';
  if (score < 0.4) level = 'low';
  else if (score > 0.7) level = 'high';

  // Confidence interval: ± margin based on sample size and agreement
  const marginBase = 0.15;
  const lengthAdjust = Math.max(0.5, Math.min(1.0, 100 / Math.max(wordCount, 1)));
  const agreementAdjust = Math.max(0.5, 1 - ensembleResult.detectorAgreement);
  const margin = marginBase * lengthAdjust * agreementAdjust;

  const interval = {
    lower: clamp(aiLikelihood - margin, 0, 1),
    upper: clamp(aiLikelihood + margin, 0, 1),
  };

  return {
    score,
    level,
    factors,
    interval,
  };
}
