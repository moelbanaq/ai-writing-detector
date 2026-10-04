import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{M}]+(?:['’.-][\p{L}\p{M}]+)*/gu) || [];
}

const COMMON_FUNCTION_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'by', 'as'
]);

export interface DiscontinuityAnalysis {
  discontinuityScore: number;
  detected: boolean;
  locations: {
    segmentIndex: number;
    offset: number;
    magnitude: number;
    featureShifts: string[];
  }[];
}

export function detectStyleDiscontinuity(
  input: string | { text: string; startOffset?: number; offset?: number }[]
): DiscontinuityAnalysis {
  let sentences: { text: string; startOffset: number }[] = [];

  if (typeof input === 'string') {
    const rawMatches = input.match(/[^.!?]+(?:[.!?]+|$)/g) || [input];
    let curOffset = 0;
    sentences = rawMatches
      .map((t) => t.trim())
      .filter((t) => t.length > 5)
      .map((text) => {
        const item = { text, startOffset: curOffset };
        curOffset += text.length + 1;
        return item;
      });
  } else {
    sentences = input.map((s) => ({
      text: s.text,
      startOffset: s.startOffset ?? s.offset ?? 0,
    }));
  }

  if (sentences.length < 4) {
    return { discontinuityScore: 0, detected: false, locations: [] };
  }

  // Create sliding windows of 2 or 3 sentences
  const windowSize = sentences.length >= 8 ? 3 : 2;
  const step = sentences.length <= 6 ? windowSize : 2;
  const windows: {
    avgLength: number;
    ttr: number;
    punctRate: number;
    fnRate: number;
    startOffset: number;
  }[] = [];

  for (let i = 0; i <= sentences.length - windowSize; i += step) {
    const chunkSentences = sentences.slice(i, i + windowSize);
    const chunkText = chunkSentences.map((s) => s.text).join(' ');
    const words = tokenize(chunkText);

    if (words.length < 10) continue;

    const lens = chunkSentences.map((s) => tokenize(s.text).length);
    const avgLen = lens.reduce((a, b) => a + b, 0) / lens.length;
    const uniqWords = new Set(words).size;
    const ttr = uniqWords / words.length;

    const punctCount = (chunkText.match(/[,.!?;:()[\]{}"'“”‘’—–-]/g) || []).length;
    const punctRate = punctCount / Math.max(1, chunkText.length);

    const fnCount = words.filter((w) => COMMON_FUNCTION_WORDS.has(w)).length;
    const fnRate = fnCount / words.length;

    windows.push({
      avgLength: avgLen,
      ttr,
      punctRate,
      fnRate,
      startOffset: chunkSentences[0]!.startOffset,
    });
  }

  if (windows.length < 2) {
    return { discontinuityScore: 0, detected: false, locations: [] };
  }

  const shifts: {
    segmentIndex: number;
    offset: number;
    magnitude: number;
    featureShifts: string[];
  }[] = [];

  let maxShift = 0;

  for (let i = 1; i < windows.length; i++) {
    const prev = windows[i - 1]!;
    const curr = windows[i]!;

    const lenDelta = Math.abs(curr.avgLength - prev.avgLength) / Math.max(10, prev.avgLength);
    const ttrDelta = Math.abs(curr.ttr - prev.ttr);
    const punctDelta = Math.abs(curr.punctRate - prev.punctRate) / Math.max(0.01, prev.punctRate);
    const fnDelta = Math.abs(curr.fnRate - prev.fnRate);

    const shiftMagnitude = Math.min(
      1,
      lenDelta * 0.35 + ttrDelta * 1.5 + Math.min(1, punctDelta * 0.5) * 0.25 + fnDelta * 1.2
    );

    const featureShifts: string[] = [];
    if (lenDelta > 0.45) featureShifts.push(`sentence_length_shift(${lenDelta.toFixed(2)})`);
    if (ttrDelta > 0.18) featureShifts.push(`lexical_diversity_shift(${ttrDelta.toFixed(2)})`);
    if (punctDelta > 0.5) featureShifts.push(`punctuation_profile_shift(${punctDelta.toFixed(2)})`);
    if (fnDelta > 0.12) featureShifts.push(`function_word_shift(${fnDelta.toFixed(2)})`);

    if (shiftMagnitude >= 0.35) {
      shifts.push({
        segmentIndex: i,
        offset: curr.startOffset,
        magnitude: Number(shiftMagnitude.toFixed(3)),
        featureShifts,
      });
    }

    if (shiftMagnitude > maxShift) {
      maxShift = shiftMagnitude;
    }
  }

  return {
    discontinuityScore: Number(maxShift.toFixed(3)),
    detected: shifts.length > 0 && maxShift >= 0.45,
    locations: shifts,
  };
}

export class StyleDiscontinuityDetector implements Detector {
  readonly id = 'discontinuity';
  readonly version = '4.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    const sentences = context.segments.sentences;
    const wordCount = context.statistics.words;

    if (sentences.length < 4 || wordCount < 50) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          score: null,
          confidence: 0,
          reliability: 0,
          status: 'insufficient_data',
          evidenceIds: [],
          limitations: ['REQUIRES_AT_LEAST_4_SENTENCES'],
        },
        evidence: [],
      };
    }

    const discontinuity = detectStyleDiscontinuity(sentences);
    const confidence = Math.min(1, wordCount / 300);
    const reliability = 0.76;

    const evidence: EvidenceItem[] = [];

    if (discontinuity.detected) {
      evidence.push({
        id: `${this.id}-abrupt-stylistic-shift`,
        detectorId: this.id,
        feature: 'styleDiscontinuityScore',
        observedValue: discontinuity.discontinuityScore,
        unit: 'index',
        direction: 'neutral', // Discontinuity alone is not proof of AI; indicates boundary / potential mixed authorship
        interpretation: `Detected ${discontinuity.locations.length} localized stylistic discontinuity boundary(ies) (max magnitude: ${discontinuity.discontinuityScore.toFixed(2)}), suggesting heterogeneous sections or mixed authorship.`,
        reliability: 0.78,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        score: discontinuity.discontinuityScore,
        confidence: Number(confidence.toFixed(2)),
        reliability,
        status: 'active',
        evidenceIds: evidence.map((e) => e.id),
        limitations: [],
      },
      evidence,
    };
  }
}
