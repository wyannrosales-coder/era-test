import lounge from '../../assets/experience/mosaic-lounge.jpg';
import sharedMeal from '../../assets/experience/card-exclusives.jpg';
import studyCoffee from '../../assets/blog/study-coffee.jpg';
import rooftopPool from '../../assets/blog/rooftop-pool.jpg';
import campusShadows from '../../assets/blog/campus-shadows.jpg';
import loungeWindow from '../../assets/blog/lounge-window.jpg';
import studioRoom from '../../assets/blog/studio-room.jpg';
import arrivalSteps from '../../assets/blog/arrival-steps.jpg';
import courtyard from '../../assets/experience/mosaic-courtyard.jpg';
import pool from '../../assets/experience/mosaic-pool.jpg';
import lobbyTree from '../../assets/experience/mosaic-lobby-tree.jpg';
import dining from '../../assets/experience/mosaic-dining.jpg';
import terrace from '../../assets/experience/mosaic-terrace.jpg';
import hall from '../../assets/experience/mosaic-hall.jpg';
import coffee from '../../assets/experience/coffee.jpg';
import residents from '../../assets/experience/card-privileges.jpg';
import exterior from '../../assets/about/wide-macquarie.jpg';
import university from '../../assets/about/place-macquarie-university.jpg';
import studio from '../../assets/property/rooms/signature-studio.jpg';
import studioFlex from '../../assets/property/rooms/signature-studio-flex.jpg';
import keyAccess from '../../assets/property/amenity-01.jpg';
import secure from '../../assets/property/amenity-secure.jpg';
import studyDesk from '../../assets/property/amenity-wifi.jpg';
import socialTable from '../../assets/property/amenity-social.jpg';
import commute from '../../assets/promotions/commute.jpg';
import freeWeeks from '../../assets/promotions/free-weeks.jpg';
import stairs from '../../assets/why/exp-convenience.jpg';
import wellness from '../../assets/why/exp-wellness.jpg';
import gym from '../../assets/wellness-1.jpg';
import poolside from '../../assets/wellness-pool.jpg';

/** The two blogs (Figma 1082:18367): each has its own listing at /blog/<id>. */
export type Audience = { id: string; label: string; categories: string[] };

export const AUDIENCES: Audience[] = [
  {
    id: 'for-parents',
    label: 'For parents',
    categories: ['Moving in', 'Safety & wellbeing', 'Budgeting', 'Staying connected'],
  },
  {
    id: 'for-international-students',
    label: 'For international students',
    categories: ['Settling in', 'Study life', 'Exploring Sydney', 'Wellbeing'],
  },
];

/** Tag colours (Figma 1085:19843): six pairs, given out in order across both blogs. */
const TONES = 6;
const ALL_CATEGORIES = AUDIENCES.flatMap((a) => a.categories);

/** The tag colour (1–6) for a category: each category keeps its colour wherever it shows. */
export const categoryTone = (category: string) =>
  (Math.max(0, ALL_CATEGORIES.indexOf(category)) % TONES) + 1;

export type BlogSection ={ title: string; paragraphs: string[] };

export type BlogPost = {
  slug: string;
  audience: string;
  category: string;
  title: string;
  excerpt: string;
  /** ISO date. */
  date: string;
  /** Reading time, worked out from the text. */
  minutes: number;
  image: string;
  /** Where the photo's focus sits when cropped (CSS object-position); centred if unset. */
  imagePosition?: string;
  /** Shown after the second section (Figma 1119:43468). */
  inlineImage?: string;
  sections: BlogSection[];
};

type Draft = Omit<BlogPost, 'audience' | 'minutes'>;

/**
 * Sample articles, written to fill the templates until the real ones are ready. Photos
 * are from the site; dates are recent, newest first.
 */
