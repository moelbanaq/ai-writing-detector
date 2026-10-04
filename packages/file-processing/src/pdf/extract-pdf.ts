import { PDFParse } from 'pdf-parse';
import type { ExtractedDocument } from '../txt/extract-txt.js';

/**
 * Extracts plain text from PDF (.pdf) documents.
 *
 * @param content - Buffer, Uint8Array, or base64-encoded string of the .pdf file
 * @returns ExtractedDocument containing extracted text, quality, and any warnings
 */
export async function extractPdf(content: Buffer | Uint8Array | string): Promise<ExtractedDocument> {
  try {
    let uint8Array: Uint8Array;
    if (typeof content === 'string') {
      const base64Data = content.includes(';base64,') ? content.split(';base64,')[1] || '' : content;
      const buf = Buffer.from(base64Data, 'base64');
      uint8Array = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
      uint8Array = content instanceof Uint8Array ? content : new Uint8Array(content);
    }

    const parser = new PDFParse({ data: uint8Array });
    const textResult = await parser.getText();
    const text = (textResult.text || '').trim();
    await parser.destroy();

    return {
      text,
      extractionQuality: text.length > 0 ? 0.95 : 0.0,
      warnings: [],
    };
  } catch (error: any) {
    return {
      text: '',
      extractionQuality: 0.0,
      warnings: [`Failed to extract PDF document: ${error?.message || 'Unknown error'}`],
    };
  }
}
