import type { EvidenceItem } from '@ai-detector/shared';

export function buildEvidence(allEvidence: EvidenceItem[], wordCount: number): EvidenceItem[] {
  const sorted = [...allEvidence].sort((a, b) => b.reliability - a.reliability);

  const minEvidence = wordCount >= 500 ? 5 : wordCount >= 250 ? 3 : 1;
  return sorted.slice(0, Math.max(minEvidence, sorted.length));
}
