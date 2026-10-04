import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{M}]+(?:['’.-][\p{L}\p{M}]+)*/gu) || [];
}

function wordFreqVector(words: string[]): Record<string, number> {
  const vec: Record<string, number> = {};
  for (const w of words) {
    vec[w] = (vec[w] || 0) + 1;
  }
  return vec;
}

function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const k of keys) {
    const valA = vecA[k] || 0;
    const valB = vecB[k] || 0;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const denom = Math.sqrt(normA * normB);
  return denom > 1e-9 ? dot / denom : 0;
}

export class SemanticDetector implements Detector {
  readonly id = 'semantic';
  readonly version = '4.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    const sentences = context.segments.sentences;
    const wordCount = context.statistics.words;

    if (sentences.length < 3 || wordCount < 50) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          score: null,
          confidence: 0,
          reliability: 0,
          status: 'insufficient_data',
          evidenceIds: [],
          limitations: ['INSUFFICIENT_SENTENCES_FOR_SEMANTIC_ANALYSIS'],
        },
        evidence: [],
      };
    }

    const sentenceVectors = sentences.map((s) => wordFreqVector(tokenize(s.text)));
    const adjacentSimilarities: number[] = [];

    for (let i = 1; i < sentenceVectors.length; i++) {
      adjacentSimilarities.push(cosineSimilarity(sentenceVectors[i - 1]!, sentenceVectors[i]!));
    }

    const avgAdjacentSim =
      adjacentSimilarities.reduce((a, b) => a + b, 0) / adjacentSimilarities.length;

    // AI generation frequently exhibits higher uniform semantic cohesion between adjacent sentences (0.25 - 0.50+)
    // Natural human writing shows organic topic shifts and lower lexical overlap between successive sentences
    const semanticScore = Math.max(0, Math.min(1, (avgAdjacentSim - 0.12) / 0.35));
    const confidence = Math.min(1, wordCount / 250);
    const reliability = 0.72;

    const evidence: EvidenceItem[] = [];

    if (avgAdjacentSim > 0.28) {
      evidence.push({
        id: `${this.id}-high-adjacent-cohesion`,
        detectorId: this.id,
        feature: 'adjacentSentenceSimilarity',
        observedValue: Number(avgAdjacentSim.toFixed(4)),
        unit: 'cosine_similarity',
        direction: 'ai_associated',
        interpretation: `Unusually high adjacent sentence lexical/semantic similarity (${avgAdjacentSim.toFixed(2)}), typical of LLM paragraph smoothing.`,
        reliability: 0.75,
        regionIds: [],
        limitations: [],
      });
    } else if (avgAdjacentSim < 0.15 && sentences.length >= 5) {
      evidence.push({
        id: `${this.id}-organic-sentence-diversity`,
        detectorId: this.id,
        feature: 'adjacentSentenceSimilarity',
        observedValue: Number(avgAdjacentSim.toFixed(4)),
        unit: 'cosine_similarity',
        direction: 'human_associated',
        interpretation: `Low adjacent sentence lexical overlap (${avgAdjacentSim.toFixed(2)}), characteristic of natural human discourse development.`,
        reliability: 0.7,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        score: Number(semanticScore.toFixed(4)),
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
