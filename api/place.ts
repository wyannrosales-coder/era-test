/**
 * A place's own photo from Google (Places API, New), for the location map's place cards.
 *
 *   GET /api/place?name=…&lat=…&lng=…   → { photo?: "/api/place-photo?ref=…", credit?: string, mapsUri?: string }
 *   GET /api/place-photo?ref=…          → the photo itself (see place-photo.ts)
 *
 * Setup: create a Google Maps Platform API key with "Places API (New)" enabled (billing must be on
 * for the project) and set it as GOOGLE_MAPS_API_KEY in the Vercel project's environment variables
 * (and in .env.local to try it locally). The key stays on the server: the browser only ever sees
 * /api/place-photo URLs. Without a key this answers {} and the map shows its category icons.
 *
 * Cost control: a place is looked up only when someone opens its card, answers are kept in memory
 * for a day, and each visitor is limited (see CAP below). Set a daily quota on the key in Google Cloud
 * as the hard cap. Google's terms: show the attribution that comes with a photo, and don't store
 * photos; only place IDs may be kept long-term, which is why this keeps nothing on disk.
 */
export const maxDuration = 15;

type Found = { photo?: string; credit?: string; mapsUri?: string };

const CACHE_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: Found }>();

// Per visitor: a brake on a scraper, not a hard cap (each server instance counts for itself)
const CAP = { perVisitor: 60, windowMs: 10 * 60 * 1000 };
const visits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (visits.get(ip) ?? []).filter((t) => now - t < CAP.windowMs);
  recent.push(now);
  visits.set(ip, recent);
  if (visits.size > 5000) visits.clear();
  return recent.length > CAP.perVisitor;
}

const json = (status: number, body: unknown, cacheControl = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });

export async function GET(request: Request) {
  const { env } = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process;
  const key = (env.GOOGLE_MAPS_API_KEY ?? '').trim().replace(/^["']+|["']+$/g, '');
  if (!key) return json(200, {});

  const url = new URL(request.url);
  const name = (url.searchParams.get('name') ?? '').slice(0, 160).trim();
  const address = (url.searchParams.get('address') ?? '').slice(0, 200).trim();
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return json(400, {});

  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  if (limited(ip)) return json(429, {});

  const id = `${name}|${lat.toFixed(5)}|${lng.toFixed(5)}`;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return json(200, hit.value, 'private, max-age=3600');

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.googleMapsUri,places.photos.name,places.photos.authorAttributions',
      },
      body: JSON.stringify({
        textQuery: address ? `${name}, ${address}` : name,
        maxResultCount: 1,
        // The place is where the map says it is: only look close by
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 250 } },
      }),
    });
    if (!res.ok) {
      console.error('place: Google error', res.status, (await res.text().catch(() => '')).slice(0, 300));
      return json(200, {});
    }
    const data = (await res.json()) as {
      places?: { googleMapsUri?: string; photos?: { name: string; authorAttributions?: { displayName?: string }[] }[] }[];
    };
    const place = data.places?.[0];
    const photo = place?.photos?.[0];
    const value: Found = {
      ...(photo ? { photo: `/api/place-photo?ref=${encodeURIComponent(photo.name)}`, credit: photo.authorAttributions?.[0]?.displayName } : {}),
      ...(place?.googleMapsUri ? { mapsUri: place.googleMapsUri } : {}),
    };
    cache.set(id, { at: Date.now(), value });
    if (cache.size > 2000) cache.clear();
    return json(200, value, 'private, max-age=3600');
  } catch (error) {
    console.error('place: lookup failed', error);
    return json(200, {});
  }
}
