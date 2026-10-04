import type { APIRoute } from 'astro';
import { analyzeTextAsync } from '@ai-detector/core';
import { analytics } from '../../server/analytics.js';

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
    const { text, options } = body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Input text is required.' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const report = await analyzeTextAsync({ text, options });
    const durationMs = Date.now() - startTime;
    recordAnalyticsFromReport(report, durationMs);

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'ANALYSIS_ERROR', message: err?.message || 'Failed to analyze text.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
