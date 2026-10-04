import { z } from 'zod';
import type { AIReasoningResult } from '@ai-detector/shared';

const clamp01 = z.number().min(0).max(1);

export const RawReasoningPayloadSchema = z.object({
  reasoningVersion: z.string().default('1.0.0'),
  assessment: z.enum(['supports_ai', 'supports_human', 'mixed', 'inconclusive']),
  strength: clamp01,
  supportingEvidence: z.array(z.string()).default([]),
  counterEvidence: z.array(z.string()).default([]),
  alternativeExplanations: z.array(z.string()).default([]),
  detectorConflicts: z.array(z.string()).default([]),
  segmentFindings: z.array(z.string()).default([]),
  adversarialFindings: z.array(z.string()).default([]),
  recommendation: z.enum(['accept', 'review', 'abstain']),
  reasoningConfidence: clamp01,
});

export type RawReasoningPayload = z.infer<typeof RawReasoningPayloadSchema>;

/**
 * Clean and attempt JSON repair on raw LLM strings (e.g. Markdown code fences or trailing commas).
 */
export function sanitizeAndParseJson(raw: string): any {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  // Find outermost JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt basic trailing comma removal
    const relaxed = cleaned.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(relaxed);
  }
}

export function validateAndFormatReasoningResult(
  parsedData: unknown,
  provider: string,
  model: string,
  latencyMs: number
): { success: true; result: AIReasoningResult } | { success: false; error: string } {
  const parsed = RawReasoningPayloadSchema.safeParse(parsedData);
  if (!parsed.success) {
    return {
      success: false,
      error: `Reasoning output schema violation: ${parsed.error.message}`,
    };
  }

  const d = parsed.data;
  return {
    success: true,
    result: {
      reasoningVersion: d.reasoningVersion,
      assessment: d.assessment,
      strength: Number(d.strength.toFixed(3)),
      supportingEvidence: d.supportingEvidence,
      counterEvidence: d.counterEvidence,
      alternativeExplanations: d.alternativeExplanations,
      detectorConflicts: d.detectorConflicts,
      segmentFindings: d.segmentFindings,
      adversarialFindings: d.adversarialFindings,
      recommendation: d.recommendation,
      reasoningConfidence: Number(d.reasoningConfidence.toFixed(3)),
      provider,
      model,
      latencyMs,
    },
  };
}
