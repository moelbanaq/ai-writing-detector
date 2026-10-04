import type { ReasoningProvider } from './base.js';
import type { ReasoningRequest, ReasoningResponse } from '../types.js';
import { SYSTEM_REASONING_PROMPT, buildReasoningUserPrompt } from '../prompts.js';
import { sanitizeAndParseJson, validateAndFormatReasoningResult } from '../schema.js';

export interface LocalConfig {
  baseUrl?: string;
  model?: string;
}

export class LocalReasoningProvider implements ReasoningProvider {
  readonly id = 'local';
  readonly name = 'Local LLM Evidence Analyst (Ollama / vLLM / LM Studio)';
  private baseUrl: string;
  private model: string;

  constructor(config: LocalConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1';
    this.model = config.model || process.env.LOCAL_LLM_MODEL || 'mistral';
  }

  async analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse> {
    const startTime = Date.now();
    const userPrompt = buildReasoningUserPrompt(request);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 15000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          messages: [
            { role: 'system', content: SYSTEM_REASONING_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Local LLM HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response payload from local LLM.');
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
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
