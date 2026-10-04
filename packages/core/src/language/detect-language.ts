import type { LanguageResult } from '@ai-detector/shared';

const EN_STOPS = new Set([
  'the',
  'is',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'been',
  'being',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'this',
  'that',
  'these',
  'those',
  'with',
  'from',
  'for',
  'and',
  'but',
  'or',
  'not',
  'no',
  'yes',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'than',
  'too',
  'very',
  'can',
  'just',
  'don',
  'now',
]);
const FR_STOPS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'de',
  'du',
  'et',
  'est',
  'sont',
  'dans',
  'pour',
  'avec',
  'sur',
  'par',
  'que',
  'qui',
  'pas',
  'plus',
  'tout',
  'cette',
  'ces',
]);
const ES_STOPS = new Set([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'en',
  'por',
  'para',
  'con',
  'que',
  'es',
  'son',
  'como',
  'pero',
  'mas',
  'este',
  'esta',
  'estos',
  'estas',
]);

export function detectLanguage(text: string): LanguageResult {
  if (!text)
    return {
      primary: 'unknown',
      mixedLanguage: false,
      confidence: 0,
      method: 'heuristic',
      detectedLanguages: [],
    };

  const chars = text.length;
  const arMatch = text.match(
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
  );
  const latMatch = text.match(/[\u0041-\u007A\u00C0-\u024F]/g);

  const arCount = arMatch ? arMatch.length : 0;
  const latCount = latMatch ? latMatch.length : 0;

  const arRatio = arCount / chars;
  const latRatio = latCount / chars;

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  let enStopCount = 0;
  let frStopCount = 0;
  let esStopCount = 0;

  words.forEach((w) => {
    if (EN_STOPS.has(w)) enStopCount++;
    if (FR_STOPS.has(w)) frStopCount++;
    if (ES_STOPS.has(w)) esStopCount++;
  });

  let primary = 'unknown';
  let mixedLanguage = false;
  let confidence = 0;

  if (arRatio > 0.15 && latRatio > 0.15) {
    mixedLanguage = true;
  }

  if (arRatio > 0.3) {
    primary = 'ar';
    confidence = arRatio;
  } else if (latRatio > 0.3) {
    if (enStopCount > frStopCount && enStopCount > esStopCount) {
      primary = 'en';
    } else if (frStopCount > enStopCount && frStopCount > esStopCount) {
      primary = 'fr';
    } else if (esStopCount > enStopCount && esStopCount > frStopCount) {
      primary = 'es';
    } else {
      primary = 'en';
    }
    confidence = latRatio;
  }

  return {
    primary,
    mixedLanguage,
    confidence: Math.min(1, confidence),
    method: 'heuristic',
    detectedLanguages: [primary],
  };
}
