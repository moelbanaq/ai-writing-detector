import { Router, Request, Response } from 'express';
import { analyzeText, analyzeTextAsync } from '@ai-detector/core';
import { extractTxt, extractDocx, extractPdf } from '@ai-detector/file-processing';
import { validateAnalysisInput } from '../middleware/validation.js';
import { analytics } from '../services/analytics.js';

export const analyzeRoute = Router();

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

analyzeRoute.post('/analyze', validateAnalysisInput, async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { text, options } = req.body;
    const report = await analyzeTextAsync({ text, options });
    const durationMs = Date.now() - startTime;

    recordAnalyticsFromReport(report, durationMs);

    res.json({ success: true, report });
  } catch {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze text.',
      },
    });
  }
});

analyzeRoute.post('/analyze/file', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { content, filename = '', mimeType = '' } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing or invalid file content.',
        },
      });
      return;
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
      res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_FORMAT',
          message: 'Unsupported format. Supported document formats are: .docx, .pdf, .txt',
        },
      });
      return;
    }

    const text = extracted.text;
    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_EXTRACTION',
          message:
            extracted.warnings.length > 0
              ? extracted.warnings.join('; ')
              : 'Could not extract readable text from document. Ensure file is not password-protected or image-only scanned.',
        },
      });
      return;
    }

    const report = await analyzeTextAsync({ text });
    const durationMs = Date.now() - startTime;

    recordAnalyticsFromReport(report, durationMs);

    res.json({
      success: true,
      report,
      extractedText: text,
      filename,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error?.message || 'Failed to analyze file.',
      },
    });
  }
});
