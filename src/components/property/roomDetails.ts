/**
 * Room details pages (Figma 1195:26614): what each Macquarie Park room's page shows beyond
 * its card. Sizes, descriptions, features, photos and floor plans are from the live site
 * (epiisod.com, October 2026). The key features, view hints and floor-plan notes follow
 * the Figma's wording for the Quad and are drafts for the other rooms, to confirm.
 */
import viewUrban from '../../assets/property/room-details/shared/view-v1.jpg';
import viewGarden from '../../assets/property/room-details/shared/view-v2.jpg';
import viewPool from '../../assets/property/room-details/shared/view-v3.jpg';

/** Every room's photos and floor plan, by folder (one per room slug). */
const FILES = import.meta.glob<string>('../../assets/property/room-details/*/*.{jpg,png,pdf}', {
  eager: true,
  import: 'default',
});
const filesOf = (slug: string) =>
  Object.entries(FILES)
    .filter(([path]) => path.includes(`/room-details/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
const photosOf = (slug: string, order?: number[]) => {
  const photos = filesOf(slug)
    .filter(([path]) => /photo-\d+\.jpg$/.test(path))
    .map(([, url]) => url);
  if (!order) return photos;
  const first = order.map((n) => photos[n - 1]).filter(Boolean);
  return [...first, ...photos.filter((p) => !first.includes(p))];
};
const fileOf = (slug: string, name: string) => filesOf(slug).find(([path]) => path.endsWith(`/${name}`))?.[1] ?? '';

/** The Macquarie Park virtual tour (Matterport), for every room until each has its own. */
const MACQUARIE_PARK_TOUR = 'https://my.matterport.com/show/?m=qV8bSYhGsNd';

/** Where a room's windows face; each has a photo and a line for the booking form. */
export type RoomView = 'Urban' | 'Garden' | 'Pool' | 'City';
export const VIEWS: Record<RoomView, { title: string; hint: string; image: string }> = {
  Urban: { title: 'Lively urban outlooks over the Sydney hub', hint: 'Outward-facing, over the streets of Macquarie Park.', image: viewUrban },
  Garden: { title: 'Tranquil garden scenes with calming fountains', hint: 'Lower levels, facing the landscaped garden courtyard.', image: viewGarden },
  Pool: { title: 'Sweeping views over the central sky deck and pool', hint: 'Levels 10–13, inward-facing pool deck views.', image: viewPool },
  City: { title: 'Elevated outlooks towards the city skyline', hint: 'Upper levels, outward-facing towards the city.', image: viewUrban },
};

/** "What's included", in the Figma's groups (1195:29679); a room lists the ones it has. */
const AMENITY_GROUPS: { name: string; items: string[] }[] = [
  { name: 'Bedroom', items: ['Double Bed', 'King Single', 'Storage', 'Study Desk & Chair'] },
  { name: 'Kitchen & Dining', items: ['Microwave', 'Fridge', 'Cooktop', 'Range hood', 'Kettle', 'Rice Cooker or Toaster', 'Dishwasher'] },
  { name: 'Internet and Workspace', items: ['WiFi', 'Study Desk & Chair'] },
  { name: 'Entertainment', items: ['Television'] },
  { name: 'Heating and Cooling', items: ['Air Con'] },
  { name: 'Security', items: ['Smart Door Access'] },
];

export type RoomDetails = {
  /** The room's id in the property content (its card). */
  roomId: string;
  slug: string;
  subtitle: string;
  /** e.g. "18.0 sqm", or "11.8 sqm (Room) / 84.5 sqm (Whole apartment)". */
  size: string;
  description: string;
  keyFeatures: string[];
  views: RoomView[];
  amenities: { name: string; items: string[] }[];
  photos: string[];
  /** The plan shown on the page, and the PDF of it to download. */
  floorPlan: string;
  floorPlanPdf: string;
  floorPlanNote: string;
  virtualTour: string;
  /** Dual occupancy: a second student may share the room, for this much a week. */
  dualOccupancy?: number;
};

const SHARED = 'Private ensuite bedroom within a shared apartment';
const STUDIO = 'Private studio apartment with its own kitchenette and bathroom';
const STUDIO_FEATURES = ['Double Bed', 'Air Con', 'WiFi', 'Storage', 'Microwave', 'Study Desk & Chair', 'Fridge', 'Cooktop', 'Range hood', 'Television', 'Kettle', 'Rice Cooker or Toaster', 'Smart Door Access'];
const SHARED_FEATURES = ['King Single', 'Air Con', 'WiFi', 'Storage', 'Microwave', 'Study Desk & Chair', 'Fridge', 'Cooktop', 'Range hood', 'Television', 'Kettle', 'Rice Cooker or Toaster', 'Smart Door Access', 'Dishwasher'];

const grouped = (features: string[]) =>
  AMENITY_GROUPS.map((g) => ({ name: g.name, items: g.items.filter((i) => features.includes(i)) })).filter(
    (g) => g.items.length,
  );

const draft = (
  roomId: string,
  slug: string,
  d: Omit<
    RoomDetails,
    'roomId' | 'slug' | 'amenities' | 'photos' | 'floorPlan' | 'floorPlanPdf' | 'floorPlanNote' | 'virtualTour'
  > & {
    features: string[];
    photoOrder?: number[];
    layout: string;
    name: string;
  },
): RoomDetails => ({
  roomId,
  slug,
  subtitle: d.subtitle,
  size: d.size,
  description: d.description,
  keyFeatures: d.keyFeatures,
  views: d.views,
  dualOccupancy: d.dualOccupancy,
  amenities: grouped(d.features),
  photos: photosOf(slug, d.photoOrder),
  floorPlan: fileOf(slug, 'floor-plan.png'),
  floorPlanPdf: fileOf(slug, 'floor-plan.pdf'),
  virtualTour: MACQUARIE_PARK_TOUR,
  floorPlanNote: `${d.layout} Furniture positions are indicative; some rooms mirror the plan depending on level and aspect.`,
});

export const MACQUARIE_PARK_ROOM_DETAILS: RoomDetails[] = [
  draft('quad', 'quad-4-bedroom-ensuite', {
    name: 'Quad 4 Bedroom Ensuite',
    subtitle: SHARED,
    size: '11.8 sqm (Room) / 84.5 sqm (Whole apartment)',
    description:
      'The Quad is a shared apartment in Sydney Macquarie Park, featuring four individually secure ensuite bedrooms connected by a well-appointed shared kitchen and living area, thoughtfully designed for study, dining, and relaxation. This shared apartment redefines modern living, offering the perfect balance of privacy and camaraderie.',
    keyFeatures: ['Refined finishes and solid timber accents', 'Ample smart under-bed and overhead storage', 'Large floor-to-ceiling double glazed windows'],
    views: ['Urban', 'Garden', 'Pool'],
    features: SHARED_FEATURES,
    // The Figma's gallery (1195:28348): bedroom, entry, storage, bathroom, living room
    photoOrder: [1, 2, 3, 4, 6],
    layout: 'Layout shows the four ensuite bedrooms around the shared kitchen, dining and living areas.',
  }),
  draft('quint', 'quint-5-bedroom-ensuite', {
    name: 'Quint 5 Bedroom Ensuite',
    subtitle: SHARED,
    size: '11.8 sqm (Room) / 100.9 sqm (Whole apartment)',
    description:
      'The Quint is a shared apartment in Macquarie Park, Sydney offering five ensuite bedrooms arranged around a generous and elegantly designed space featuring a modern kitchen and living hall. Immerse yourself in a vibrant environment where you can forge lasting connections with like-minded mates, while still enjoying the privacy of your own room and bathroom. Perfect for residents who seek refined daily living without a dull moment.',
    keyFeatures: ['Five private ensuite bedrooms', 'Generous shared kitchen and living hall', 'Large floor-to-ceiling double glazed windows'],
    views: ['Urban', 'Garden', 'Pool'],
    features: SHARED_FEATURES,
    layout: 'Layout shows the five ensuite bedrooms around the shared kitchen, dining and living hall.',
  }),
  draft('signature', 'signature-studio', {
    name: 'Signature Studio',
    subtitle: STUDIO,
    size: '15.8 sqm',
    description:
      'The Signature Studio is the cornerstone of the EPIISOD collection — our most sought-after room type, offering well-planned private space with elegant simplicity. Featuring refined finishes, ample storage, and a large window, this studio flat in Macquarie Park Sydney is for those who value a space designed to support their lifestyle and academic focus.',
    keyFeatures: ['Refined finishes and solid timber accents', 'Ample smart under-bed and overhead storage', 'Large double glazed window'],
    views: ['Garden', 'Urban', 'Pool', 'City'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the sleeping zone, study station, kitchenette, storage and ensuite.',
  }),
  draft('signature-flex', 'signature-studio-flex', {
    name: 'Signature Studio Flex',
    subtitle: STUDIO,
    size: '15.5 sqm',
    description:
      'A variation of our classic Signature Studio, the Studio Flex is a one bedroom studio apartment in Macquarie Park Sydney, offering a more traditional square layout with a large window, tastefully furnished to meet your personal needs while leaving you the flexibility to style it. Ideal for residents who prefer openness and are ready to add personalised touches to make the space their own.',
    keyFeatures: ['A traditional square layout', 'Flexible space to style your own way', 'Large double glazed window'],
    views: ['Urban', 'Garden'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the sleeping zone, study station, kitchenette, storage and ensuite.',
  }),
  draft('aspect', 'aspect-studio', {
    name: 'Aspect Studio',
    subtitle: STUDIO,
    size: '18.0 sqm',
    description:
      'Exclusively located at the corners of each floor, the Aspect Studio offers exceptional natural light, cross-ventilation, and expanded space. Featuring refined finishes, ample storage, and a large window, this well-positioned studio apartment in Macquarie Park Sydney is desirable for those who value both privacy and elevation.',
    keyFeatures: ['Corner position with natural light on two sides', 'Cross-ventilation and expanded space', 'Ample smart under-bed and overhead storage'],
    views: ['Garden', 'Urban', 'Pool', 'City'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the corner sleeping zone, study station, kitchenette, storage and ensuite.',
  }),
  draft('aspect-e', 'aspect-studio-e', {
    name: 'Aspect Studio E',
    subtitle: STUDIO,
    size: '20.5 sqm',
    description:
      'The Aspect Studio E combines modern aesthetics with thoughtful, inclusive design, offering generous space for accessibility and comfort. This rare balance of space and intimacy is ideal for students who prefer a personal retreat to settle in comfortably and excel in their endeavours.',
    keyFeatures: ['Inclusive design with generous circulation space', 'Accessible ensuite', 'Large double glazed window'],
    views: ['Garden', 'Pool'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the sleeping zone, study station, kitchenette, storage and accessible ensuite.',
  }),
  draft('empowered', 'empowered-studio', {
    name: 'Empowered Studio',
    subtitle: STUDIO,
    size: '25.6 sqm',
    description:
      'The Empowered Studio is a university housing in Sydney, offering one of the widest floor plans with generous living space, enabled accessibility, and refined comfort to meet your every need. Framed by inward garden views, you can settle into a holistic balance of openness and quietude. An irresistible choice for those seeking an exclusive residence to live independently without limitation, while enjoying a sophisticated, inspirational outlook.',
    keyFeatures: ['One of our widest floor plans', 'Enabled accessibility throughout', 'Inward garden views'],
    views: ['Garden'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the wide living and sleeping zone, study station, kitchenette, storage and accessible ensuite.',
  }),
  draft('premier-empowered', 'premier-empowered-studio', {
    name: 'Premier Empowered Studio',
    subtitle: STUDIO,
    size: '31.1 sqm',
    description:
      'Reserved for the discerning few who value privacy, spaciousness, and understated comfort in every detail, the Premier Empowered Studio is a class of its own. Tastefully designed student rental in Sydney with exceptional finishes, bespoke furnishings, an expansive layout for movement and mobility needs, and a larger bathroom with accessibility aids, this exclusive residence is a statement of ambition and achievement.',
    keyFeatures: ['Our most expansive layout', 'Bespoke furnishings and exceptional finishes', 'A larger bathroom with accessibility aids'],
    views: ['Garden', 'Urban'],
    features: STUDIO_FEATURES,
    dualOccupancy: 60,
    layout: 'Layout shows the expansive living and sleeping zone, study station, kitchenette, storage and larger accessible bathroom.',
  }),
];
