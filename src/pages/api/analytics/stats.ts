import type { APIRoute } from 'astro';
import { analytics } from '../../../server/analytics.js';

export const GET: APIRoute = async ({ request, url }) => {
  const configuredPin = (process.env.ADMIN_PIN || '').trim();
  const providedPin = url.searchParams.get('pin') || request.headers.get('x-admin-pin') || '';

  if (configuredPin && configuredPin.length > 0) {
    if (providedPin !== configuredPin) {
      return new Response(
        JSON.stringify({
          success: false,
          isPinProtected: true,
          error: 'PIN_REQUIRED',
          message: 'This dashboard is protected by an Admin PIN.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const stats = analytics.getStats();
  return new Response(
    JSON.stringify({
      success: true,
      isPinProtected: Boolean(configuredPin),
      stats,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
