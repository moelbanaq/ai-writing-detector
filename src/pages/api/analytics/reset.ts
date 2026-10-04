import type { APIRoute } from 'astro';
import { analytics } from '../../../server/analytics.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const configuredPin = (process.env.ADMIN_PIN || '').trim();
    const body = await request.json().catch(() => ({}));
    const providedPin = body?.pin || request.headers.get('x-admin-pin') || '';

    if (configuredPin && configuredPin.length > 0 && providedPin !== configuredPin) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_PIN' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    analytics.resetStats();
    return new Response(
      JSON.stringify({ success: true, message: 'Analytics reset successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
