import type { ReasoningProvider } from './base.js';
import type { ReasoningRequest, ReasoningResponse } from '../types.js';
import { SYSTEM_REASONING_PROMPT, buildReasoningUserPrompt } from '../prompts.js';
import { sanitizeAndParseJson, validateAndFormatReasoningResult } from '../schema.js';

export interface OpenAIConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
}

export class OpenAIReasoningProvider implements ReasoningProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI Evidence Analyst';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;

  constructor(config: OpenAIConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = config.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.temperature = config.temperature ?? 0.1;
  }

  async analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    const startTime = Date.now();
    const userPrompt = buildReasoningUserPrompt(request);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 12000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: this.temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_REASONING_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response payload from OpenAI model.');
      }

      const latencyMs = Date.now() - startTime;
      const parsedJson = sanitizeAndParseJson(content);
      const validation = validateAndFormatReasoningResult(parsedJson, this.id, this.model, latencyMs);

      if (!validation.success) {
        throw new Error(validation.error);
      }

      return {
        result: validation.result,
        rawResponse: content,
        usage: {
          promptTokens: data?.usage?.prompt_tokens,
          completionTokens: data?.usage?.completion_tokens,
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
