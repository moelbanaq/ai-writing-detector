import { describe, expect, it } from 'vitest';
import {
  routeReasoning,
  executeReasoning,
  synthesizeForensicAndReasoning,
  MockReasoningProvider,
  SYSTEM_REASONING_PROMPT,
  REASONING_PROMPT_VERSION,
  type ReasoningRequest,
} from '@ai-detector/core';

describe('AI Reasoning Layer & Evidence Synthesis', () => {
  const dummyRequest: ReasoningRequest = {
    evidence: {
      reportId: 'rep-test-001',
      wordCount: 150,
      sentenceCount: 6,
      language: {
        primary: 'en',
        confidence: 0.99,
        method: 'cldr',
        detectedLanguages: ['en'],
        mixedLanguage: false,
      },
      statistics: {
        characters: 800,
        words: 150,
        sentences: 6,
        paragraphs: 2,
        averageSentenceLength: 25,
        sentenceLengthVariance: 10,
        sentenceLengthStdDev: 3.16,
        averageWordLength: 5.3,
        typeTokenRatio: 0.65,
        hapaxRatio: 0.5,
        punctuationRate: 0.04,
        repetitionRate: 0.08,
        readability: { available: true, score: 45, method: 'flesch' },
      },
      detectors: {
        'ai-patterns': { score: 0.88, reliability: 0.9, status: 'active' },
        'stylometric': { score: 0.84, reliability: 0.85, status: 'active' },
      },
      aiEvidenceSummary: [
        'High frequency of AI discourse markers (e.g. delves into, vital role)',
        'Low variance in sentence structures across paragraphs',
      ],
      humanEvidenceSummary: [],
      styleDiscontinuity: {
        detected: false,
        score: 0.12,
        locationsCount: 0,
      },
      uncertainty: {
        score: 0.18,
        level: 'low',
        factors: [],
        recommendation: 'accept',
      },
      sampleSentences: [
        { index: 1, text: 'In today’s rapidly evolving digital landscape, AI plays a crucial role.', aiLikelihood: 0.88 },
      ],
    },
    rawText: 'In today’s rapidly evolving digital landscape, AI plays a crucial role...',
    privacyLevel: 'metadata_only',
  };

  it('verifies system prompt metadata and injection boundaries', () => {
    expect(SYSTEM_REASONING_PROMPT).toContain(REASONING_PROMPT_VERSION);
    expect(SYSTEM_REASONING_PROMPT).toContain('AI Writing Forensic Evidence Analyst');
    expect(SYSTEM_REASONING_PROMPT).toContain('UNTRUSTED USER DATA');
  });

  it('routes ambiguous or borderline cases to reasoning engine', () => {
    const borderline = routeReasoning({
      forensicSignal: 0.52,
      detectorAgreement: 0.40,
      wordCount: 150,
      discontinuityDetected: false,
      discontinuityScore: 0.2,
      uncertaintyScore: 0.45,
      userRequested: false,
    });
    expect(borderline.shouldInvokeLLM).toBe(true);
    expect(borderline.reason).toBeDefined();
  });

  it('bypasses LLM for clear unambiguous samples when not requested', () => {
    const clearHuman = routeReasoning({
      forensicSignal: 0.10,
      detectorAgreement: 0.92,
      wordCount: 200,
      discontinuityDetected: false,
      discontinuityScore: 0.05,
      uncertaintyScore: 0.12,
      userRequested: false,
    });
    expect(clearHuman.shouldInvokeLLM).toBe(false);
  });

  it('executes MockReasoningProvider and returns strict schema-compliant response', async () => {
    const mock = new MockReasoningProvider();
    const response = await mock.analyzeEvidence(dummyRequest);

    expect(response.result.assessment).toBe('supports_ai');
    expect(response.result.reasoningConfidence).toBeGreaterThanOrEqual(0);
    expect(response.result.reasoningConfidence).toBeLessThanOrEqual(1);
    expect(response.result.recommendation).toBeDefined();
    expect(Array.isArray(response.result.supportingEvidence)).toBe(true);
    expect(Array.isArray(response.result.counterEvidence)).toBe(true);
    expect(Array.isArray(response.result.alternativeExplanations)).toBe(true);
  });

  it('synthesizes forensic signal and reasoning assessment into bounded final outcome', () => {
    const baseClassification = {
      label: 'ai_likely' as const,
      aiLikelihood: 0.82,
      humanLikelihood: 0.18,
      editedAILikelihood: null,
      basis: 'forensic_ensemble' as const,
      forensicSignal: 0.82,
      calibratedProbability: null,
      calibrationStatus: 'not_calibrated' as const,
      mixedAuthorship: {
        isMixed: false,
        aiFraction: 0.82,
        confidence: 0.8,
        discontinuityScore: 0.1,
        suspectedSegments: [],
      },
    };

    const synthesis = synthesizeForensicAndReasoning(
      baseClassification,
      {
        reasoningVersion: '1.0.0',
        assessment: 'supports_ai',
        strength: 0.85,
        reasoningConfidence: 0.8,
        supportingEvidence: ['Matched rhetorical signatures'],
        counterEvidence: [],
        alternativeExplanations: [],
        detectorConflicts: [],
        segmentFindings: [],
        adversarialFindings: [],
        recommendation: 'accept',
      }
    );

    expect(synthesis.label).toBe('ai_likely');
    expect(synthesis.aiLikelihood).toBeGreaterThanOrEqual(0.80);
    expect(synthesis.basis).toBe('ai_reasoning_synthesis');
  });

  it('reduces likelihood if reasoning counters forensic signal', () => {
    const baseClassification = {
      label: 'inconclusive' as const,
      aiLikelihood: 0.40,
      humanLikelihood: 0.60,
      editedAILikelihood: null,
      basis: 'forensic_ensemble' as const,
      forensicSignal: 0.40,
      calibratedProbability: null,
      calibrationStatus: 'not_calibrated' as const,
      mixedAuthorship: {
        isMixed: false,
        aiFraction: 0.40,
        confidence: 0.5,
        discontinuityScore: 0.1,
        suspectedSegments: [],
      },
    };

    const synthesis = synthesizeForensicAndReasoning(
      baseClassification,
      {
        reasoningVersion: '1.0.0',
        assessment: 'supports_human',
        strength: 0.9,
        reasoningConfidence: 0.85,
        supportingEvidence: [],
        counterEvidence: ['Idiosyncratic phrasing, non-standard spelling errors'],
        alternativeExplanations: ['ESL / Non-native English authoring template'],
        detectorConflicts: ['High lexical overlap but low AI rhetorical marker count'],
        segmentFindings: [],
        adversarialFindings: [],
        recommendation: 'review',
      }
    );

    expect(synthesis.label).toBe('human_likely');
    expect(synthesis.aiLikelihood).toBeLessThan(0.30);
  });
});
