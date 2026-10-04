import type { TextRegion } from '@ai-detector/shared';
import { AI_PHRASES, HUMAN_MARKERS } from '../config/detection-rules.js';

export interface SentenceTell {
  type: string;
  matchedText: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RephraseSuggestion {
  rule: string;
  original: string;
  suggestion: string;
  tip: string;
}

export interface AnalyzedSentenceResult {
  aiLikelihood: number;
  confidence: number;
  evidenceIds: string[];
  tells: SentenceTell[];
  rephrasingSuggestions: RephraseSuggestion[];
}

// 1. Stock AI Words & Academic Inflation Phrases
const ACADEMIC_AI_PATTERNS = [
  // High-severity AI tells
  {
    pattern:
      /\bplays?\s+(a\s+)?(crucial|vital|pivotal|key|paramount|fundamental|critical)\s+role\b/gi,
    rule: 'AI Cliché: Crucial Role',
    explanation: 'Generic AI cliché dressing up standard functionality.',
    tip: 'State the specific chemical or physical mechanism directly.',
  },
  {
    pattern: /\b(delves?|delving)\s+into\b/gi,
    rule: 'AI Cliché: Delve',
    explanation: 'Characteristic chatbot vocabulary ("delves into").',
    tip: 'Use direct experimental verbs: "analyzes", "evaluates", or "quantifies".',
  },
  {
    pattern: /\bunderscores?\s+the\s+importance\b/gi,
    rule: 'AI Inflation: Underscore',
    explanation: 'Inflated staging of significance.',
    tip: 'State the exact experimental requirement or risk directly.',
  },
  {
    pattern: /\b(is|are)\s+of\s+paramount\s+importance\b/gi,
    rule: 'AI Cliché: Paramount',
    explanation: 'Overused AI filler for importance.',
    tip: 'Replace with specific compliance reasons or consequences.',
  },
  {
    pattern: /\b(serves?|serving)\s+as\s+a\s+testament\s+to\b/gi,
    rule: 'AI Stock: Testament',
    explanation: 'Florid rhetorical metaphor common in LLM prose.',
    tip: 'Use "demonstrates", "proves", or "validates".',
  },
  {
    pattern: /\b(beacon|tapestry|catalyst|cornerstone|linchpin)\s+of\b/gi,
    rule: 'AI Stock Metaphor',
    explanation: 'Grand rhetorical metaphor inappropriate for empirical papers.',
    tip: 'State the functional role clearly without metaphors.',
  },
  {
    pattern:
      /\b(comprehensive|holistic|multifaceted)\s+(benchmarking|approach|evaluation|assessment|framework|analysis)\b/gi,
    rule: 'AI Stock: Comprehensive/Holistic',
    explanation: 'Standard LLM boilerplate phrase.',
    tip: 'State the specific metrics evaluated (e.g. "evaluated across five metrics: MoGAPI, AGSA...").',
  },
  {
    pattern: /\b(paves?|paving)\s+the\s+way\s+for\b/gi,
    rule: 'AI Stock: Pave the way',
    explanation: 'Formulaic AI conclusion phrase.',
    tip: 'State what the method enables specifically.',
  },
  {
    pattern: /\b(a\s+)?(myriad|plethora|wide array|rich tapestry|broad spectrum)\s+of\b/gi,
    rule: 'AI Stock: Fluff Quantifier',
    explanation: 'Synthetic academic filler used by language models.',
    tip: 'Give the exact count or use "many" / "several".',
  },
  {
    pattern: /\b(seamless|seamlessly)\s+(integrat(e|ed|ing|ion))\b/gi,
    rule: 'AI Stock: Seamless',
    explanation: 'Marketing/LLM adjective ("seamlessly").',
    tip: 'Describe how steps connect operationally.',
  },
  {
    pattern: /\bexhibits?\s+remarkable\s+(potential|performance|efficacy|resolution)\b/gi,
    rule: 'AI Inflation: Remarkable',
    explanation: 'Subjective promotional praise common in LLM summaries.',
    tip: 'State the exact numerical metric (e.g. "achieved Rs = 13.52").',
  },

  // Medium-severity Academic Formulaic Framing
  {
    pattern: /\bnot\s+(only|just|merely)\s+([^,]+),\s*but\s+(also\s+)?/gi,
    rule: 'Staged Contrast (Not only X but Y)',
    explanation: 'Synthetic rhetorical cadence favored by language models.',
    tip: 'State both findings directly without the formulaic contrast.',
  },
  {
    pattern: /\b(rather\s+than|instead\s+of)\s+(relying\s+on|depending\s+on)\s+([^,]+),\s*/gi,
    rule: 'Staged Alternative Framing',
    explanation: 'Formulaic staging structure ("Rather than X, Y...").',
    tip: 'State the selected condition directly: "The mobile phase uses bio-ethanol and water..."',
  },
  {
    pattern:
      /\b(it\s+is\s+(worth|important|noteworthy|imperative|crucial|essential)\s+to\s+(note|mention|highlight|emphasize))\b/gi,
    rule: 'Staged Opener Filler',
    explanation: 'Padded conversational opener adding zero semantic content.',
    tip: 'Delete this phrase entirely and start directly with the statement.',
  },
  {
    pattern:
      /\b(furthermore|moreover|additionally|consequently|subsequently|in\s+conclusion|in\s+summary|overall,)\b/gi,
    rule: 'Mechanical Transition Starter',
    explanation: 'Robotic transition stacking typical of LLM paragraph flow.',
    tip: 'Rely on semantic coherence between ideas instead of formulaic sentence starters.',
  },
  {
    pattern:
      /\b(here,\s+we\s+present|in\s+this\s+(study|work|paper),\s+we\s+(present|report|describe|demonstrate))\b/gi,
    rule: 'Boilerplate Paper Transition',
    explanation: 'Standard transition template placed at the end of introductions.',
    tip: 'Connect the rationale to the method in one direct sentence.',
  },
  {
    pattern:
      /\b(provides?\s+a\s+(clean|reliable|promising|robust|novel|viable)\s+alternative\s+for)\b/gi,
    rule: 'Standard LLM Conclusion Formula',
    explanation: 'Template closing sentence pattern.',
    tip: 'State the specific industrial application and tested limits.',
  },
  {
    pattern: /\b(met\s+all\s+(pre-established|established|acceptance)\s+criteria)\b/gi,
    rule: 'Formulaic Validation Summary',
    explanation: 'Predictable boilerplate validation phrasing.',
    tip: 'Reference the specific ICH parameter limits passed.',
  },
  {
    pattern:
      /\b(fell|falling)\s+well\s+within\s+(their\s+)?(acceptance\s+)?(limits|thresholds)\b/gi,
    rule: 'Formulaic Threshold Phrasing',
    explanation: 'Standard AI completion pattern for validation sections.',
    tip: 'Cite the numerical margin (e.g. "purity angle 0.12 vs threshold 0.45").',
  },
  {
    pattern: /\b(to\s+the\s+best\s+of\s+our\s+knowledge)\b/gi,
    rule: 'Academic Cliché Qualifier',
    explanation: 'Overused boilerplate disclaimer.',
    tip: 'If unprecedented, state the previous limit in the literature directly.',
  },
  {
    pattern:
      /\b(can\s+be\s+considered\s+as\s+(a\s+)?|may\s+potentially\s+be\s+attributed\s+to)\b/gi,
    rule: 'Excessive Hedging',
    explanation: 'Double hedging typical of cautious LLM drafting.',
    tip: 'State the hypothesis or conclusion directly.',
  },
  {
    pattern: /\b(substantially|sharply|significantly)\s+(reduced|improved|increased|enhanced)\b/gi,
    rule: 'Unquantified Inflation Adverb',
    explanation: 'Subjective adverbial inflation common in AI text.',
    tip: 'Provide the percentage or factor change.',
  },
];

// Natural human academic tells (genuine author voice)
const HUMAN_ACADEMIC_PATTERNS = [
  {
    pattern:
      /\b(we\s+observed|we\s+noticed|in\s+our\s+hands|our\s+experience|we\s+decided\s+to)\b/gi,
    label: 'Personal Authorial Agency',
  },
  {
    pattern:
      /\b(unexpectedly|surprisingly|contrary\s+to\s+expectations|initially,\s+we\s+failed)\b/gi,
    label: 'Empirical Trial & Error',
  },
  {
    pattern: /\b(whereas|although|despite|even\s+though|in\s+contrast,\s+batch)\b/gi,
    label: 'Complex Organic Contrast',
  },
  {
    pattern: /\b(namely|specifically,\s+the\s+operator|manual\s+injection)\b/gi,
    label: 'Unscripted Laboratory Reality',
  },
];

export function analyzeSentence(
  sentence: TextRegion,
  index: number,
  allSentences: TextRegion[],
  _avgDocSentenceLength: number,
): AnalyzedSentenceResult {
  const text = sentence.text.trim();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const tells: SentenceTell[] = [];
  const suggestions: RephraseSuggestion[] = [];
  const evidenceIds: string[] = [];

  // Start with a neutral baseline
  let aiScore = 0.4;
  const confidence = 0.75;

  // Header or caption filtering
  if (wordCount < 4) {
    return {
      aiLikelihood: 0.2,
      confidence: 0.3,
      evidenceIds: ['short_heading'],
      tells: [],
      rephrasingSuggestions: [],
    };
  }

  // 1. Scan Academic AI Patterns
  for (const item of ACADEMIC_AI_PATTERNS) {
    const matches = text.match(item.pattern);
    if (matches) {
      matches.forEach((m) => {
        aiScore += 0.22;
        tells.push({
          type: 'academic_ai_pattern',
          matchedText: m,
          explanation: `${item.rule}: "${m}" — ${item.explanation}`,
          severity: 'high',
        });
        evidenceIds.push(`pattern:${m.toLowerCase().slice(0, 20).replace(/\s+/g, '_')}`);
        suggestions.push({
          rule: item.rule,
          original: m,
          suggestion: item.tip,
          tip: item.explanation,
        });
      });
    }
  }

  // 2. Scan Configured Weighted AI Phrases (avoid duplicate hits)
  const lowerText = text.toLowerCase();
  for (const [phrase, weight] of AI_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      const alreadyFlagged = tells.some((t) => t.matchedText.toLowerCase().includes(phrase.toLowerCase()));
      if (!alreadyFlagged) {
        aiScore += Math.min(0.25, 0.08 * weight);
        tells.push({
          type: 'weighted_ai_phrase',
          matchedText: phrase,
          explanation: `Characteristic AI rhetorical phrase: "${phrase}" (severity: ${weight.toFixed(1)}).`,
          severity: weight >= 1.8 ? 'high' : 'medium',
        });
        evidenceIds.push(`phrase:${phrase.slice(0, 20).replace(/\s+/g, '_')}`);
        suggestions.push({
          rule: 'AI Rhetorical Phrase',
          original: phrase,
          suggestion: 'Replace with direct, active scientific wording.',
          tip: 'Academic writing is clearest when statements focus on mechanisms rather than rhetorical transitions.',
        });
      }
    }
  }

