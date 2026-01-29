import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { setLastDeployedAt } from '../../lib/deploy';

export const prerender = false;

// Called by client when polling detects deployment completed
// Fallback for when Vercel webhook isn't configured
export const POST: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await setLastDeployedAt(new Date().toISOString());

  return new Response(JSON.stringify({ updated: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
