import type { ReasoningProvider } from './base.js';
import type { ReasoningRequest, ReasoningResponse } from '../types.js';
import { SYSTEM_REASONING_PROMPT, buildReasoningUserPrompt } from '../prompts.js';
import { sanitizeAndParseJson, validateAndFormatReasoningResult } from '../schema.js';

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export class GeminiReasoningProvider implements ReasoningProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini Evidence Analyst';
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(config: GeminiConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.temperature = config.temperature ?? 0.1;
  }

  async analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const startTime = Date.now();
    const userPrompt = buildReasoningUserPrompt(request);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      systemInstruction: {
        parts: [{ text: SYSTEM_REASONING_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: this.temperature,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 12000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response payload from Gemini model.');
      }

      const latencyMs = Date.now() - startTime;
      const parsedJson = sanitizeAndParseJson(text);
      const validation = validateAndFormatReasoningResult(parsedJson, this.id, this.model, latencyMs);

      if (!validation.success) {
        throw new Error(validation.error);
      }

      return {
        result: validation.result,
        rawResponse: text,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
