import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';
import { AI_PHRASES } from '../config/detection-rules.js';

export class AIPatternDetector implements Detector {
  readonly id = 'ai-pattern';
  readonly version = '3.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    const wordCount = context.statistics.words;
    if (wordCount < 30) {
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

    const paragraphCount = Math.max(1, context.statistics.paragraphs);
    const textLower = context.normalizedText.toLowerCase();

    // 1. List / enumeration pattern
    const listPatternRegex = /^\d+\.\s|^-\s|^\*\s/gm;
    const listMatches = context.originalText.match(listPatternRegex) || [];
    const listDensity = listMatches.length / paragraphCount;
    const listScore = Math.min(1, listDensity * 2);

    // 2. AI Rhetorical Clichés with Severity Multipliers
    let rhetoricalMatchCount = 0;
    let totalWeight = 0;
    const matchedPhrases: string[] = [];

    for (const [phrase, weight] of AI_PHRASES) {
      const occurrences = textLower.split(phrase.toLowerCase()).length - 1;
      if (occurrences > 0) {
        rhetoricalMatchCount += occurrences;
        totalWeight += occurrences * weight;
        matchedPhrases.push(`"${phrase}" (x${occurrences})`);
      }
    }

    // Weighted phrase density per 100 words
    const weightedRate = (totalWeight / wordCount) * 100;
    // 2.2+ weighted severity units per 100 words indicates dense LLM cadence
    const rhetoricalScore = Math.min(1, weightedRate / 2.2);

    // Combined pattern score
    let score: number;
    if (listMatches.length > 0) {
      score = listScore * 0.35 + rhetoricalScore * 0.65;
    } else {
      score = rhetoricalScore;
    }
    score = Math.min(1, Math.max(0, score));

    const confidence = Math.min(1, wordCount / 100);
    const reliability = 0.82;

    const evidence: EvidenceItem[] = [];

    if (listMatches.length > 2) {
      evidence.push({
        id: `${this.id}-list-pattern`,
        detectorId: this.id,
        feature: 'listDensity',
        observedValue: listDensity,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `List/enumeration density of ${listDensity.toFixed(2)} per paragraph, typical of AI summaries.`,
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    if (rhetoricalMatchCount >= 1) {
      evidence.push({
        id: `${this.id}-rhetorical-cliches`,
        detectorId: this.id,
        feature: 'weightedRhetoricalRate',
        observedValue: Number(weightedRate.toFixed(2)),
        unit: 'per_100_words',
        direction: 'ai_associated',
        interpretation: `AI rhetorical markers: ${rhetoricalMatchCount} occurrences (${matchedPhrases.slice(0, 3).join(', ')}), weighted severity ${weightedRate.toFixed(1)}/100 words.`,
        reliability: 0.85,
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
