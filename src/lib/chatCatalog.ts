/**
 * The rooms the assistant can show and book, by id ("macquarie-park/signature"): this site's
 * own property content for the properties that have their own pages. The assistant is given
 * the same list as text (knowledge/rooms.md, written out by `catalogMarkdown()` below — see
 * the note at the top of that file), so the ids it uses match the ones looked up here.
 */
import { PROPERTIES } from '../components/locationData';
import { MACQUARIE_PARK, type PropertyContent, type Room, type Stay } from '../components/property/propertyContent';
import { BEDFORD } from '../components/property/bedfordContent';
import type { RoomDetails } from '../components/property/roomDetails';

const CONTENT: Record<string, PropertyContent> = { 'macquarie-park': MACQUARIE_PARK, bedford: BEDFORD };

export type CatalogRoom = {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyHref: string;
  content: PropertyContent;
  room: Room;
  details?: RoomDetails;
  href: string;
  image: string;
  /** The terms this room is offered for (none while the property has no pricing). */
  stays: Stay[];
};

export const CATALOG: CatalogRoom[] = Object.entries(CONTENT).flatMap(([propertyId, content]) => {
  const property = PROPERTIES.find((p) => p.id === propertyId);
  const propertyHref = property?.href ?? `/locations/${propertyId}`;
  return content.rooms.map((room) => {
    const details = content.roomDetails.find((d) => d.roomId === room.id);
    return {
      id: `${propertyId}/${room.id}`,
      propertyId,
      propertyName: `${content.brand} ${content.place}`,
      propertyHref,
      content,
      room,
      details,
      href: details ? `${propertyHref}/${details.slug}` : propertyHref,
      image: details?.photos[0] ?? room.image,
      stays: content.opening ? [] : content.stays.filter((s) => s.prices[room.id] !== undefined),
    };
  });
});

export const findRoom = (id: string) => CATALOG.find((r) => r.id === id.trim().toLowerCase());
export const weeksOf = (stay: Stay) => Number(stay.label.match(/\d+/)?.[0] ?? 52);

/** The catalogue as the assistant reads it (knowledge/rooms.md). */
export function catalogMarkdown() {
  const out: string[] = [
    '# Booking catalogue (this website)',
    '',
    'The rooms this website can show and book, with the ids to use in tools. Weekly prices are per person, per week, in the currency shown, before promotions.',
  ];
  for (const [propertyId, content] of Object.entries(CONTENT)) {
    const rooms = CATALOG.filter((r) => r.propertyId === propertyId);
    out.push('', `## ${content.brand} ${content.place} (${content.city})`, `Property id: ${propertyId}. Page: ${rooms[0]?.propertyHref}. Address: ${content.address}.`);
    if (content.opening) {
      out.push(
        `NOT OPEN FOR BOOKING YET: ${content.opening}. No prices or terms have been released. These rooms can be shown with show_rooms but not booked; offer to register the customer's interest with submit_enquiry.`,
      );
    } else {
      out.push('', '### Lengths of stay (terms)');
      for (const s of content.stays) {
        out.push(`- stay_id ${s.id}: ${s.group}, ${s.label}. Check-in between ${s.checkIn.from} and ${s.checkIn.to}.`);
      }
    }
    out.push('', '### Rooms');
    for (const r of rooms) {
      const d = r.details;
      const lines = [
        `- id ${r.id}: **${r.room.name}** (${r.room.typeLabel})${r.room.available ? '' : ' — SOLD OUT, cannot be booked'}. Page: ${r.href}.`,
      ];
      if (d) lines.push(`  ${d.subtitle}. Size: ${d.size}.${d.views.length ? ` Views: ${d.views.join(', ')}.` : ''}${d.dualOccupancy ? ` Dual occupancy: a second person may share for ${content.roomCurrency}${d.dualOccupancy} more per week.` : ''}`);
      if (r.stays.length) {
        lines.push(`  Weekly price by term: ${r.stays.map((s) => `${s.id} (${s.group}, ${s.label}) ${content.roomCurrency}${s.prices[r.room.id]}`).join('; ')}.`);
      }
      out.push(...lines);
    }
  }
  return out.join('\n') + '\n';
}
