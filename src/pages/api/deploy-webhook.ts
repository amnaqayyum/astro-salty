import type { APIRoute } from 'astro';
import { setLastDeployedAt } from '../../lib/deploy';

export const prerender = false;

// Vercel sends deployment webhooks here
// Configure in Vercel: Project Settings → Git → Deploy Hooks → Webhooks
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Vercel webhook payload includes deployment info
    // type: "deployment.succeeded" | "deployment.failed" | etc.
    // payload.deployment.state: "READY" | "ERROR" | etc.

    const type = body.type;
    const state = body.payload?.deployment?.state;

    // Only update timestamp when deployment succeeds
    if (type === 'deployment.succeeded' || state === 'READY') {
      await setLastDeployedAt(new Date().toISOString());
      return new Response(JSON.stringify({ updated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ updated: false, type, state }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
