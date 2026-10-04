export interface CalibrationProfile {
  version: string;
  intercept: number;
  weights: Record<string, number>;
  temperature: number;
  prior: number;
  validated: boolean;
  brierScore?: number;
  trainingSamples?: number;
  validationRequired?: boolean;
}

/**
 * Weighted AI rhetorical templates with severity multipliers.
 * Higher weight indicates stronger LLM generation signature.
 * Updates can be made directly to this array for future releases.
 */
export const AI_PHRASES: [string, number][] = [
  ['plays a crucial role', 2.2],
  ['plays a vital role', 2.0],
  ['plays a pivotal role', 2.0],
  ['plays a key role', 1.8],
  ['it is important to note', 2.0],
  ['it is worth noting', 1.8],
  ['it should be noted', 1.8],
  ['in today’s rapidly evolving', 2.0],
  ["in today's rapidly evolving", 2.0],
  ['rapidly evolving digital landscape', 2.0],
  ['in today’s digital world', 1.6],
  ["in today's digital world", 1.6],
  ['delve into', 1.5],
  ['delve deep into', 1.8],
  ['delving into', 1.5],
  ['multifaceted', 1.0],
  ['ever-evolving', 1.0],
  ['seamless integration', 1.2],
  ['seamlessly integrate', 1.2],
  ['robust framework', 1.0],
  ['comprehensive understanding', 1.0],
  ['foster innovation', 1.0],
  ['fostering innovation', 1.0],
  ['harness the power', 1.2],
  ['navigate the complex', 1.2],
  ['navigate the challenges', 1.2],
  ['underscores the importance', 1.2],
  ['paving the way', 1.0],
  ['a testament to', 1.0],
  ['in the realm of', 1.0],
  ['at the forefront', 1.0],
  ['furthermore', 0.8],
  ['moreover', 0.8],
  ['additionally', 0.7],
  ['in conclusion', 0.8],
  ['in summary', 0.7],
  ['to summarize', 0.7],
  ['streamlining workflows', 0.9],
  ['by leveraging', 0.9],
  ['rich tapestry', 1.4],
  ['beacon of', 1.2],
  ['myriad of', 1.0],
  ['plethora of', 1.0],
];

/**
 * Natural human authorial and conversational markers that mitigate AI scores.
 */
export const HUMAN_MARKERS: RegExp[] = [
  /\b(?:uh|um|well|okay|ok|actually|honestly|basically)\b/gi,
  /\.{3}|…/g,
  /--|—/g,
  /\b(?:i think|i guess|i'd say|to me|in my view|from my experience|we observed|in our hands)\b/gi,
  /\b(?:can't|won't|don't|isn't|aren't|didn't|doesn't|it's|i'm|we're)\b/gi,
];

/**
 * Standard classification cutoff thresholds.
 */
export const DEFAULT_THRESHOLDS = {
  aiLikely: 0.65,
  aiEditedLikely: 0.45,
  humanLikely: 0.35,
};

/**
 * Default unvalidated prior calibration profile.
 */
export const DEFAULT_CALIBRATION: CalibrationProfile = {
  version: '3.0.0-unvalidated',
  intercept: 0,
  weights: {},
  temperature: 1,
  prior: 0.5,
  validated: false,
};