  // 3. Scan Human Academic & Conversational Markers
  for (const item of HUMAN_ACADEMIC_PATTERNS) {
    const matches = text.match(item.pattern);
    if (matches) {
      aiScore -= 0.15 * matches.length;
    }
  }

  for (const marker of HUMAN_MARKERS) {
    const matches = text.match(marker);
    if (matches) {
      aiScore -= 0.12 * matches.length;
    }
  }

  // 3. Local Burstiness & Pacing (Sentence length rhythm)
  if (index > 0 && allSentences[index - 1]) {
    const prevWords = allSentences[index - 1]!.text.split(/\s+/).filter((w) => w.length > 0).length;
    const lenDiff = Math.abs(wordCount - prevWords);
    const meanLen = (wordCount + prevWords) / 2;
    const localBurstiness = meanLen > 0 ? lenDiff / meanLen : 0;

    // AI typically writes uniformly balanced sentences (length difference < 15%)
    if (localBurstiness < 0.12 && wordCount >= 16) {
      aiScore += 0.12;
      tells.push({
        type: 'low_burstiness',
        matchedText: `${wordCount} words vs preceding ${prevWords} words`,
        explanation: 'Low burstiness (identical sentence length rhythm to neighboring sentence).',
        severity: 'medium',
      });
      evidenceIds.push('low_burstiness_pacing');
      suggestions.push({
        rule: 'Vary Sentence Rhythm',
        original: text.slice(0, 35) + '...',
        suggestion:
          'Break this sentence into a shorter, punchy statement or vary clause complexity.',
        tip: 'Human academic prose naturally alternates between concise takeaways and detailed methodology clauses.',
      });
    } else if (localBurstiness > 0.5) {
      aiScore -= 0.1; // High rhythm variation is characteristic of natural human composition
    }
  }

  // Clamp final AI score to [0.08, 0.98]
  aiScore = Math.max(0.08, Math.min(0.98, aiScore));

  return {
    aiLikelihood: Number(aiScore.toFixed(3)),
    confidence: Number(confidence.toFixed(2)),
    evidenceIds,
    tells,
    rephrasingSuggestions: suggestions,
  };
}

export function analyzeAllSentences(
  sentences: TextRegion[],
  avgSentenceLength: number,
): TextRegion[] {
  return sentences.map((sentence, idx) => {
    const analysis = analyzeSentence(sentence, idx, sentences, avgSentenceLength);
    return {
      ...sentence,
      analysis: {
        aiLikelihood: analysis.aiLikelihood,
        confidence: analysis.confidence,
        evidenceIds: analysis.evidenceIds,
        tells: analysis.tells,
        rephrasingSuggestions: analysis.rephrasingSuggestions,
      } as any,
    };
  });
}
