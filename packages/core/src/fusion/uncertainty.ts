import type { UncertaintyModel, UncertaintyFactor, ActionRecommendation } from '@ai-detector/shared';

export interface UncertaintyInputs {
  detectorAgreement: number; // 0..1
  wordCount: number;
  sentenceCount: number;
  languageConfidence: number; // 0..1
  featureCoverage: number; // 0..1
  isCalibrated: boolean;
  segmentVariance?: number;
}

export function calculateUncertainty(inputs: UncertaintyInputs): UncertaintyModel {
  const factors: UncertaintyFactor[] = [];
  let totalWeightedUncertainty = 0;
  let totalWeight = 0;

  // 1. Detector Disagreement (Weight 0.30)
  const disagreement = Math.max(0, Math.min(1, 1 - inputs.detectorAgreement));
  totalWeightedUncertainty += disagreement * 0.30;
  totalWeight += 0.30;
  if (disagreement > 0.4) {
    factors.push({
      id: 'detector-disagreement',
      weight: Number(disagreement.toFixed(3)),
      description: `Detector families show high variance/disagreement (${(disagreement * 100).toFixed(0)}%).`,
    });
  }

  // 2. Text Length Constraints (Weight 0.25)
  let lengthPenalty = 0;
  if (inputs.wordCount < 60) lengthPenalty = 0.9;
  else if (inputs.wordCount < 120) lengthPenalty = 0.65;
  else if (inputs.wordCount < 250) lengthPenalty = 0.35;
  else if (inputs.wordCount < 500) lengthPenalty = 0.15;

  totalWeightedUncertainty += lengthPenalty * 0.25;
  totalWeight += 0.25;
  if (lengthPenalty > 0.3) {
    factors.push({
      id: 'short-text-deficit',
      weight: Number(lengthPenalty.toFixed(3)),
      description: `Limited corpus size (${inputs.wordCount} words) constrains statistical sample power.`,
    });
  }

  // 3. Language Confidence (Weight 0.15)
  const langPenalty = Math.max(0, 1 - inputs.languageConfidence);
  totalWeightedUncertainty += langPenalty * 0.15;
  totalWeight += 0.15;
  if (langPenalty > 0.3) {
    factors.push({
      id: 'low-language-confidence',
      weight: Number(langPenalty.toFixed(3)),
      description: 'Linguistic stopword distribution does not match training baseline with high confidence.',
    });
  }

  // 4. Feature Coverage (Weight 0.15)
  const coveragePenalty = Math.max(0, 1 - inputs.featureCoverage);
  totalWeightedUncertainty += coveragePenalty * 0.15;
  totalWeight += 0.15;
  if (coveragePenalty > 0.2) {
    factors.push({
      id: 'missing-features',
      weight: Number(coveragePenalty.toFixed(3)),
      description: `Only ${(inputs.featureCoverage * 100).toFixed(0)}% of forensic features could be computed from this text.`,
    });
  }

  // 5. Calibration State (Weight 0.15)
  const calibrationPenalty = inputs.isCalibrated ? 0 : 0.45;
  totalWeightedUncertainty += calibrationPenalty * 0.15;
  totalWeight += 0.15;
  if (!inputs.isCalibrated) {
    factors.push({
      id: 'uncalibrated-profile',
      weight: Number(calibrationPenalty.toFixed(3)),
      description: 'Operating in heuristic forensic mode without externally validated calibration coefficients.',
    });
  }

  const rawScore = totalWeight > 0 ? totalWeightedUncertainty / totalWeight : 0.5;
  const score = Number(Math.max(0.05, Math.min(0.95, rawScore)).toFixed(3));

  let level: UncertaintyModel['level'] = 'low';
  let recommendation: ActionRecommendation = 'accept';

  if (score >= 0.70) {
    level = 'critical';
    recommendation = 'abstain';
  } else if (score >= 0.45) {
    level = 'high';
    recommendation = 'review';
  } else if (score >= 0.25) {
    level = 'moderate';
    recommendation = 'review';
  }

  return {
    score,
    level,
    factors,
    recommendation,
  };
}
