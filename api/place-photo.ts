/**
 * The bytes of a Google Places photo, fetched with the server-side key so the key never reaches the
 * browser: GET /api/place-photo?ref=places/<id>/photos/<ref>. See place.ts.
 */
export const maxDuration = 15;

const REF = /^places\/[\w-]+\/photos\/[\w-]+$/;

export async function GET(request: Request) {
  const { env } = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process;
  const key = (env.GOOGLE_MAPS_API_KEY ?? '').trim().replace(/^["']+|["']+$/g, '');
  const ref = new URL(request.url).searchParams.get('ref') ?? '';
  if (!key || !REF.test(ref)) return new Response(null, { status: 404 });

  try {
    const res = await fetch(`https://places.googleapis.com/v1/${ref}/media?maxWidthPx=640`, {
      headers: { 'X-Goog-Api-Key': key },
      redirect: 'follow',
    });
    if (!res.ok || !res.body) return new Response(null, { status: 404 });
    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
        // Short, per visitor: Google's terms don't allow keeping photos
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('place-photo: fetch failed', error);
    return new Response(null, { status: 502 });
  }
}
