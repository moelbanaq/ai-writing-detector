export interface NormalizedText {
  original: string;
  normalized: string;
  normalizationsApplied: string[];
}

export function normalizeText(text: string): NormalizedText {
  const normalizationsApplied: string[] = [];
  let current = text;

  // 1. Normalize line endings (\r\n -> \n, \r -> \n)
  if (/\r\n|\r/.test(current)) {
    current = current.replace(/\r\n|\r/g, '\n');
    normalizationsApplied.push('line_endings');
  }

  // 2. Normalize repeated whitespace within lines
  if (/[^\S\r\n]{2,}/.test(current)) {
    current = current.replace(/[^\S\r\n]{2,}/g, ' ');
    normalizationsApplied.push('repeated_whitespace');
  }

  // 3. Unicode NFC normalization
  const nfc = current.normalize('NFC');
  if (nfc !== current) {
    current = nfc;
    normalizationsApplied.push('unicode_nfc');
  }

  return {
    original: text,
    normalized: current,
    normalizationsApplied,
  };
}
