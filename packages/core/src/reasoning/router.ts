export interface RoutingDecision {
  shouldInvokeLLM: boolean;
  reason: string;
}

export interface RoutingContext {
  forensicSignal: number; // 0..1
  detectorAgreement: number; // 0..1
  wordCount: number;
  discontinuityDetected: boolean;
  discontinuityScore: number;
  uncertaintyScore: number;
  userRequested?: boolean;
}

/**
 * Intelligent cost & performance router for AI Reasoning invocation.
 */
export function routeReasoning(context: RoutingContext): RoutingDecision {
  // 1. Explicit user request always invokes LLM
  if (context.userRequested) {
    return { shouldInvokeLLM: true, reason: 'EXPLICIT_USER_REQUEST' };
  }

  // 2. Low text quality / insufficient data -> abstain, no point calling LLM
  if (context.wordCount < 40) {
    return { shouldInvokeLLM: false, reason: 'CORPUS_TOO_SHORT_FOR_REASONING' };
  }

  // 3. Clear unambiguous human text (signal <= 0.15 with high agreement >= 0.70)
  if (context.forensicSignal <= 0.15 && context.detectorAgreement >= 0.70 && !context.discontinuityDetected) {
    return { shouldInvokeLLM: false, reason: 'UNAMBIGUOUS_HUMAN_TEXT' };
  }

  // 4. Clear unambiguous AI text (signal >= 0.88 with high agreement >= 0.70)
  if (context.forensicSignal >= 0.88 && context.detectorAgreement >= 0.70 && !context.discontinuityDetected) {
    return { shouldInvokeLLM: false, reason: 'UNAMBIGUOUS_AI_TEXT' };
  }

  // 5. Significant style discontinuity or suspected mixed authorship
  if (context.discontinuityDetected || context.discontinuityScore >= 0.45) {
    return { shouldInvokeLLM: true, reason: 'STYLE_DISCONTINUITY_SUSPECTED_MIXED' };
  }

  // 6. High detector disagreement (agreement < 0.45)
  if (context.detectorAgreement < 0.45) {
    return { shouldInvokeLLM: true, reason: 'HIGH_DETECTOR_DISAGREEMENT' };
  }

  // 7. Ambiguous borderline score near decision boundary (0.35 - 0.70)
  if (context.forensicSignal >= 0.35 && context.forensicSignal <= 0.70) {
    return { shouldInvokeLLM: true, reason: 'BORDERLINE_AMBIGUOUS_FORENSIC_SIGNAL' };
  }

  // 8. Elevated epistemic uncertainty
  if (context.uncertaintyScore >= 0.45) {
    return { shouldInvokeLLM: true, reason: 'HIGH_EPISTEMIC_UNCERTAINTY' };
  }

  return { shouldInvokeLLM: false, reason: 'STANDARD_CONFIDENT_ASSESSMENT' };
}
