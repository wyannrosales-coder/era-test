/**
 * A place's own photo from Google, through /api/place (see api/place.ts). Looked up once per
 * place per visit, and only when someone opens it. With no Google key set up on the server the
 * answer is empty and callers keep showing the category icon.
 */
export type PlaceExtra = { photo?: string; credit?: string; mapsUri?: string };

const found = new Map<string, Promise<PlaceExtra>>();

export function fetchPlaceExtra(place: { name: string; address: string; lat: number; lng: number }): Promise<PlaceExtra> {
  const id = `${place.name}|${place.lat}|${place.lng}`;
  let request = found.get(id);
  if (!request) {
    const query = new URLSearchParams({ name: place.name, address: place.address, lat: String(place.lat), lng: String(place.lng) });
    request = fetch(`/api/place?${query}`)
      .then((r) => (r.ok ? (r.json() as Promise<PlaceExtra>) : {}))
      .catch(() => ({}));
    found.set(id, request);
  }
  return request;
}
