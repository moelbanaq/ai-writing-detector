import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

/**
 * HumanIrregularityDetector
 * Measures human-like irregularities in scientific prose, such as sentence start diversity,
 * hedging, parenthesis usage, and domain terminology density.
 * A higher score indicates stronger likelihood of human authorship.
 */
export class HumanIrregularityDetector implements Detector {
  readonly id = 'human-irregularity';
  readonly version = '2.0.0';

  /**
   * Analyzes text for human irregularity markers
   * @param context The detector context containing text and statistics
   * @returns DetectorOutput with human-likeness score
   */
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

    const { sentenceLengthCv } = context.features.stylometric;
    const cvVal = sentenceLengthCv ? sentenceLengthCv.value : 0;
    const cvVal_clamped = Math.min(1, Math.max(0, cvVal));
    
    const text = context.normalizedText.toLowerCase();
    const originalText = context.originalText;
    
    // 2. Sentence-start diversity
    const sentences = context.segments.sentences || [];
    const numSentences = sentences.length || context.statistics.sentences || 1;
    const openers = new Set<string>();
    
    for (const sentence of sentences) {
      const words = sentence.text.trim().split(/\s+/).slice(0, 2);
      if (words.length > 0) {
        openers.add(words.map((w: string) => w.toLowerCase()).join(' '));
      }
    }
    
    const diversity = openers.size / Math.max(1, numSentences);
    const sentenceStartScore = Math.min(1, diversity * 1.5);

    // 3. Parenthetical asides
    const parenCount = (originalText.match(/\(/g) || []).length;
    const parenRate = parenCount / Math.max(1, numSentences);
    const parenScore = Math.min(1, parenRate * 2);

    // 4. Self-correction / hedging variety
    const hedgeRegex = /\b(perhaps|possibly|likely|arguably|seemingly|admittedly|granted|conceivably)\b/gi;
    const abbrRegex = /\b(i\.e\.|e\.g\.|viz\.|cf\.|inter alia)\b/gi;
    const hedgeMatches1 = originalText.match(hedgeRegex) || [];
    const hedgeMatches2 = originalText.match(abbrRegex) || [];
    const hedgeCount = hedgeMatches1.length + hedgeMatches2.length;
    
    const numParagraphs = context.statistics.paragraphs || 1;
    const hedgeScore = Math.min(1, (hedgeCount / Math.max(1, numParagraphs)) * 0.5);

    // 5. Domain terminology density
    const wordsArray = originalText.match(/\b\w+\b/g) || [];
    const totalWords = context.statistics.words || Math.max(1, wordsArray.length);
    const longWords = wordsArray.filter(w => w.length >= 10).length;
    const longWordRate = longWords / Math.max(1, totalWords);
    const techScore = Math.min(1, longWordRate * 5);

    // 6. First-person check
    const hasFirstPerson = /\b(i|me|my|mine|we|us|our)\b/.test(text);
    const firstPersonBonus = hasFirstPerson ? 0.1 : 0;
    
    // 7. Exclamation check
    const hasExclamation = originalText.includes('!');

    // Final composite
    const score = Math.min(1,
      cvVal_clamped * 0.25 +
      sentenceStartScore * 0.20 +
      parenScore * 0.10 +
      hedgeScore * 0.15 +
      techScore * 0.15 +
      firstPersonBonus +
      (hasExclamation ? 0.05 : 0)
    );

    const confidence = Math.min(1, totalWords / 100);
    const reliability = 0.8;

    const evidence: EvidenceItem[] = [];
    
    if (score > 0.6) {
      evidence.push({
        id: `${this.id}-human-signals`,
        detectorId: this.id,
        feature: 'stylometric',
        observedValue: score,
        unit: 'score',
        direction: 'human_associated',
        interpretation: 'High variation and human-like markers detected (e.g. hedging, terminology, irregular sentence lengths).',
        reliability,
        regionIds: [],
        limitations: [],
      });
    }
    
    if (sentenceStartScore > 0.7 && numSentences >= 5) {
      evidence.push({
        id: `${this.id}-sentence-diversity`,
        detectorId: this.id,
        feature: 'stylometric',
        observedValue: sentenceStartScore,
        unit: 'score',
        direction: 'human_associated',
        interpretation: 'High sentence start diversity suggests human authorship.',
        reliability,
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
