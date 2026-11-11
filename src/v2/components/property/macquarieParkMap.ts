/**
 * Places around EPIISOD Macquarie Park, by category — copied from the live site's
 * location map (epiisod.com/en-au, Sydney › EPIISOD Macquarie Park). The schools' photos
 * are from the design (Figma 1182:8433).
 */
import type { MapCategory } from './propertyContent';
import standAboutLocationBg from '../../../assets/about/location-bg.jpg';
import standAboutPlaceMacquarieUniversity from '../../../assets/about/place-macquarie-university.jpg';
import standAboutWideMacquarie from '../../../assets/about/wide-macquarie.jpg';
import standBlogArrivalSteps from '../../../assets/blog/arrival-steps.jpg';
import standBlogCampusShadows from '../../../assets/blog/campus-shadows.jpg';
import standBlogStudyCoffee from '../../../assets/blog/study-coffee.jpg';
import standExperienceCardPrivileges from '../../../assets/experience/card-privileges.jpg';
import standExperienceCoffee from '../../../assets/experience/coffee.jpg';
import standExperienceMosaicCourtyard from '../../../assets/experience/mosaic-courtyard.jpg';
import standExperienceMosaicDining from '../../../assets/experience/mosaic-dining.jpg';
import standExperienceMosaicHall from '../../../assets/experience/mosaic-hall.jpg';
import standExperienceMosaicLobbyTree from '../../../assets/experience/mosaic-lobby-tree.jpg';
import standExperienceMosaicLounge from '../../../assets/experience/mosaic-lounge.jpg';
import standExperienceMosaicTerrace from '../../../assets/experience/mosaic-terrace.jpg';
import standPromotionsCommute from '../../../assets/promotions/commute.jpg';
import standWellness1 from '../../../assets/wellness-1.jpg';
import standWhyExpApp from '../../../assets/why/exp-app.jpg';
import standWhyExpCafe from '../../../assets/why/exp-cafe.jpg';
import standWhyExpCommunity from '../../../assets/why/exp-community.jpg';
import standWhyExpConvenience from '../../../assets/why/exp-convenience.jpg';
import standWhyExpSmart from '../../../assets/why/exp-smart.jpg';
import standWhyExpWellness from '../../../assets/why/exp-wellness.jpg';
import school1 from '../../../assets/property/places/school-1.jpg';
import school2 from '../../../assets/property/places/school-2.jpg';
import school3 from '../../../assets/property/places/school-3.jpg';
import school4 from '../../../assets/property/places/school-4.jpg';
import school5 from '../../../assets/property/places/school-5.jpg';
import school6 from '../../../assets/property/places/school-6.jpg';
import school7 from '../../../assets/property/places/school-7.jpg';
import school8 from '../../../assets/property/places/school-8.jpg';
import school9 from '../../../assets/property/places/school-9.jpg';

