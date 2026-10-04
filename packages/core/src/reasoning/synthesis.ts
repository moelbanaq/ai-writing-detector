import type { ClassificationResult, AIReasoningResult } from '@ai-detector/shared';

export interface SynthesisOptions {
  reasoningWeight?: number; // bounded [0, 0.30], defaults to 0.20
}

export function synthesizeForensicAndReasoning(
  classification: ClassificationResult,
  reasoning: AIReasoningResult,
  options: SynthesisOptions = {}
): ClassificationResult {
  const maxInfluence = Math.min(0.30, Math.max(0.05, options.reasoningWeight ?? 0.20));
  const baseSignal = classification.forensicSignal;

  let adjustment = 0;
  if (reasoning.assessment === 'supports_ai') {
    adjustment = Math.min(0.20, maxInfluence * reasoning.strength * reasoning.reasoningConfidence);
  } else if (reasoning.assessment === 'supports_human') {
    adjustment = -Math.min(0.20, maxInfluence * reasoning.strength * reasoning.reasoningConfidence);
  }

  const synthesizedScore = Number(Math.max(0.02, Math.min(0.98, baseSignal + adjustment)).toFixed(4));

  // Determine updated label with bounded influence
  let label = classification.label;
  let basis = classification.basis;

  if (reasoning.assessment === 'mixed' && classification.mixedAuthorship.discontinuityScore >= 0.35) {
    label = 'mixed';
    basis = 'ai_reasoning_synthesis';
  } else if (classification.calibrationStatus === 'calibrated' || classification.calibrationStatus === 'externally_validated') {
    // Calibration remains the statistical authority; reasoning adjusts confidence and explanations rather than overwriting probabilities
    label = classification.label;
  } else {
    // Uncalibrated forensic mode: synthesize
    basis = 'ai_reasoning_synthesis';
    if (synthesizedScore >= 0.75) {
      label = 'ai_likely';
    } else if (synthesizedScore <= 0.25) {
      label = 'human_likely';
    } else if (synthesizedScore >= 0.48) {
      label = 'ai_edited_likely';
    } else {
      label = 'inconclusive';
    }
  }

  return {
    ...classification,
    label,
    basis,
    aiLikelihood: synthesizedScore,
    humanLikelihood: Number((1 - synthesizedScore).toFixed(4)),
    editedAILikelihood: label === 'ai_edited_likely' ? synthesizedScore : null,
  };
}
