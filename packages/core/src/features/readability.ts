/**
 * Interface representing various readability metrics for text analysis.
 */
export interface ReadabilityScores {
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  automatedReadabilityIndex: number;
  averageSyllablesPerWord: number;
  complexWordRatio: number;
}

/**
 * Counts the syllables in a given word using vowel-cluster heuristics.
 *
 * @param word - The word to count syllables for.
 * @returns The estimated number of syllables.
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  
  if (word.length <= 3) return 1;

  let count = 0;
  
  const vowels = /[aeiouy]+/g;
  const matches = word.match(vowels);
  if (matches) {
    count = matches.length;
  }
  
  // Handle silent 'e', '-es', and '-ed' endings
  if (word.endsWith('e')) {
    if (
      word.endsWith('le') &&
      word.length > 2 &&
      /[^aeiouy]/.test(word[word.length - 3] ?? '')
    ) {
      // 'le' after a consonant is typically a syllable (e.g., apple, table)
    } else if (count > 1) {
      // General silent 'e'
      count -= 1;
    }
  } else if (word.endsWith('es')) {
    const withoutSuffix = word.substring(0, word.length - 2);
    // Usually doesn't add a syllable unless preceded by c, g, s, z, ch, sh
    if (
      !(
        /[cgsz]/.test(withoutSuffix.slice(-1)) ||
        withoutSuffix.endsWith('ch') ||
        withoutSuffix.endsWith('sh')
      )
    ) {
      if (count > 1) count -= 1;
    }
  } else if (word.endsWith('ed')) {
    const withoutSuffix = word.substring(0, word.length - 2);
    // Usually doesn't add a syllable unless preceded by t or d
    if (!(withoutSuffix.endsWith('t') || withoutSuffix.endsWith('d'))) {
      if (count > 1) count -= 1;
    }
  }

  // Every word has at least one syllable
  return Math.max(1, count);
}

/**
 * Determines if a word is complex (3+ syllables, excluding common suffixes).
 *
 * @param word - The word to evaluate.
 * @returns True if complex, false otherwise.
 */
export function isComplexWord(word: string): boolean {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  
  // Strip common suffixes for complex word check (Gunning Fog rule)
  let baseWord = word;
  const suffixes = ['ing', 'ed', 'es', 'ly'];
  for (const suffix of suffixes) {
    if (baseWord.endsWith(suffix) && baseWord.length > suffix.length + 2) {
      baseWord = baseWord.substring(0, baseWord.length - suffix.length);
      break; // Only strip one suffix
    }
  }
  
  return countSyllables(baseWord) >= 3;
}

/**
 * Calculates various readability metrics for a given text.
 *
 * @param text - The text to analyze.
 * @param wordCount - The total word count.
 * @param sentenceCount - The total sentence count.
 * @returns An object containing readability scores.
 */
export function calculateReadability(
  text: string,
  wordCount: number,
  sentenceCount: number,
): ReadabilityScores {
  if (wordCount === 0 || sentenceCount === 0) {
    return {
      fleschKincaidGrade: 0,
      gunningFogIndex: 0,
      automatedReadabilityIndex: 0,
      averageSyllablesPerWord: 0,
      complexWordRatio: 0,
    };
  }

  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  let totalSyllables = 0;
  let complexWords = 0;
  let charCount = 0;

  for (const word of words) {
    charCount += word.length;
    totalSyllables += countSyllables(word);
    if (isComplexWord(word)) {
      complexWords++;
    }
  }

  const actualWordCount = Math.max(1, words.length);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / actualWordCount;
  const complexWordRatio = complexWords / actualWordCount;
  const avgCharsPerWord = charCount / actualWordCount;

  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade =
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  // Gunning Fog Index
  const gunningFogIndex =
    0.4 * (avgWordsPerSentence + 100 * complexWordRatio);

  // Automated Readability Index (ARI)
  const automatedReadabilityIndex =
    4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43;

  return {
    fleschKincaidGrade,
    gunningFogIndex,
    automatedReadabilityIndex,
    averageSyllablesPerWord: avgSyllablesPerWord,
    complexWordRatio,
  };
}

/**
 * Calculates the population variance of the Flesch-Kincaid grade across paragraphs.
 * Only paragraphs with at least 10 words are considered.
 *
 * @param paragraphTexts - An array of paragraph strings.
 * @returns The variance of Flesch-Kincaid scores, or 0 if insufficient data.
 */
export function calculateReadabilityVariance(paragraphTexts: string[]): number {
  const scores: number[] = [];

  for (const p of paragraphTexts) {
    const words = p
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    if (words.length >= 10) {
      // Rough sentence count estimation for the paragraph
      const sentences =
        p.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
      
      const metrics = calculateReadability(p, words.length, sentences);
      scores.push(metrics.fleschKincaidGrade);
    }
  }

  if (scores.length < 2) {
    return 0;
  }

  const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
  const variance =
    scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    scores.length;

  return variance;
}
