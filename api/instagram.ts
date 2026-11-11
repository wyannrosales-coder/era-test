/**
 * Latest Instagram posts for the "Life is good @EPIISOD" strip (Vercel serverless function,
 * served at /api/instagram).
 *
 * Uses the Instagram API with Instagram Login, which needs EPIISOD's account to be a
 * Business or Creator account. Set INSTAGRAM_ACCESS_TOKEN in the Vercel project's
 * environment variables to a long-lived token for that account. The token is only read
 * here, on the server, and never reaches the browser.
 *
 * Long-lived tokens last 60 days. Refresh one before then (any time after it's a day old):
 *   GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TOKEN
 * and paste the new token into the environment variable.
 *
 * Without a token this answers 503, and the site keeps showing its sample posts.
 */
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
const LIMIT = 12;

export async function GET() {
  // Read through globalThis so this compiles with or without Node's type definitions
  const { env } = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process;
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return Response.json({ error: 'Instagram feed not configured' }, { status: 503 });
  }

  const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=${LIMIT}&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return Response.json({ error: 'Instagram request failed' }, { status: 502 });
  }

  const { data } = (await res.json()) as { data?: unknown[] };
  return Response.json(
    { data: data ?? [] },
    {
      // Cached at Vercel's edge for an hour, then refreshed in the background, so
      // visitors never wait on Instagram and the account stays well under its rate limit
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
