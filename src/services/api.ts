export interface AnalysisResponse {
  success: boolean;
  report?: any;
  error?: { code: string; message: string };
}

export async function analyzeText(text: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      try {
        const errJson = await response.json();
        return errJson;
      } catch {
        return {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: `Server returned status ${response.status}. Ensure backend API is running on port 3001.`,
          },
        };
      }
    }
    return await response.json();
  } catch (error: any) {
    const msg = error?.message?.includes('JSON')
      ? 'Cannot reach backend server. Please ensure the API is running on port 3001.'
      : (error?.message ?? 'Network request failed');
    return { success: false, error: { code: 'NETWORK_ERROR', message: msg } };
  }
}

export async function analyzeFile(
  content: string,
  filename: string,
  mimeType: string,
): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, filename, mimeType }),
    });
    if (!response.ok) {
      try {
        const errJson = await response.json();
        return errJson;
      } catch {
        return {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: `Server returned status ${response.status}. Ensure backend API is running on port 3001.`,
          },
        };
      }
    }
    return await response.json();
  } catch (error: any) {
    const msg = error?.message?.includes('JSON')
      ? 'Cannot reach backend server. Please ensure the API is running on port 3001.'
      : (error?.message ?? 'Network request failed');
    return { success: false, error: { code: 'NETWORK_ERROR', message: msg } };
  }
}

export async function getRephraseSuggestions(text: string, tells: any[] = []): Promise<any> {
  try {
    const response = await fetch('/api/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tells }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyWithWeb(query: string): Promise<any> {
  try {
    const response = await fetch('/api/verify/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordVisit(visitorId?: string): Promise<void> {
  try {
    await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    });
  } catch {
    // Non-blocking background analytics call
  }
}

export async function getAnalyticsStats(pin?: string): Promise<any> {
  try {
    const url = pin ? `/api/analytics/stats?pin=${encodeURIComponent(pin)}` : '/api/analytics/stats';
    const response = await fetch(url);
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch analytics' };
  }
}

export async function resetAnalyticsStats(pin?: string): Promise<any> {
  try {
    const response = await fetch('/api/analytics/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reset analytics' };
  }
}

