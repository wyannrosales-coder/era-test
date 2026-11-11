import freeWeeks from '../../../assets/promotions/free-weeks.jpg';
import commute from '../../../assets/promotions/commute.jpg';
import girlWithPhone from '../../../assets/property/promo-banner.jpg';
import bedroom from '../../../assets/promotions/bedroom.jpg';
import payInFull from '../../../assets/promotions/pay-in-full.jpg';

/**
 * Text on an offer's page: `**bold**`, `[label](url)` links, and email addresses,
 * which become mail links.
 */
export type RichText = string;

/** A list point: a line, or a lead line with paragraphs and sub-points below it. */
export type OfferPoint = RichText | { text: RichText; body?: RichText[]; points?: RichText[] };

export type OfferBlock =
  | { type: 'p'; text: RichText }
  | { type: 'ul' | 'ol'; points: OfferPoint[] };

export type OfferSection = { title: string; blocks: OfferBlock[] };

export type Offer = {
  /** The page's address, /promotions/<id>, as on the live site. */
  id: string;
  title: string;
  /** The summary on cards. */
  text: string;
  image: string;
  /** `direct-debit` offers carry the light bronze tag (Figma 786:11011). */
  tag: 'exclusive' | 'direct-debit';
  /** The offer page's opening paragraphs, above the first section. */
  intro?: OfferBlock[];
  /** The offer page's sections, each listed in its contents panel. */
  sections: OfferSection[];
};

const p = (text: RichText): OfferBlock => ({ type: 'p', text });
const ul = (...points: OfferPoint[]): OfferBlock => ({ type: 'ul', points });
const ol = (...points: OfferPoint[]): OfferBlock => ({ type: 'ol', points });

/**
 * The offers on the Promotions page (Figma 786:10997), in Figma order. Each page's copy
 * is from the live site (epiisod.com/en-au/promotions/<id>).
 */