const PARENTS: Draft[] = [
  {
    slug: 'choosing-student-accommodation',
    category: 'Moving in',
    title: 'Choosing the right student home: a guide for parents',
    excerpt:
      'Location, safety, support and space to grow — what to look for when you help your child choose where they’ll live while they study.',
    date: '2026-10-20',
    image: lounge,
    inlineImage: studio,
    sections: [
      {
        title: 'Start with the commute',
        paragraphs: [
          'The best student homes make the daily routine easy. Look at how long it takes to reach campus on foot or by public transport, and whether the trip is safe and well lit at night. A short, simple commute leaves more time for study, rest and friends.',
          'It’s worth walking the route together on a visit. You’ll get a feel for the neighbourhood, see what’s nearby — supermarkets, pharmacies, cafés — and your child will start to picture their week.',
        ],
      },
      {
        title: 'Look closely at support',
        paragraphs: [
          'Ask who is on site, and when. A reception team that’s there around the clock, clear processes for maintenance and a plan for emergencies all matter more than they first appear.',
          'Good student living also looks after wellbeing. Ask about access to counselling or support services, and whether staff check in with new residents during their first weeks.',
        ],
      },
      {
        title: 'Think about community',
        paragraphs: [
          'Moving away from home is a big step, and a strong community makes it easier. Shared kitchens, study spaces and a regular events calendar give students natural ways to meet people.',
          'At the same time, everyone needs somewhere quiet to retreat. A private studio or ensuite room gives your child their own space while the people they meet are just down the hall.',
        ],
      },
      {
        title: 'Read the fine print together',
        paragraphs: [
          'Before signing, go through the lease with your child. Check what’s included in the weekly price — utilities, internet, contents insurance — and what happens if plans change mid-year.',
          'Clear answers now save stress later, and it’s a good chance to talk through budgeting and responsibilities before move-in day.',
        ],
      },
    ],
  },
  {
    slug: 'move-in-day-checklist',
    category: 'Moving in',
    title: 'The move-in day checklist every parent will thank us for',
    excerpt: 'From bedding to adaptors, the small things that make the first night feel like home.',
    date: '2026-10-14',
    image: studioFlex,
    inlineImage: keyAccess,
    sections: [
      {
        title: 'Pack for the first week, not the whole year',
        paragraphs: [
          'It’s tempting to bring everything, but rooms fill up quickly. Focus on the essentials for the first week — bedding, towels, a few kitchen basics, chargers and adaptors — and plan a shop together once your child has seen the space.',
          'A small toolkit, a doorstop and a power board are surprisingly useful in the first days.',
        ],
      },
      {
        title: 'Make the room theirs',
        paragraphs: [
          'Photos, a favourite throw, a plant: small touches make a new room feel familiar. Command hooks and removable strips let your child decorate without damaging the walls.',
        ],
      },
      {
        title: 'Know who to call',
        paragraphs: [
          'Before you leave, save the reception number in both your phones and find out how to report maintenance. Knowing help is easy to reach makes the goodbye a little easier for everyone.',
        ],
      },
    ],
  },
  {
    slug: 'how-safe-is-student-living',
    category: 'Safety & wellbeing',
    title: 'How safe is student living? Questions worth asking',
    excerpt: 'Secure entry, 24/7 teams and wellbeing support: what good student accommodation does to keep residents safe.',
    date: '2026-10-08',
    image: secure,
    inlineImage: hall,
    sections: [
      {
        title: 'Building security',
        paragraphs: [
          'Ask how residents and guests get in. Keyless entry, CCTV in shared areas and a staffed reception mean only the right people can access the building and each floor.',
          'Well-lit entrances and secure bike and car storage add another layer of peace of mind.',
        ],
      },
      {
        title: 'People, not just systems',
        paragraphs: [
          'Technology helps, but people make the difference. A team that knows residents by name notices when something isn’t right and can step in early.',
        ],
      },
      {
        title: 'Support around the clock',
        paragraphs: [
          'Problems don’t keep office hours. Look for 24/7 access to wellbeing and safety support — at EPIISOD, residents can reach help any time through Sonder, right from their phone.',
        ],
      },
    ],
  },
  {
    slug: 'budgeting-for-the-first-year',
    category: 'Budgeting',
    title: 'Budgeting for your child’s first year away',
    excerpt: 'All-inclusive rent, transport and the cost of everyday life — a simple way to plan the year together.',
    date: '2026-09-29',
    image: freeWeeks,
    inlineImage: commute,
    sections: [
      {
        title: 'Know what rent includes',
        paragraphs: [
          'All-inclusive rent makes planning far simpler. When utilities, internet and access to shared spaces are covered, the weekly cost is predictable and there are no surprise bills.',
        ],
      },
      {
        title: 'Plan the everyday costs',
        paragraphs: [
          'Groceries, transport, a phone plan and a little for going out make up most of a student’s weekly spending. Sit down together and set a realistic weekly amount, then review it after the first month.',
          'Look for savings too — student transport concessions and resident offers can make a real difference over a year.',
        ],
      },
      {
        title: 'Build in a buffer',
        paragraphs: [
          'Textbooks, a new laptop charger or a trip home can all come up unexpectedly. A small emergency fund means one surprise doesn’t derail the month.',
        ],
      },
    ],
  },
  {
    slug: 'staying-close-from-afar',
    category: 'Staying connected',
    title: 'Staying close when your child moves away',
    excerpt: 'How to keep in touch without hovering, and help them find their feet.',
    date: '2026-09-22',
    image: sharedMeal,
    inlineImage: coffee,
    sections: [
      {
        title: 'Agree on a rhythm',
        paragraphs: [
          'A regular call — once a week over the weekend, say — gives you both something to look forward to, while leaving room for your child to build their own routine.',
        ],
      },
      {
        title: 'Listen more than you advise',
        paragraphs: [
          'The first weeks are full of new experiences, good and hard. Often the most helpful thing is to listen and let them work through it, offering advice when they ask.',
        ],
      },
      {
        title: 'Plan the first visit',
        paragraphs: [
          'Having a visit on the calendar, a few weeks in, helps homesickness. Let your child show you their neighbourhood — they’ll enjoy being the expert.',
        ],
      },
    ],
  },
  {
    slug: 'wellbeing-signs-to-look-for',
    category: 'Safety & wellbeing',
    title: 'Wellbeing in the first semester: signs to look out for',
    excerpt: 'Settling in takes time. Here’s how to tell when your child might need a little more support.',
    date: '2026-09-15',
    image: wellness,
    inlineImage: poolside,
    sections: [
      {
        title: 'It’s normal to have a dip',
        paragraphs: [
          'Many students feel a low point a few weeks into the semester, once the excitement fades and the workload builds. It usually passes as routines and friendships form.',
        ],
      },
      {
        title: 'What to watch for',
        paragraphs: [
          'Changes in sleep, skipping classes, withdrawing from friends or sounding flat for a long stretch can all be signs that your child needs support.',
        ],
      },
      {
        title: 'Where help is',
        paragraphs: [
          'Encourage your child to talk to the on-site team or use their university’s counselling service. Knowing where help is before they need it makes reaching out much easier.',
        ],
      },
    ],
  },
  {
    slug: 'what-all-inclusive-really-means',
    category: 'Budgeting',
    title: 'What “all-inclusive” really means',
    excerpt: 'A plain-English look at what’s covered in an all-inclusive student rent — and what isn’t.',
    date: '2026-09-08',
    image: studyDesk,
    inlineImage: lobbyTree,
    sections: [
      {
        title: 'Usually included',
        paragraphs: [
          'Electricity, water, high-speed WiFi, a furnished room and access to shared spaces like the gym, study rooms and lounges are typically covered in one weekly price.',
        ],
      },
      {
        title: 'Usually extra',
        paragraphs: [
          'Food, personal items and some optional services sit outside the rent. Car parking and certain premium rooms may also cost more — it’s always worth asking.',
        ],
      },
    ],
  },
  {
    slug: 'helping-them-make-friends',
    category: 'Staying connected',
    title: 'Helping your child make friends in a new city',
    excerpt: 'Community events, shared spaces and a little encouragement go a long way.',
    date: '2026-09-01',
    image: socialTable,
    inlineImage: dining,
    sections: [
      {
        title: 'Say yes to the first invitations',
        paragraphs: [
          'Welcome events in the first weeks are designed for meeting people. Encourage your child to go, even if they feel shy — everyone is new together.',
        ],
      },
      {
        title: 'Use the shared spaces',
        paragraphs: [
          'Studying in a shared lounge rather than alone in their room naturally leads to conversations, study groups and friendships.',
        ],
      },
    ],
  },
  {
    slug: 'getting-to-know-macquarie-park',
    category: 'Moving in',
    title: 'Getting to know Macquarie Park',
    excerpt: 'A quick tour of the neighbourhood your child will call home: campus, the Metro, shopping and green space.',
    date: '2026-08-25',
    image: exterior,
    inlineImage: university,
    sections: [
      {
        title: 'Minutes from campus',
        paragraphs: [
          'Macquarie University is a short walk away, and the Metro connects the area to the city in under half an hour.',
        ],
      },
      {
        title: 'Everything nearby',
        paragraphs: [
          'Macquarie Centre has supermarkets, cafés and a cinema, and the area’s parks and bushland trails are perfect for a weekend walk.',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-on-a-tour',
    category: 'Safety & wellbeing',
    title: 'Ten questions to ask on a property tour',
    excerpt: 'Make the most of your visit with a short list of questions that tell you what day-to-day life is really like.',
    date: '2026-08-18',
    image: courtyard,
    inlineImage: terrace,
    sections: [
      {
        title: 'About the building',
        paragraphs: [
          'How do residents get in after hours? Who is on site overnight? How quickly are maintenance requests handled? What’s included in the rent?',
        ],
      },
      {
        title: 'About everyday life',
        paragraphs: [
          'What events run each month? Where do students study? How are noise and guests managed? And what do current residents say they like most?',
        ],
      },
    ],
  },
];

const STUDENTS: Draft[] = [
  {
    slug: 'your-first-week-in-sydney',
    category: 'Settling in',
    title: 'Your first week in Sydney: a simple plan',
    excerpt:
      'Phone, bank account, transport card and a few good coffees — how to get set up and feel at home in your first seven days.',
    date: '2026-10-21',
    image: rooftopPool,
    imagePosition: '50% 62%',
    inlineImage: arrivalSteps,
    sections: [
      {
        title: 'Days one and two: get connected',
        paragraphs: [
          'Pick up a local SIM so you can call and use maps without roaming charges. Then open a bank account — most banks let you start online before you arrive and finish in a branch with your passport.',
          'Get an Opal card, or simply tap on with your bank card, to use trains, buses, the Metro and ferries across Sydney.',
        ],
      },
      {
        title: 'Days three and four: learn your neighbourhood',
        paragraphs: [
          'Walk your route to campus, find the nearest supermarket and pharmacy, and say hello to the reception team. Small, familiar places make a new city feel smaller.',
        ],
      },
      {
        title: 'Days five to seven: meet people',
        paragraphs: [
          'Go to the welcome events, join a society at orientation and use the shared kitchen. Everyone is looking for friends in the first weeks — say yes to invitations.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-study-well-at-home',
    category: 'Study life',
    title: 'How to study well when you live where you study',
    excerpt: 'Building a routine, finding your best spot and knowing when to switch off.',
    date: '2026-10-15',
    image: studyCoffee,
    inlineImage: studyDesk,
    sections: [
      {
        title: 'Find your study spots',
        paragraphs: [
          'Have one place for deep work and another for lighter tasks. A quiet study room for essays, a lounge for reading, your desk for quick revision — changing places helps your brain switch modes.',
        ],
      },
      {
        title: 'Keep a simple routine',
        paragraphs: [
          'Set regular start and finish times, even on days without classes. Short breaks every hour and a proper lunch away from your desk keep your focus fresh.',
        ],
      },
      {
        title: 'Know when to stop',
        paragraphs: [
          'Living close to campus makes it easy to work late. Protect your evenings: a walk, a swim or dinner with friends will help you study better tomorrow.',
        ],
      },
    ],
  },
  {
    slug: 'weekend-escapes-from-macquarie-park',
    category: 'Exploring Sydney',
    title: 'Five easy weekend escapes from Macquarie Park',
    excerpt: 'Beaches, bushwalks and harbour views — all reachable by public transport.',
    date: '2026-10-09',
    image: terrace,
    inlineImage: poolside,
    sections: [
      {
        title: 'Manly by ferry',
        paragraphs: [
          'Take the Metro into the city and the ferry across the harbour. The ride alone is worth it, and Manly’s beach and coastal walk make a perfect day.',
        ],
      },
      {
        title: 'Lane Cove National Park',
        paragraphs: [
          'Just around the corner, the park’s riverside trails and picnic spots are an easy way to swap screens for trees on a Sunday morning.',
        ],
      },
      {
        title: 'The city and the harbour',
        paragraphs: [
          'Walk from Circular Quay past the Opera House to the Botanic Garden, then find dinner in the laneways. It’s a classic for a reason.',
        ],
      },
    ],
  },
  {
    slug: 'managing-homesickness',
    category: 'Wellbeing',
    title: 'Managing homesickness: what actually helps',
    excerpt: 'Missing home is normal. Here are small, practical ways to feel better while you settle in.',
    date: '2026-10-02',
    image: campusShadows,
    inlineImage: residents,
    sections: [
      {
        title: 'Keep a little of home',
        paragraphs: [
          'Cook a favourite dish, keep a photo by your bed, call family at a regular time. Familiar rituals are an anchor while everything else is new.',
        ],
      },
      {
        title: 'Build new routines',
        paragraphs: [
          'A morning coffee spot, a weekly gym class, a study group — routines create a sense of belonging faster than you’d expect.',
        ],
      },
      {
        title: 'Talk to someone',
        paragraphs: [
          'If you feel low for a while, reach out. The on-site team and Sonder’s 24/7 support are there for exactly this, and so is your university’s counselling service.',
        ],
      },
    ],
  },
  {
    slug: 'cooking-on-a-student-budget',
    category: 'Settling in',
    title: 'Cooking on a student budget',
    excerpt: 'Simple shopping habits and five easy meals that save money and time.',
    date: '2026-09-25',
    image: dining,
    inlineImage: socialTable,
    sections: [
      {
        title: 'Shop with a plan',
        paragraphs: [
          'Write a list for the week, buy staples in bulk and check the supermarket’s weekly specials. Cooking with friends and sharing ingredients cuts costs further.',
        ],
      },
      {
        title: 'Five meals to master',
        paragraphs: [
          'A stir-fry, a pasta bake, a big pot of soup, fried rice and a curry. Each uses cheap ingredients, makes leftovers and can be changed up all year.',
        ],
      },
    ],
  },
  {
    slug: 'getting-around-sydney',
    category: 'Exploring Sydney',
    title: 'Getting around Sydney: transport made simple',
    excerpt: 'Metro, trains, buses and ferries — how the network works and how to save on fares.',
    date: '2026-09-18',
    image: commute,
    inlineImage: lobbyTree,
    sections: [
      {
        title: 'One card for everything',
        paragraphs: [
          'Opal works across trains, the Metro, buses, ferries and light rail. You can also tap on with a contactless bank card or phone.',
        ],
      },
      {
        title: 'Save on fares',
        paragraphs: [
          'Fares are capped daily and weekly, and travel is cheaper off-peak. Eligible students can apply for concession fares too.',
        ],
      },
    ],
  },
  {
    slug: 'staying-active-on-campus',
    category: 'Wellbeing',
    title: 'Staying active when life gets busy',
    excerpt: 'Short workouts, walking meetings and the pool downstairs — fitting movement into a full week.',
    date: '2026-09-11',
    image: gym,
    inlineImage: pool,
    sections: [
      {
        title: 'Make it convenient',
        paragraphs: [
          'The easiest workout is the one that’s close. An on-site gym or pool means twenty minutes between classes is enough.',
        ],
      },
      {
        title: 'Move with friends',
        paragraphs: [
          'Join a social sport, a running club or a resident fitness class. Exercise is easier — and more fun — with company.',
        ],
      },
    ],
  },
  {
    slug: 'celebrating-festivals-away-from-home',
    category: 'Exploring Sydney',
    title: 'Celebrating festivals away from home',
    excerpt: 'From the Moon Festival to Diwali, how Sydney marks the year — and how to celebrate with your new community.',
    date: '2026-09-04',
    image: socialTable,
    inlineImage: dining,
    sections: [
      {
        title: 'A city of celebrations',
        paragraphs: [
          'Sydney hosts festivals from every corner of the world, with markets, lanterns and food stalls throughout the year.',
        ],
      },
      {
        title: 'Make your own traditions',
        paragraphs: [
          'Share a dish from home at a resident dinner, or invite friends to join your celebration. It’s one of the best ways to feel at home and learn about each other.',
        ],
      },
    ],
  },
  {
    slug: 'first-assignment-tips',
    category: 'Study life',
    title: 'Acing your first assignment in Australia',
    excerpt: 'Referencing, deadlines and asking for help — what’s different, and how to get it right.',
    date: '2026-08-28',
    image: university,
    inlineImage: stairs,
    sections: [
      {
        title: 'Read the brief twice',
        paragraphs: [
          'Marking criteria tell you exactly what your lecturer wants. Highlight the key verbs — analyse, compare, evaluate — and plan your answer around them.',
        ],
      },
      {
        title: 'Reference as you go',
        paragraphs: [
          'Australian universities take academic integrity seriously. Keep track of your sources from day one and use your library’s referencing guides.',
        ],
      },
      {
        title: 'Use the support available',
        paragraphs: [
          'Writing centres, peer mentors and your tutors are there to help. Booking a session early is a sign of a strong student, not a struggling one.',
        ],
      },
    ],
  },
  {
    slug: 'making-your-studio-feel-like-home',
    category: 'Settling in',
    title: 'Making your studio feel like home',
    excerpt: 'Small, renter-friendly changes that make a new room yours.',
    date: '2026-08-21',
    image: studioRoom,
    inlineImage: loungeWindow,
    sections: [
      {
        title: 'Light and texture',
        paragraphs: [
          'A warm lamp, a soft throw and a rug change the feel of a room more than anything else.',
        ],
      },
      {
        title: 'Keep it personal',
        paragraphs: [
          'Photos, a few books and a plant or two make your space feel lived in. Removable hooks let you decorate without marking the walls.',
        ],
      },
    ],
  },
];

/** About 220 words a minute, never less than a minute. */
const readingMinutes = (d: Draft) => {
  const words = [d.excerpt, ...d.sections.flatMap((s) => [s.title, ...s.paragraphs])].join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

/** Each blog's posts, newest first; the first is the featured one. */
export const POSTS: BlogPost[] = [
  ...PARENTS.map((d) => ({ ...d, audience: 'for-parents', minutes: readingMinutes(d) })),
  ...STUDENTS.map((d) => ({ ...d, audience: 'for-international-students', minutes: readingMinutes(d) })),
];

export const postHref = (p: BlogPost) => `/blog/${p.audience}/${p.slug}`;

/** Month first, as in Figma. */
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** "OCTOBER 1, 2026 • 5 min. read" */
export const postMeta = (p: BlogPost) =>
  `${dateFormat.format(new Date(p.date)).toUpperCase()} • ${p.minutes} min. read`;
