import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

export class LexicalDiversityDetector implements Detector {
  readonly id = 'lexical-diversity';
  readonly version = '2.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    if (context.statistics.words < 20) {
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

    const ttr = context.features.lexical.typeTokenRatio;
    const typeTokenRatio = ttr ? ttr.value : 0;
    const wordCount = context.statistics.words;

    const expectedTtr = Math.max(0.2, Math.min(0.9, 1.1 - 0.15 * Math.log(wordCount)));

    const words = (context.originalText || '').trim().split(/\s+/).map(w => w.toLowerCase()).filter(w => w.length > 0);
    const N = words.length;

    let mattrValue = typeTokenRatio;
    const windowSize = 50;
    if (N >= windowSize) {
      let ttrSum = 0;
      const windowsCount = N - windowSize + 1;
      for (let i = 0; i < windowsCount; i++) {
        const windowWords = words.slice(i, i + windowSize);
        const unique = new Set(windowWords).size;
        ttrSum += unique / windowSize;
      }
      mattrValue = ttrSum / windowsCount;
    }

    const wordFreqs = new Map<string, number>();
    for (const w of words) {
      wordFreqs.set(w, (wordFreqs.get(w) || 0) + 1);
    }
    
    const freqOfFreq = new Map<number, number>();
    for (const freq of wordFreqs.values()) {
      freqOfFreq.set(freq, (freqOfFreq.get(freq) || 0) + 1);
    }
    
    let m2 = 0;
    for (const [freq, count] of freqOfFreq.entries()) {
      m2 += freq * freq * count;
    }
    const yulesK = N > 0 ? Math.max(0, 10000 * (m2 - N) / (N * N)) : 0;

    const ttrDiff = Math.abs(typeTokenRatio - expectedTtr);
    const ttrScore = Math.max(0, 1 - ttrDiff * 2);
    
    const mattrConformity = Math.max(0, 1 - Math.abs(mattrValue - 0.75) * 5);
    const yuleConformity = Math.max(0, 1 - yulesK / 200);
    
    let combinedScore = ttrScore * 0.40 + mattrConformity * 0.35 + yuleConformity * 0.25;
    combinedScore = Math.max(0, Math.min(1, combinedScore));

    const confidence = Math.min(1, wordCount / 100);
    const reliability = 0.8;

    const evidence: EvidenceItem[] = [];
    if (combinedScore > 0.7) {
      evidence.push({
        id: `${this.id}-ai-ttr`,
        detectorId: this.id,
        feature: 'typeTokenRatio',
        observedValue: typeTokenRatio,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: 'Lexical diversity matches typical AI generation patterns.',
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    if (mattrConformity > 0.7 && wordCount >= 100) {
      evidence.push({
        id: `${this.id}-ai-mattr`,
        detectorId: this.id,
        feature: 'mattrValue',
        observedValue: mattrValue,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: 'Moving Average TTR strongly conforms to AI text distributions.',
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        score: combinedScore,
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
