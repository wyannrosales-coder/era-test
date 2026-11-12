/**
 * The 3D amenities section (Amenities3D.tsx): the amenities grouped under headings, each
 * tied to a part of the building model (public/models/macquarie-park-building.glb) and
 * a camera view of it. TODO: every description is a placeholder, as in the photo amenities.
 */
export type ModelView = {
  /** Where the camera looks, in model units (the building is 56 × 36 × 39). */
  target: [number, number, number];
  /** Degrees round the building (0 = from the south), and above the horizon. */
  azimuth: number;
  elevation: number;
  /** Distance, as a share of the one that fits the whole building. */
  distance: number;
};

export type Amenity3D = {
  title: string;
  text: string;
  /** Parts of the model it lights up: any node whose name contains one of these ('' = all). */
  parts: string[];
  view: ModelView;
};

export type AmenityGroup = { name: string; items: Amenity3D[] };

const WHOLE: ModelView = { target: [0, 17, 0], azimuth: 32, elevation: 24, distance: 1 };

export const MACQUARIE_AMENITY_GROUPS: AmenityGroup[] = [
  {
    name: 'Arrive',
    items: [
      {
        title: 'Prime Location',
        text: 'Minutes from Macquarie University, the Metro and Macquarie Centre.',
        parts: [''],
        view: WHOLE,
      },
      {
        title: 'Reception 24/7',
        text: 'A friendly team on hand day and night, whenever you need us.',
        parts: ['Glazed connecting wing', 'Forecourt'],
        view: { target: [0, 8, 4], azimuth: 12, elevation: 14, distance: 0.62 },
      },
      {
        title: 'Secure Building',
        text: 'Keyless entry and 24/7 security, so you can feel at home.',
        parts: ['South wing', 'North wing'],
        view: { target: [0, 16, 0], azimuth: -38, elevation: 20, distance: 0.82 },
      },
    ],
  },
  {
    name: 'Unwind',
    items: [
      {
        title: 'Pool Terrace',
        text: 'A timber deck and checkerboard pool, high above the city.',
        parts: ['Pool terrace / timber deck'],
        view: { target: [-2, 24, 0], azimuth: 24, elevation: 36, distance: 0.46 },
      },
      {
        title: 'Sun Lounges & Pergolas',
        text: 'Shaded corners and loungers for long afternoons outside.',
        parts: ['Pool terrace / sun lounges'],
        view: { target: [0, 25, 2], azimuth: -28, elevation: 30, distance: 0.42 },
      },
      {
        title: 'Courtyard Gardens',
        text: 'Planted courtyards on both sides of the building to slow down in.',
        parts: ['courtyard gardens'],
        view: { target: [0, 2, 0], azimuth: 8, elevation: 42, distance: 0.7 },
      },
      {
        title: 'Rooftop Pavilions',
        text: 'Two rooftop pavilions with open views across Macquarie Park.',
        parts: ['rooftop pavilion'],
        view: { target: [0, 31, 0], azimuth: 20, elevation: 24, distance: 0.95 },
      },
    ],
  },
  {
    name: 'Connect',
    items: [
      {
        title: 'Onsite Cafe',
        text: 'Coffee and a bite downstairs, made just for residents.',
        parts: ['Glazed connecting wing'],
        view: { target: [0, 8, 0], azimuth: -16, elevation: 12, distance: 0.58 },
      },
      {
        title: 'Big Social Calendar',
        text: 'Dinners, events and trips that make it easy to meet people.',
        parts: ['courtyard gardens', 'Pool terrace'],
        view: { target: [0, 12, 0], azimuth: 48, elevation: 30, distance: 0.84 },
      },
      {
        title: 'Unlimited WiFi',
        text: 'Fast, reliable internet in every room and shared space.',
        parts: ['North wing', 'South wing'],
        view: { target: [0, 17, 0], azimuth: 60, elevation: 16, distance: 0.9 },
      },
    ],
  },
  {
    name: 'Built to last',
    items: [
      {
        title: 'Solar Roof',
        text: 'Photovoltaic roof panels help power the building.',
        parts: ['Photovoltaic glass', 'roof / plant'],
        view: { target: [-4, 34, 0], azimuth: 30, elevation: 52, distance: 0.62 },
      },
    ],
  },
];
