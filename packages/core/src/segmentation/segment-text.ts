import type { TextRegion } from '@ai-detector/shared';
import { simpleHash } from '@ai-detector/shared';

export interface SegmentationResult {
  paragraphs: TextRegion[];
  sentences: TextRegion[];
  codeRegions: TextRegion[];
  referenceRegions: TextRegion[];
  urlRegions: TextRegion[];
}

export function segmentText(text: string): SegmentationResult {
  const paragraphs: TextRegion[] = [];
  const sentences: TextRegion[] = [];
  const codeRegions: TextRegion[] = [];
  const referenceRegions: TextRegion[] = [];
  const urlRegions: TextRegion[] = [];

  if (!text) {
    return { paragraphs, sentences, codeRegions, referenceRegions, urlRegions };
  }

  text = text.replace(/\r\n/g, '\n');

  // 1. Paragraphs
  const paraRegex = /([^\n]+(?:\n[^\n]+)*)/g;
  let match;
  while ((match = paraRegex.exec(text)) !== null) {
    if (match[0].trim()) {
      paragraphs.push({
        id: simpleHash(match[0]),
        text: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        type: 'paragraph',
        textHash: simpleHash(match[0]),
      });
    }
  }

  // 2. Sentences
  const sentRegex = /[^.!?\u060C\u061B\u061F\u06D4]+[.!?\u060C\u061B\u061F\u06D4]*(?:\s+|$)/g;
  let sMatch;
  while ((sMatch = sentRegex.exec(text)) !== null) {
    const sText = sMatch[0].trim();
    if (sText) {
      sentences.push({
        id: simpleHash(sText),
        text: sText,
        startOffset: sMatch.index,
        endOffset: sMatch.index + sMatch[0].length,
        type: 'sentence',
        textHash: simpleHash(sText),
      });
    }
  }

  // 3. URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  while ((match = urlRegex.exec(text)) !== null) {
    urlRegions.push({
      id: simpleHash(match[0]),
      text: match[0],
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      type: 'url',
      textHash: simpleHash(match[0]),
    });
  }

  // 4. References: (Author, Year) or [1]
  const refRegex = /\([A-Z][a-z]+(?:,\s*\d{4})\)|\[\d+\]/g;
  while ((match = refRegex.exec(text)) !== null) {
    referenceRegions.push({
      id: simpleHash(match[0]),
      text: match[0],
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      type: 'reference',
      textHash: simpleHash(match[0]),
    });
  }

  // 5. Code
  const codeRegex = /^(?:def|function|if|for|while|return|import|class|const|let|var)\s+.+/gm;
  while ((match = codeRegex.exec(text)) !== null) {
    codeRegions.push({
      id: simpleHash(match[0]),
      text: match[0],
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      type: 'code',
      textHash: simpleHash(match[0]),
    });
  }

  return { paragraphs, sentences, codeRegions, referenceRegions, urlRegions };
}
