/**
 * Cloudflare Pages Function: /.netlify/functions/proxy
 * Acts as a CORS proxy for external API calls that require server-side fetching.
 * Replaces the original Netlify function of the same name.
 */
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
    });
  }

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Allowlist of permitted domains for security
  const allowed = [
    'api.star-citizen.wiki',
    'scfocus.org',
    'robertsspaceindustries.com',
    'api.fleetyards.net',
    'starcitizen.tools',
    'fleetyards.net',
  ];

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const isAllowed = allowed.some(domain => parsedTarget.hostname === domain || parsedTarget.hostname.endsWith('.' + domain));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Domain not allowed: ' + parsedTarget.hostname }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'Accept': request.headers.get('Accept') || 'application/json',
        'User-Agent': 'SC-ShipForge/1.0',
      },
    });

    const body = await resp.arrayBuffer();
    const contentType = resp.headers.get('Content-Type') || 'application/json';

    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed: ' + err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
