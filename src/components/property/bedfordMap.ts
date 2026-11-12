/**
 * Places around EPIISOD Bedford, by category — from the live site's location map
 * (epiisod.com/en-au/melbourne/epiisod-bedford, November 2026), under the finder's area
 * names ("F&B" → Food; "Banks, Post Offices & Telco" → Telcos & Post Offices).
 */
import type { MapCategory } from './propertyContent';

export const BEDFORD_PLACES: MapCategory[] = [
  {
    name: "Transport",
    places: [
      { name: "Courtney St Bus Stop", address: "North Melbourne VIC 3051, Australia", lat: -37.80056847479982, lng: 144.95338399101635 },
      { name: "Dowling Pl Bus Stop", address: "North Melbourne VIC 3051, Australia", lat: -37.762248032493, lng: 144.93991990834 },
      { name: "Flemington Road - Stop 12 Tram Stop", address: "North Melbourne VIC 3051, Australia", lat: -37.80128087157609, lng: 144.95666539477847 },
      { name: "Flinders Street Station", address: "Flinders St, Melbourne VIC 3000, Australia", lat: -37.817881315787304, lng: 144.96717799852874 },
      { name: "Haymarket/Elizabeth ST Tram Stop", address: "Melbourne VIC 3000, Australia", lat: -37.80177516395861, lng: 144.9574440101231 },
      { name: "Melbourne Central Train Station", address: "Melbourne VIC 3000, Australia", lat: -37.81154085000506, lng: 144.96461073133105 },
      { name: "Queensberry St / Peel St Tram stop", address: "North Melbourne VIC 3051, Australia", lat: -37.80318219110464, lng: 144.9563865543039 },
      { name: "Royal Melbourne Hospital / Flemington Road 14 Tram Stop", address: "Melbourne VIC 3000, Australia", lat: -37.79980653552555, lng: 144.95554961012306 },
      { name: "Royal Melbourne Hospital / Flemington Road Bus Stop", address: "North Melbourne VIC 3051, Australia", lat: -37.79987789500425, lng: 144.9552846735751 },
    ],
  },
  {
    name: "Education",
    places: [
      { name: "The University of Melbourne", address: "Parkville VIC 3010, Australia", lat: -37.79824077770827, lng: 144.9609683457573 },
      { name: "University of Canberra", address: "Melbourne VIC 3000, Australia", lat: -37.81050227382548, lng: 144.9589401006795 },
      { name: "RMIT University - Melbourne City Campus", address: "City campus, 124 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.80829841907081, lng: 144.96421868811365 },
      { name: "Charles Sturt University Melbourne", address: "222 Bourke St, Melbourne VIC 3000, Australia", lat: -37.81272301477559, lng: 144.96645028603965 },
      { name: "ACAP University College - ACAP Melbourne", address: "Kmart Melbourne Cbd, Level 3/222 Bourke Street Mall, Melbourne VIC 3000, Australia", lat: -37.81235007058132, lng: 144.96617133629718 },
      { name: "Monash College City Campus", address: "Level 5/750 Collins St, Docklands VIC 3008, Australia", lat: -37.81942965282496, lng: 144.94951524589254 },
      { name: "University of Tasmania - Melbourne Study Centre", address: "2/655 Collins St, Docklands VIC 3008, Australia", lat: -37.81942965282496, lng: 144.95294027247056 },
      { name: "Kaplan Business School Melbourne", address: "Level 4/370 Docklands Dr, Docklands VIC 3008, Australia", lat: -37.8118177235793, lng: 144.9421411683176 },
    ],
  },
  {
    name: "Food",
    places: [
      { name: "Auction Rooms Cafe", address: "103-107 Errol St, North Melbourne VIC 3051, Australia", lat: -37.80228934276573, lng: 144.94956339890726 },
      { name: "Pidapipó Carlton", address: "299 Lygon St, Carlton VIC 3053, Australia", lat: -37.79813366363036, lng: 144.96723054113775 },
      { name: "Butchers Diner", address: "10 Bourke St, Melbourne VIC 3000, Australia", lat: -37.810756329937554, lng: 144.97238778801625 },
      { name: "Pizza Pizza Pizza", address: "16 Meyers Pl, Melbourne VIC 3000, Australia", lat: -37.812018326820436, lng: 144.97237745463138 },
      { name: "Dolan Uyghur Cuisine", address: "382 Lonsdale St, Melbourne VIC 3000, Australia", lat: -37.81224507527826, lng: 144.96095791045343 },
      { name: "The Castle Hotel", address: "56 Courtney St, North Melbourne VIC 3051, Australia", lat: -37.80074645111066, lng: 144.95305765245925 },
      { name: "Baguette Studios", address: "15-27 Wreckyn St, North Melbourne VIC 3051, Australia", lat: -37.80041356431218, lng: 144.9536881798828 },
      { name: "Domino's Pizza", address: "5a/33 Flemington Rd, North Melbourne VIC 3051, Australia", lat: -37.79869072020101, lng: 144.95571683658287 },
      { name: "Gai Wong", address: "Shop 1/5-17 Flemington Rd, North Melbourne VIC 3051, Australia", lat: -37.800168183190436, lng: 144.95622347664553 },
      { name: "The Rice Cooker", address: "Shop 3/33 Flemington Rd, North Melbourne VIC 3051, Australia", lat: -37.80024673659854, lng: 144.95540991167803 },
      { name: "Yum Sing House Restaurant", address: "22 Sutherland St, Melbourne VIC 3000, Australia", lat: -37.81203079401418, lng: 144.96082451541963 },
      { name: "Eat Pizza", address: "557 Flinders St, Melbourne VIC 3000, Australia", lat: -37.81787012251062, lng: 144.9564410481441 },
      { name: "I Wrap Cafe", address: "535 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.80421009428996, lng: 144.95829274266535 },
      { name: "Master Lanzhou Noodle Bar - CBD", address: "379 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.809916376443354, lng: 144.96099400569764 },
    ],
  },
  {
    name: "Shopping & Entertainment",
    places: [
      { name: "7-Eleven", address: "45 Flemington Rd, North Melbourne VIC 3051, Australia", lat: -37.80011554674943, lng: 144.9550168239537 },
      { name: "KT Mart", address: "544 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.80515729859535, lng: 144.9595234684416 },
      { name: "Mr Dad Asian Supermarket", address: "168 Victoria St, Carlton VIC 3053, Australia", lat: -37.80605583938725, lng: 144.961712150908 },
      { name: "Queen Victoria Market", address: "Queen St, Melbourne VIC 3000, Australia", lat: -37.80734242753984, lng: 144.9566347933527 },
      { name: "Woolworths Queens Place", address: "157 A'Beckett St, Melbourne VIC 3000, Australia", lat: -37.80988329845518, lng: 144.95858713743962 },
      { name: "Coles Central Melbourne Central", address: "Central, 211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.809880532516, lng: 144.96338566812454 },
      { name: "BIG W Queen Victoria Village", address: "Corner of Swanston Street and, Lonsdale St, Melbourne VIC 3000, Australia", lat: -37.81104896778367, lng: 144.9648329951108 },
      { name: "Melbourne Central", address: "Cnr LaTrobe and, Swanston St, Melbourne VIC 3000, Australia", lat: -37.81020112797326, lng: 144.96276344003627 },
      { name: "Woolworths City North", address: "669 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.802985341737994, lng: 144.95756710801572 },
      { name: "QV Melbourne", address: "Cnr Lonsdale Street and, Swanston St, Melbourne VIC 3000, Australia", lat: -37.810580849173384, lng: 144.9656187837936 },
      { name: "B. Lucky & Sons Melbourne Central", address: "level 3/211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.81041995202581, lng: 144.96300195278204 },
      { name: "Strike Bowling Melbourne Central", address: "Shop 305, Level 3 Melbourne Central/211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.81027348092885, lng: 144.96323928311136 },
      { name: "LOST in Melbourne Escape Rooms", address: "298 Flinders Ln, Melbourne VIC 3000, Australia", lat: -37.81708707153002, lng: 144.96420100156095 },
      { name: "IMAX Melbourne", address: "Rathdowne St, Carlton VIC 3053, Australia", lat: -37.8035433319968, lng: 144.9706214587787 },
      { name: "KBOX Karaoke Private Room", address: "52 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.808209159881756, lng: 144.96727845463144 },
      { name: "Archie Brothers Melbourne Docklands", address: "440 Docklands Dr, Docklands VIC 3008, Australia", lat: -37.81199815492399, lng: 144.9365446816177 },
      { name: "Melbourne Zoo", address: "Elliott Ave, Parkville VIC 3052, Australia", lat: -37.78355656876937, lng: 144.95167577744024 },
      { name: "State Library Victoria", address: "328 Swanston St, Melbourne VIC 3000, Australia", lat: -37.80972317810093, lng: 144.96521505579412 },
      { name: "Melbourne Museum", address: "11 Nicholson St, Carlton VIC 3053, Australia", lat: -37.80321105960701, lng: 144.97178771421176 },
    ],
  },
  {
    name: "Medical",
    places: [
      { name: "The Royal Melbourne Hospital", address: "300 Grattan St, Parkville VIC 3050, Australia", lat: -37.79841382105953, lng: 144.9560672061054 },
      { name: "PrimeCare Medical", address: "Suite101/538-540 Swanston St, Carlton VIC 3053, Australia", lat: -37.803832809445204, lng: 144.96342556413185 },
      { name: "AIMHEALTH Melbourne Central Medical Centre", address: "level 1/368 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.80985351876117, lng: 144.96143117255872 },
      { name: "Vita Medical Centre", address: "375 King St, West Melbourne VIC 3003, Australia", lat: -37.81114696650739, lng: 144.95318570261486 },
    ],
  },
  {
    name: "Telcos & Post Offices",
    places: [
      { name: "Commonwealth Bank 317 Grattan Street Branch", address: "Victorian Comprehensive Cancer Centre, Tenancy 2/317 Grattan St, North Melbourne VIC 3051, Australia", lat: -37.799568999672914, lng: 144.95629988346664 },
      { name: "Westpac Branch Melbourne Central", address: "316 Elizabeth St, Melbourne VIC 3000, Australia", lat: -37.81085873375109, lng: 144.96200559880947 },
      { name: "NAB Chinatown Branch", address: "Shop 2-4/196-208 Russell St, Melbourne VIC 3000, Australia", lat: -37.811441406132595, lng: 144.96762430675457 },
      { name: "Australia Post - North Melbourne Post Office", address: "72-82 Errol St, North Melbourne VIC 3051, Australia", lat: -37.803220870168126, lng: 144.94987294059007 },
      { name: "Australia Post Melbourne CBD", address: "G/277 William St, Melbourne VIC 3000, Australia", lat: -37.812131714636074, lng: 144.95647837792157 },
      { name: "Telstra Partner D Station", address: "365 Queen St, Melbourne VIC 3004, Australia", lat: -37.809759927121625, lng: 144.95816421045322 },
      { name: "Vodafone Melbourne Central", address: "L01 139A, Corner La Trobe Street and Swanston Street Melbourne Central Shopping Centre, Melbourne VIC 3000, Australia", lat: -37.81064178590161, lng: 144.96307101045318 },
      { name: "Optus Melbourne Central", address: "Unit 141/211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.80992025943068, lng: 144.9630892662752 },
    ],
  },
];
