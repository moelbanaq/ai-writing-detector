import type { APIRoute } from 'astro';
import { analytics } from '../../../server/analytics.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { visitorId } = body || {};
    analytics.recordVisit(typeof visitorId === 'string' ? visitorId : undefined);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