const PLACES: MapCategory[] = [
  {
    name: "Transport",
    places: [
      { name: "Macquarie University Metro Station", address: "Macquarie Park NSW 2109, Australia", lat: -33.77728067275672, lng: 151.11826996809205 },
      { name: "Macquarie Park Metro Station", address: "Macquarie Park NSW 2113, Australia", lat: -33.78523370741828, lng: 151.128327387731 },
      { name: "Herring Rd opp Dunmore Lang College Bus Stop", address: "Macquarie Park NSW 2113, Australia", lat: -33.77912203376471, lng: 151.11648588955754 },
      { name: "Macquarie University Station, Waterloo Rd, Stand C Bus Stop", address: "Macquarie Park NSW 2113, Australia", lat: -33.77848017962804, lng: 151.11930715766016 },
      { name: "Epping Rd opp Booth Reserve Bus Stop", address: "Macquarie Park NSW 2113, Australia", lat: -33.7835015701472, lng: 151.11622579324248 },
      { name: "Macquarie University Station – Herring Road (Stand D)", address: "Macquarie Park NSW 2113, Australia", lat: -33.77686319362562, lng: 151.1185457944673 },
      { name: "Macquarie University Station – Herring Road (Stand E)", address: "Macquarie Park NSW 2113, Australia", lat: -33.777987114197884, lng: 151.11732329171343 },
      { name: "Macquarie University Station – Waterloo Road (Stand C)", address: "Macquarie Park NSW 2113, Australia", lat: -33.77848068393116, lng: 151.11930820063625 },
      { name: "Macquarie University Station – Waterloo Road (Stand A)", address: "Macquarie Park NSW 2113, Australia", lat: -33.778419950178595, lng: 151.11959760193537 },
    ],
  },
  {
    name: "Education",
    places: [
      { name: "Macquarie University", address: "Balaclava Rd, Macquarie Park NSW 2113, Australia", lat: -33.77701912355475, lng: 151.11796998764083, image: school1 },
      { name: "Excelsia University College", address: "69-71 Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.78205963997134, lng: 151.1259032944779, image: school2 },
      { name: "The University of Sydney", address: "Camperdown NSW 2050, Australia", lat: -33.88840409999996, lng: 151.1867648, image: school3 },
      { name: "Victoria University", address: "160 Sussex St, Sydney NSW 2000, Australia", lat: -33.86966943353582, lng: 151.20384746749028, image: school4 },
      { name: "Charles Darwin University", address: "815 George St, Haymarket NSW 2000, Australia", lat: -33.88295151030452, lng: 151.20355458876065, image: school5 },
      { name: "Western Sydney University International College", address: "Level 6/6 Hassall St, Parramatta NSW 2150, Australia", lat: -33.817865238905256, lng: 151.00767945799018, image: school6 },
      { name: "University of New South Wales Sydney", address: "Sydney NSW 2033, Australia", lat: -33.91734709511993, lng: 151.23126777863763, image: school7 },
      { name: "Southern Cross University", address: "117 Macquarie St, Sydney NSW 2000, Australia", lat: -33.86292785535452, lng: 151.21250216122675, image: school8 },
      { name: "University of Technology Sydney", address: "University of Technology Sydney Building 10, CB10/235 Jones St, Broadway NSW 2007, Australia", lat: -33.88356149235273, lng: 151.1990010454967, image: school9 },
      { name: "Swinburne University of Technology Sydney", address: "Level 5/1-3 Fitzwilliam St, Parramatta NSW 2150, Australia", lat: -33.81824454216259, lng: 151.0046854146618 },
      { name: "Torrens University Australia, Sydney", address: "46-52 Mountain St, Ultimo NSW 2007, Australia", lat: -33.883389850013856, lng: 151.1965138584193 },
      { name: "La Trobe University Sydney", address: "255 Elizabeth St, Sydney NSW 2000, Australia", lat: -33.87564174501589, lng: 151.2093425834148 },
      { name: "ACU North Sydney Campus", address: "40 Edward St, North Sydney NSW 2060, Australia", lat: -33.83740386527985, lng: 151.2034237431403 },
      { name: "Western Sydney University Sydney Campus", address: "4/255 Elizabeth St, Sydney NSW 2000, Australia", lat: -33.87571261420539, lng: 151.20920282467338 },
      { name: "Notre Dame University – Australia", address: "128/140 Broadway, Chippendale NSW 2007, Australia", lat: -33.884497808555835, lng: 151.19711347511395 },
      { name: "University of Wollongong", address: "Northfields Ave, Wollongong NSW 2500, Australia", lat: -34.40521564573624, lng: 150.8778608548625 },
    ],
  },
  {
    name: "Food",
    places: [
      { name: "Kong’s BBQ", address: "84 Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.778727699782266, lng: 151.120455510919 },
      { name: "Umaya Macquarie", address: "Shop 2503 197/223 Herring Rd, Macquarie Park NSW 2113, Australia", lat: -33.776757740754725, lng: 151.12040944371716 },
      { name: "Lanzhou Lamian - Beef Noodle Soup", address: "74 Herring Rd, Macquarie Park NSW 2113, Australia", lat: -33.77709383347827, lng: 151.12066379119605 },
      { name: "Dopa Donburi and Dessert - Macquarie Centre", address: "Corner Herring and, Macquarie centre, Shop 3401 Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.77654534602566, lng: 151.11957517949665 },
      { name: "Thirty 7even Dining", address: "Unit 5/3 Mooltan Ave, Macquarie Park NSW 2113, Australia", lat: -33.78089845852162, lng: 151.11332505103144 },
      { name: "Peppercorn Kitchen", address: "Cnr Waterloo &, Macquarie Shopping Centre, Shop 3506 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.77706769292853, lng: 151.12068684634283 },
      { name: "Motto Motto Japanese Kitchen - Macquarie", address: "Level 3, Macquarie Centre Cnr Herring & Waterloo Roads, Macquarie Park NSW 2113, Australia", lat: -33.77671929846576, lng: 151.1205158152415 },
      { name: "Charmed Thai 2Go", address: "287 Lane Cove Rd, Macquarie Park NSW 2113, Australia", lat: -33.783695937148316, lng: 151.13016906632868 },
      { name: "TGI Fridays Macquarie", address: "Macquarie Shopping Centre, 454 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.77665913047411, lng: 151.1192928775907 },
      { name: "Hungry Jack's Burgers Macquarie Centre", address: "Macquarie Centre, Food Court, Level 2, Herring Road &, Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77697268276832, lng: 151.1201995749837 },
      { name: "The Panda Yum Cha", address: "Shop 3390/55-61 Talavera Rd, Macquarie Park NSW 2113, Australia", lat: -33.77727645222771, lng: 151.12365233763592 },
      { name: "Bondi Pizza", address: "Shops 446 & 447, Level 4, Cnr Herring Rd &, Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77714921289144, lng: 151.11965637424126 },
      { name: "Versace Pizzeria", address: "7 Khartoum Rd, Macquarie Park NSW 2113, Australia", lat: -33.780104455871474, lng: 151.12416431065247 },
      { name: "The Dining & Co North Ryde", address: "11 Avon Rd, North Ryde NSW 2113, Australia", lat: -33.791615818892886, lng: 151.1283633294477 },
      { name: "Fortune Alley Macquarie", address: "Shop No. 3406, Level 3, Macquarie Centre, Waterloo Rd &, Herring Rd, North Ryde NSW 2113, Australia", lat: -33.776719161277235, lng: 151.12051761675102 },
    ],
  },
  {
    name: "Shopping & Entertainment",
    places: [
      { name: "Macquarie Centre", address: "Herring Road &, Waterloo Rd, Macquarie Park NSW, Australia", lat: -33.77724928736553, lng: 151.12113573897255 },
      { name: "Event Cinema", address: "Australia, AU New South Wales Macquarie Park Waterloo RoadLevel 3, Corner Of Herring Rd &邮政编码邮政编码: : 2113", lat: -33.77654301694269, lng: 151.11960435728054 },
      { name: "Strike Bowling Macquarie", address: "Macquarie centre, 4 Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.77732181915876, lng: 151.12065837670463 },
      { name: "Timezone Macquarie Park", address: "Macquarie Centre Corner, Level 4 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.776780042195945, lng: 151.12126249376098 },
      { name: "Aldi supermarket", address: "Cnr Herring Road, Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77858854393329, lng: 151.12074760000002 },
      { name: "Woolworths Macquarie Ryde", address: "80 Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.77742747375483, lng: 151.11971901499675 },
      { name: "Coles Macquarie Centre", address: "Macquarie centre, Macquarie Centre, 197/223 Herring Rd, Macquarie Park NSW 2113, Australia'", lat: -33.77835451471874, lng: 151.1206118248631 },
      { name: "Midway Shopping Centre", address: "117 North Rd, Denistone East NSW 2112, Australia", lat: -33.795265757249304, lng: 151.10260036574002 },
      { name: "Cox Road Mall Shopping Centre", address: "202/215 Coxs Rd, North Ryde NSW 2113, Australia", lat: -33.79410280441895, lng: 151.12158015115443 },
      { name: "Lachlan Square Village", address: "17 Halifax St, Macquarie Park NSW 2113, Australia", lat: -33.7934957313267, lng: 151.13430869999993 },
      { name: "Myer Macquarie", address: "Macquarie centre, Herring Rd, North Ryde NSW 2113, Australia", lat: -33.776718687913046, lng: 151.1205177117024 },
      { name: "JB Hi-Fi Macquarie", address: "Macquarie Centre Store 429, Level 4, Corner Herring & Waterloo Roads North, North Ryde NSW 2113, Australia", lat: -33.776718699995094, lng: 151.12051623670345 },
      { name: "BIG W Macquarie", address: "109 Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.77792333953915, lng: 151.11957605889563 },
    ],
  },
  {
    name: "Medical",
    places: [
      { name: "Macquarie University Hospital", address: "3 Technology Pl, Macquarie University NSW 2113, Australia", lat: -33.77331142174307, lng: 151.1178877041445 },
      { name: "Ryde Hospital", address: "Denistone Rd, Eastwood NSW 2122, Australia", lat: -33.79550945724771, lng: 151.0896683294478 },
      { name: "Macquarie Hospital", address: "Wicks Rd, North Ryde NSW 2113, Australia", lat: -33.80286760389041, lng: 151.1273299593665 },
      { name: "WiSE Specialist Emetrgency Clinic", address: "11 Khartoum Rd, Macquarie Park NSW 2113, Australia", lat: -33.77974089404929, lng: 151.1248200888022 },
      { name: "Royal North Shore Hospital", address: "Reserve Rd, St Leonards NSW 2065, Australia", lat: -33.821562601946546, lng: 151.19145546984066 },
      { name: "Macquarie Medical Centre", address: "Macquarie Shopping Centre, Shop 45, Level 1/197 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.77677832015974, lng: 151.1204671183111 },
    ],
  },
  {
    name: "Banks",
    places: [
      { name: "HSBC", address: "Macquarie Shopping Centre, 17 Herring Rd &, Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.777092308412875, lng: 151.1208254246717 },
      { name: "Commonwealth Bank Macquarie Centre North Ryde Branch", address: "Macquarie centre, Shop Uc1, Level 1, Herring Rd, North Ryde NSW 2113, Australia", lat: -33.776755474913365, lng: 151.12030232338037 },
      { name: "Westpac Branch Macquarie Centre", address: "Macquarie Shopping Centre, 109, Level 1/10A Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77774484936781, lng: 151.12030392639127 },
      { name: "ANZ Branch Macquarie Centre", address: "lower ground, the corner of Waterloo and, Macquarie Shopping Centre, Shop/2 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.776718780232166, lng: 151.12051716968853 },
      { name: "NAB", address: "Macquarie Shopping Centre, 225 Herring Rd, North Ryde NSW 2113, Australia", lat: -33.77716833215446, lng: 151.1202000472671 },
    ],
  },
  {
    name: "Telcos & Post Offices",
    places: [
      { name: "Australia Post - Macquarie Centre Post Shop", address: "Macquarie Shopping Centre, Shop 7c/109 Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77736211248286, lng: 151.1208685647694 },
      { name: "Optus", address: "412 Waterloo Rd &, Herring Rd, North Ryde NSW 2113, Australia", lat: -33.777056241037734, lng: 151.12073342185894 },
      { name: "Vodafone Macquarie Centre", address: "Shop 87, Macquarie Centre, Level 2, Corner Herring Road and, Waterloo Rd, North Ryde NSW 2113, Australia", lat: -33.77671925736998, lng: 151.12051719999997 },
    ],
  },
  {
    name: "Other Landmarks",
    places: [
      { name: "Macquarie University Astronomical Observatory", address: "5 Gymnasium Rd, Macquarie Park NSW 2113, Australia", lat: -33.77026205539399, lng: 151.1111438519757 },
      { name: "North Ryde Golf Club", address: "Twin Rd, North Ryde NSW 2113, Australia", lat: -33.79768240772113, lng: 151.11917452153344 },
      { name: "Lane Cove National Park", address: "Max Allen Rd, Lindfield NSW 2070, Australia", lat: -33.79121617719565, lng: 151.1511989602997 },
      { name: "Terrys Creek Waterfall", address: "7e/201-207 Epping Rd, Marsfield NSW 2122, Australia", lat: -33.77903725364448, lng: 151.09325116126266 },
      { name: "Elouera Reserve", address: "82-84 Waterloo Rd, Macquarie Park NSW 2113, Australia", lat: -33.77845638252742, lng: 151.11853246871766 },
      { name: "Sundial Rock", address: "649Q+X9, Macquarie Park NSW 2113, Australia", lat: -33.780060510324944, lng: 151.1384659227299 },
    ],
  },
];

/**
 * Stand-in photos until each place has its own: the site's own photos, loosely matched to
 * the area. Every fourth place without a photo is left without one, so the finder shows
 * its placeholder (Figma 1227:12217).
 */
const STAND_INS: Record<string, string[]> = {
  "Education": [standAboutPlaceMacquarieUniversity, standBlogCampusShadows, standAboutWideMacquarie],
  "Transport": [standPromotionsCommute, standBlogArrivalSteps, standWhyExpConvenience],
  "Food": [standExperienceMosaicDining, standWhyExpCafe, standExperienceCoffee, standBlogStudyCoffee],
  "Shopping & Entertainment": [standWhyExpCommunity, standExperienceMosaicLounge, standExperienceMosaicHall],
  "Medical": [standWhyExpWellness, standWellness1],
  "Banks": [standExperienceMosaicLobbyTree, standWhyExpSmart],
  "Telcos & Post Offices": [standWhyExpApp, standExperienceCardPrivileges],
  "Other Landmarks": [standExperienceMosaicCourtyard, standExperienceMosaicTerrace, standAboutLocationBg],
};

export const MACQUARIE_PARK_PLACES: MapCategory[] = PLACES.map((category) => {
  const pool = STAND_INS[category.name] ?? [];
  let missing = 0;
  return {
    ...category,
    places: category.places.map((place) => {
      if (place.image || !pool.length) return place;
      const n = missing++;
      return n % 4 === 3 ? place : { ...place, image: pool[n % pool.length] };
    }),
  };
});
