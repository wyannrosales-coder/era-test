/**
 * EPIISOD Bedford's rooms (opening Semester 2, 2027): names, sizes, descriptions,
 * features, photos and floor plans from the live site (epiisod.com/en-au/melbourne/
 * epiisod-bedford, November 2026). The live photos are its small illustration renders;
 * there are no prices, key features, views or virtual tours yet.
 */
import { grouped, SHARED, STUDIO, type RoomDetails } from './roomDetails';
import type { Room } from './propertyContent';

/** Every room's photos and floor plan, by folder (one per room slug). */
const FILES = import.meta.glob<string>('../../assets/property/bedford/rooms/*/*.{jpg,png}', {
  eager: true,
  import: 'default',
});
const filesOf = (slug: string) =>
  Object.entries(FILES)
    .filter(([path]) => path.includes(`/rooms/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
const photosOf = (slug: string) => filesOf(slug).filter(([path]) => /photo-\d+\.jpg$/.test(path)).map(([, url]) => url);
const planOf = (slug: string) => filesOf(slug).find(([path]) => path.endsWith('/floor-plan.png'))?.[1] ?? '';

const room = (
  roomId: string,
  slug: string,
  d: { subtitle: string; size: string; description: string; features: string[] },
): RoomDetails => ({
  roomId,
  slug,
  subtitle: d.subtitle,
  size: d.size,
  description: d.description,
  keyFeatures: [],
  views: [],
  amenities: grouped(d.features),
  photos: photosOf(slug),
  floorPlan: planOf(slug),
  // No PDF on the live site: the download is the plan itself
  floorPlanPdf: planOf(slug),
  floorPlanNote: 'Furniture positions are indicative; some rooms mirror the plan depending on level and aspect.',
  virtualTour: '',
});

export const BEDFORD_ROOM_DETAILS: RoomDetails[] = [
  room('empowered-studio', 'empowered-studio', {
    subtitle: STUDIO,
    size: '23 sqm',
    description:
      "The Empowered Studio is thoughtfully designed to support independent living through an accessible layout that offers generous space, seamless functionality, and everyday comfort. With carefully considered interiors and room to move with ease, it creates a welcoming sanctuary where you can live confidently, comfortably, and entirely on your own terms. This room is Disability Discrimination Act (DDA) compliant.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "King Single", "Dishwasher"],
  }),
  room('quad', 'quad-4-bedroom-ensuite', {
    subtitle: SHARED,
    size: '76 sqm (Whole apartment)',
    description:
      "Designed for those who enjoy the energy of shared living without compromising on personal space, the Quad 4 Bedroom Ensuite offers a private bedroom and ensuite within a thoughtfully designed four-bedroom apartment. Complete with generous storage, a dedicated study area, and shared kitchen and living spaces, it creates the perfect balance between connection, comfort, and independence.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "King Single", "Dishwasher"],
  }),
  room('premier-quad', 'premier-quad-4-bedroom-ensuite', {
    subtitle: SHARED,
    size: '81 sqm (Whole apartment)',
    description:
      "Offering additional space within a shared apartment, the Premier Quad 4 Bedroom Ensuite elevates the shared living experience through a more generous layout and thoughtfully considered design. Enjoy the privacy of your own ensuite alongside inviting communal spaces, creating a home that supports both meaningful connections and focused study.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "King Single", "Dishwasher"],
  }),
  room('premier-aspect-studio', 'premier-aspect-studio', {
    subtitle: STUDIO,
    size: '18 sqm',
    description:
      "Offering enhanced space and an elevated sense of comfort, the Premier Aspect Studio is designed for those who appreciate a little more room to make their own. Thoughtfully planned with contemporary interiors and practical functionality, it provides a welcoming environment that supports both productivity and moments of quiet retreat.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "Double Bed"],
  }),
  room('premier-empowered-studio', 'premier-empowered-studio', {
    subtitle: STUDIO,
    size: '27 sqm',
    description:
      "Designed for those seeking even more space to live independently, the Premier Empowered Studio combines an accessible layout with generous proportions and thoughtfully curated interiors. Every element has been carefully considered to create a home that feels open, comfortable, and effortlessly adaptable to your everyday lifestyle. This room is Disability Discrimination Act (DDA) compliant.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "King Single", "Dishwasher"],
  }),
  room('signature-studio', 'signature-studio', {
    subtitle: STUDIO,
    size: '15 sqm',
    description:
      "The Signature Studio is the cornerstone of the EPIISOD collection — our most sought-after room type, offering well-planned private space with elegant simplicity. Featuring thoughtfully designed interiors, ample storage, and a spacious layout, this private sanctuary is created to support your lifestyle, wellbeing, and academic focus throughout every chapter of student life.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "Double Bed"],
  }),
  room('premier-signature-studio', 'premier-signature-studio', {
    subtitle: STUDIO,
    size: '17 sqm',
    description:
      "Building upon the much-loved Signature Studio, the Premier Signature Studio offers an even more generous layout with additional room to relax, study, and recharge. Blending considered design with practical functionality, it creates an elevated living experience where comfort and everyday convenience come together effortlessly.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "Double Bed"],
  }),
  room('executive-studio', 'executive-studio', {
    subtitle: STUDIO,
    size: '19 sqm',
    description:
      "The Executive Studio offers an elevated private living experience, where generous proportions meet thoughtfully curated interiors and exceptional everyday comfort. Designed for those seeking a refined home with space to study, unwind, and recharge, it is a sophisticated sanctuary that supports every chapter of student life.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "Double Bed"],
  }),
  room('aspect-studio', 'aspect-studio', {
    subtitle: STUDIO,
    size: '17 sqm',
    description:
      "The Aspect Studio brings together comfort and functionality in a thoughtfully designed private residence. With a well-balanced layout, contemporary interiors, and dedicated spaces to rest, study, and recharge, it offers everything you need to feel at home while embracing the independence of student living.",
    features: ["Air Con", "WiFi", "Storage", "Microwave", "Study Desk & Chair", "Fridge", "Cooktop", "Range hood", "Television", "Kettle", "Rice Cooker or Toaster", "Smart Door Access", "Double Bed"],
  }),
];

/** The rooms' cards, in the live site's order; no prices until bookings open. */
export const BEDFORD_ROOMS: Room[] = [
  { id: 'empowered-studio', type: 'Studio', typeLabel: 'Studio', name: "Empowered Studio", image: photosOf('empowered-studio')[0], available: true },
  { id: 'quad', type: 'Shared', typeLabel: 'Shared Apartment', name: "Quad 4 Bedroom Ensuite", image: photosOf('quad-4-bedroom-ensuite')[0], available: true },
  { id: 'premier-quad', type: 'Shared', typeLabel: 'Shared Apartment', name: "Premier Quad 4 Bedroom Ensuite", image: photosOf('premier-quad-4-bedroom-ensuite')[0], available: true },
  { id: 'premier-aspect-studio', type: 'Studio', typeLabel: 'Studio', name: "Premier Aspect Studio", image: photosOf('premier-aspect-studio')[0], available: true },
  { id: 'premier-empowered-studio', type: 'Studio', typeLabel: 'Studio', name: "Premier Empowered Studio", image: photosOf('premier-empowered-studio')[0], available: true },
  { id: 'signature-studio', type: 'Studio', typeLabel: 'Studio', name: "Signature Studio", image: photosOf('signature-studio')[0], available: true },
  { id: 'premier-signature-studio', type: 'Studio', typeLabel: 'Studio', name: "Premier Signature Studio", image: photosOf('premier-signature-studio')[0], available: true },
  { id: 'executive-studio', type: 'Studio', typeLabel: 'Studio', name: "Executive Studio", image: photosOf('executive-studio')[0], available: true },
  { id: 'aspect-studio', type: 'Studio', typeLabel: 'Studio', name: "Aspect Studio", image: photosOf('aspect-studio')[0], available: true },
];