export const OFFERS: Offer[] = [
  {
    id: 'limited-time-free-weeks-offer',
    title: 'Limited Time Free Weeks Offer',
    text: 'Receive 2 weeks free rent for a 52-week lease, 1 week free rent for a 48-week/44-week/24-week lease',
    image: freeWeeks,
    tag: 'exclusive',
    sections: [
      {
        title: 'The Details',
        blocks: [
          ul(
            'Receive 2 weeks free rent for a 52-week lease, 1 week free rent for a 48-week/44-week/24-week lease',
            'Free weeks are applied at the end of the lease term',
          ),
        ],
      },
      {
        title: 'How to Get Started',
        blocks: [
          ol(
            {
              text: '**Book Your Room**',
              points: [
                'Visit our website and explore your options',
                'Select your ideal room',
                'Fill in your details, selecting a 24-, 44-, 48- or 52-week lease',
              ],
            },
            {
              text: '**Complete Your Booking**',
              points: [
                'Submit your booking',
                'The EPIISOD team will reach out to you to confirm your booking',
                'Pay a one-week holding deposit to secure your spot',
              ],
            },
            '**You’re set to begin a new chapter at EPIISOD!**',
          ),
        ],
      },
      {
        title: 'Terms & Conditions',
        blocks: [
          ul(
            'Booking must be made as a single reservation and cannot be split into multiple bookings.',
            'This offer is valid until 23:59hr 31st October 2026 (Sydney time), and is subject to room availability.',
            'This offer applies to contracts that start between 1 December 2026 and 28 February 2027. For contracts that start on or before 30 November 2026, please contact empsydney@empiisod.com for more free-week promotion details.',
            'EPIISOD reserves the right to cancel or amend this promotion at any time without prior notice.',
            'In the event of a lease transfer or cancellation, all promotional incentives will be voided.',
            'This promotion cannot be applied retrospectively to existing bookings.',
            'This offer is not applicable to the $699/week rate for the Signature Studio (Urban).',
            'This promotional offer is only available to Tenants who pay rent via an Approved Payment Method (direct debit or bank transfer from an Australian bank account) and maintain that payment method throughout their tenancy from the second month onwards.',
          ),
        ],
      },
    ],
  },
  {
    id: 'save-40week-your-commute',
    title: 'Save Up to $40/week on Your Commute',
    text: 'At EPIISOD, we’re committed to making your student life easier and more accessible. Students who commute to their university by public transport can receive up to $40 per week in transport allowance — helping you reduce travel costs and focus on what matters most.',
    image: commute,
    tag: 'direct-debit',
    sections: [
      {
        title: 'Transport Allowance for Students',
        blocks: [
          p('At EPIISOD, we’re committed to making your student life easier and more accessible.'),
          p(
            'Students who commute to their university by public transport can receive up to $40 per week in transport allowance — helping you reduce travel costs and focus on what matters most.',
          ),
        ],
      },
      {
        title: 'Allowance Details',
        blocks: [
          ul(
            {
              text: '**$20 per week**',
              body: ['For students commuting 10–15 km from EPIISOD to their institution via public transport.'],
            },
            {
              text: '**$40 per week**',
              body: ['For students commuting more than 15 km from EPIISOD to their institution via public transport.'],
            },
          ),
        ],
      },
      {
        title: 'Terms & Conditions',
        blocks: [
          ul(
            'Eligibility is assessed at EPIISOD’s discretion, and final approval rests with EPIISOD.',
            'Allowances are provided as account credits, processed on a fortnightly basis throughout the lease term.',
            'Transportation allowance will not be applied to rent free period.',
            'This exclusive offer applies only to 48- or 52-week lease.',
            'This exclusive offer only applies to move-in before 31 March 2027.',
            'This offer is valid until 23:59hr 31st October 2026 (Sydney time), and subject to availability.',
            'EPIISOD may amend or cancel the promotion at any time without prior notice.',
            'In the event of a lease transfer or cancellation, all promotional incentives — including transport allowances — will be voided.',
            'This promotion cannot be applied retrospectively to existing bookings.',
            'The Transportation Allowance Promotion is not available in conjunction with the 6 Weeks Free Promotion for Signature Studio (City and Pool).',
            'Rebookers whose lease starts on or before 28 February will enjoy $25 per week for commuting 10-15km to their institution and $50 per week for commuting over 15km to their institution.',
            'This promotional offer is only available to Tenants who pay rent via an Approved Payment Method (direct debit or bank transfer from an Australian bank account) and maintain that payment method throughout their tenancy from the second month onwards.',
          ),
        ],
      },
    ],
  },
  {
    id: 'flexible-short-stay-4-weeks-fit-your-needs',
    title: 'Flexible Short Stay from 4 Weeks To Fit Your Needs',
    text: 'Short stay options from just 4 weeks are applicable to room types: Signature Studio and Aspect Studio, starting from $699/week!',
    image: girlWithPhone,
    tag: 'exclusive',
    intro: [
      p(
        'Need a place for less than the usual long-term lease? EPIISOD now offers **Short Stay options from just 4 weeks**. Perfect for exchange students, semester stays, internships, project placements, or anyone who wants premium student living with more flexibility.',
      ),
      p(
        'Stay in a newly launched residence at Macquarie Park and enjoy stylish spaces, brand-new amenities, and a location just moments from **Macquarie University**, **Macquarie Centre**, and nearby train stations.',
      ),
    ],
    sections: [
      {
        title: 'Why Choose EPIISOD Short Stay?',
        blocks: [
          ul(
            'Minimum stay from **4 weeks**',
            '**Flexible options to suit your plans**',
            'Fully furnished premium studios',
            'Brand-new facilities and shared spaces',
            'Prime Macquarie Park location',
          ),
        ],
      },
      {
        title: 'Short Stay Offers',
        blocks: [
          ol(
            {
              text: '**Signature Studio (All Views)**',
              body: ['Select from Garden / Urban / Pool / City View', '**From $699/week**', 'Minimum 4-week lease'],
              points: ['Contract start date: From now until **5 January 2027**', 'Latest contract end date: **1 February 2027**'],
            },
            {
              text: '**Aspect Studio (All Views)**',
              body: ['Select from Garden / Urban / Pool / City View', '**From $826/week**', 'Minimum 4-week lease'],
              points: ['Contract start date: From now until **5 January 2027**', 'Latest contract end date: **1 February 2027**'],
            },
          ),
        ],
      },
      {
        title: 'Live More, Commit Less',
        blocks: [
          p(
            'Whether you’re staying for one semester or need a shorter lease that fits your schedule, EPIISOD gives you the freedom to stay your way.',
          ),
        ],
      },
      {
        title: 'The Details',
        blocks: [
          ul(
            'Short Stay lease terms from just 4 weeks',
            'Flexible contract dates are applicable to room types: Signature Studio and Aspect Studio',
          ),
        ],
      },
      {
        title: 'Terms & Conditions',
        blocks: [
          ul(
            'Booking must be made as a single reservation and cannot be split into multiple bookings.',
            'EPIISOD reserves the right to cancel or amend this promotion at any time without prior notice.',
            'In the event of a lease transfer or cancellation, all promotional incentives will be voided.',
            'This promotion cannot be applied retrospectively to existing bookings.',
          ),
        ],
      },
    ],
  },
  {
    id: 'refer-friend-double-joy-600-rewards',
    title: 'Refer a Friend - Double the Joy, $600 in Rewards!',
    text: 'Refer a friend to EPIISOD and you’ll both receive a $300 rent credit once they move in. It’s our way of saying thanks for growing our community!',
    image: bedroom,
    tag: 'direct-debit',
    intro: [
      p(
        'At EPIISOD, we believe the best neighbors are the ones you choose yourself. When you refer a friend to join our community, we want to say thank you with a bonus that benefits both of you.',
      ),
    ],
    sections: [
      {
        title: 'The Reward',
        blocks: [
          p(
            'When your friend signs a lease with us, we’ll apply a **$300 rent credit** to both your account and theirs. That’s a total value of **$600** back into your pockets!',
          ),
          ul(
            '**Total Value:** $600 ($300 each)',
            '**Convenience:** Applied directly to your resident accounts',
            '**Transparent:** All credits are inclusive of GST',
          ),
        ],
      },
      {
        title: 'How it Works',
        blocks: [
          p('To ensure you both receive your credit, please follow these simple steps:'),
          ol(
            '**Fill up and Submit the Form:** Download and complete the **[referral form](https://drive.google.com/file/d/110H8ejOM2cgehFJZ5ylJo-9HaMT9jsRU/view?usp=sharing)** on this page. Or Swing by the reception to pick up a copy. Fill it out with your details and your friend’s, and hand it back to us or email us at empsydney@epiisod.com **before** they complete their booking.',
            '**Secure the Stay:** Help your friend book a 48-week or 52-week lease. It’s quick, easy, and just a few clicks away.',
            {
              text: '**The New Resident Checklist:** The referral reward is confirmed once your friend:',
              points: [
                'Signs a Residential Agreement for a minimum of **48 weeks**.',
                'Pays the required **bond** (4 weeks’ fees).',
                'Pays the **holding deposit** (1 week’s fees).',
              ],
            },
          ),
        ],
      },
      {
        title: 'What Happens Next?',
        blocks: [
          p(
            'Once your friend officially moves in, we’ll apply a $300 credit to both of your accounts. No fine print, just real benefits. Sit back, relax, and enjoy your credit!',
          ),
        ],
      },
      {
        title: 'The Essentials',
        blocks: [
          ul(
            '**Who is eligible?** All current residents who refer a new face to our community.',
            '**What’s the catch?** Just ensure they sign for a full academic year (48 or 52 weeks) and haven’t lived with us before.',
            '**The Bonus:** Your credits are applied directly to your rent—non-transferable and non-refundable, but 100% helpful for your budget!',
          ),
        ],
      },
      {
        title: 'Terms & Conditions',
        blocks: [
          p(
            'The referred friend must be a first-time EPIISOD resident. Both parties must sign a 48 or 52-week Residential Agreement. Credits are not redeemable for cash. This program cannot be combined with agent referrals. EPIISOD Macquarie reserves the right to modify or terminate this promotion at any time.',
          ),
          p(
            'The referral credit will be issued during the third month of the referee’s lease and applied to both the referrer’s and referee’s accounts. If the referrer has already moved out, the credit may be issued via bank transfer to their designated account.',
          ),
        ],
      },
    ],
  },
  {
    id: 'pay-full-save-500',
    title: 'Pay in Full, Save $500',
    text: 'Secure your room for a 48-week or 52-week lease and enjoy a $500 rebate when you pay your rent in full. It’s our way of helping you start the year feeling confident, prepared, and fully settled.',
    image: payInFull,
    tag: 'exclusive',
    sections: [
      {
        title: 'Pay-in-Full Rent Rebate',
        blocks: [
          p(
            'Secure your room for a 48-week or 52-week lease and enjoy a **$500 rebate** when you pay your rent in full. It’s our way of helping you start the year feeling confident, prepared, and fully settled.',
          ),
          p('This offer is available for a limited time only and subject to room availability.'),
        ],
      },
      {
        title: 'The Details',
        blocks: [ul('$500 rebate for paying in full for a 48-week or 52-week lease.')],
      },
      {
        title: 'Terms & Conditions',
        blocks: [
          ul(
            'Rent rebate is applied to the tenant’s account and is not transferable, refundable, or redeemable for cash.',
            'Booking must be made as a single reservation and cannot be split into multiple bookings.',
            'Offer is valid for a limited time only and is subject to room availability.',
            'EPIISOD reserves the right to cancel or amend this promotion at any time without prior notice.',
            'In the event of a lease transfer or cancellation, all promotional incentives will be voided.',
            'This promotion cannot be applied retrospectively to existing bookings.',
          ),
        ],
      },
    ],
  },
];
