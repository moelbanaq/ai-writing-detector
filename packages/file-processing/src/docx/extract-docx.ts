import mammoth from 'mammoth';
import type { ExtractedDocument } from '../txt/extract-txt.js';

/**
 * Extracts plain text from Microsoft Word (.docx) documents.
 *
 * @param content - Buffer, Uint8Array, or base64-encoded string of the .docx file
 * @returns ExtractedDocument containing extracted text, quality, and any warnings
 */
export async function extractDocx(content: Buffer | Uint8Array | string): Promise<ExtractedDocument> {
  try {
    let buffer: Buffer;
    if (typeof content === 'string') {
      const base64Data = content.includes(';base64,') ? content.split(';base64,')[1] || '' : content;
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    const warnings = result.messages.map((m) => m.message);

    return {
      text,
      extractionQuality: text.length > 0 ? 1.0 : 0.0,
      warnings,
    };
  } catch (error: any) {
    return {
      text: '',
      extractionQuality: 0.0,
      warnings: [`Failed to extract Word document: ${error?.message || 'Unknown error'}`],
    };
  }
}
