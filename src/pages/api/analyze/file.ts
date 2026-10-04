import type { APIRoute } from 'astro';
import { analyzeTextAsync } from '@ai-detector/core';
import { extractTxt, extractDocx, extractPdf } from '@ai-detector/file-processing';
import { analytics } from '../../../server/analytics.js';

function recordAnalyticsFromReport(report: any, durationMs: number) {
  try {
    const allTells: any[] = [];
    if (Array.isArray(report.segments?.sentences)) {
      for (const sent of report.segments.sentences) {
        if (Array.isArray(sent.analysis?.tells)) {
          allTells.push(...sent.analysis.tells);
        }
      }
    }

    analytics.recordAnalysis({
      wordCount: report.statistics?.words || 0,
      characterCount: report.statistics?.characters || 0,
      language: report.language?.primary || 'unknown',
      label: report.classification?.label || 'inconclusive',
      aiLikelihood: report.classification?.aiLikelihood ?? 0,
      confidence: report.confidence?.score ?? 0,
      processingTimeMs: durationMs,
      tells: allTells,
    });
  } catch (err) {
    console.warn('[Analytics] Failed to record analysis event:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { content, filename = '', mimeType = '' } = body || {};

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid file content.' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lowerName = filename.toLowerCase();
    const lowerMime = mimeType.toLowerCase();
    let extracted: { text: string; extractionQuality: number; warnings: string[] };

    if (lowerName.endsWith('.pdf') || lowerMime.includes('pdf')) {
      extracted = await extractPdf(content);
    } else if (
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc') ||
      lowerMime.includes('word') ||
      lowerMime.includes('officedocument')
    ) {
      extracted = await extractDocx(content);
    } else if (lowerName.endsWith('.txt') || lowerMime.includes('text') || lowerMime === '') {
      extracted = extractTxt(content);
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: 'Unsupported format. Supported document formats are: .docx, .pdf, .txt',
          },
        }),
        { status: 415, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const text = extracted.text;
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'EMPTY_EXTRACTION',
            message:
              extracted.warnings.length > 0
                ? extracted.warnings.join('; ')
                : 'Could not extract readable text from document. Ensure file is not password-protected or image-only scanned.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const report = await analyzeTextAsync({ text });
    const durationMs = Date.now() - startTime;
    recordAnalyticsFromReport(report, durationMs);

    return new Response(
      JSON.stringify({
        success: true,
        report,
        extractedText: text,
        filename,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'ANALYSIS_ERROR', message: error?.message || 'Failed to analyze file.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
