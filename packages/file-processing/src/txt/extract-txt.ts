export interface ExtractedDocument {
  text: string;
  extractionQuality: number;
  warnings: string[];
}

export function extractTxt(content: string | Buffer): ExtractedDocument {
  let text = typeof content === 'string' ? content : content.toString('utf-8');
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return {
    text,
    extractionQuality: 1.0,
    warnings: [],
  };
}
