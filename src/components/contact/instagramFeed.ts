import { useEffect, useState } from 'react';
import ig1 from '../../assets/contact/instagram-1.jpg';
import ig2 from '../../assets/contact/instagram-2.jpg';
import ig3 from '../../assets/contact/instagram-3.jpg';
import ig4 from '../../assets/contact/instagram-4.jpg';
import ig5 from '../../assets/contact/instagram-5.jpg';
import ig6 from '../../assets/contact/instagram-6.jpg';

/** A post as the strip shows it; mapped from the Instagram API's media fields. */
export type InstagramPost = {
  id: string;
  /** The photo, or a video's cover image. */
  image: string;
  caption: string;
  /** The post on instagram.com. */
  permalink: string;
  /** ISO date the post was published. */
  timestamp: string;
  likes?: number;
  comments?: number;
};

const PROFILE = 'https://www.instagram.com/';

/**
 * Shown until the live feed is connected (api/instagram.ts): the strip's own photos, with
 * made-up captions and counts in the same shape as real posts. Links go to Instagram.
 */
export const SAMPLE_POSTS: InstagramPost[] = [
  {
    id: 'sample-1',
    image: ig1,
    caption: 'Lanterns, mooncakes and good company 🏮 Celebrating the Moon Festival in Sydney with our residents. #EPIISOD #MoonFestival',
    permalink: PROFILE,
    timestamp: '2026-10-12T09:00:00+0000',
    likes: 214,
    comments: 18,
  },
  {
    id: 'sample-2',
    image: ig2,
    caption: 'A new chapter is about to begin ✨ Something new is coming to the city. Stay tuned. #EPIISOD #comingsoon',
    permalink: PROFILE,
    timestamp: '2026-10-05T09:00:00+0000',
    likes: 167,
    comments: 9,
  },
  {
    id: 'sample-3',
    image: ig3,
    caption: 'Exclusive resident discounts & offers, available only to EPIISOD residents. Ask our team what’s on this month. #EPIISODperks',
    permalink: PROFILE,
    timestamp: '2026-09-28T09:00:00+0000',
    likes: 302,
    comments: 24,
  },
  {
    id: 'sample-4',
    image: ig4,
    caption: 'Slow mornings in the studio. Your space, your pace. #EPIISOD #studentliving',
    permalink: PROFILE,
    timestamp: '2026-09-20T09:00:00+0000',
    likes: 189,
    comments: 11,
  },
  {
    id: 'sample-5',
    image: ig5,
    caption: 'My beach picnic in Manly 🌊 Sunshine, snacks and the best views, a short trip from home. #EPIISODlife',
    permalink: PROFILE,
    timestamp: '2026-09-14T09:00:00+0000',
    likes: 256,
    comments: 31,
  },
  {
    id: 'sample-6',
    image: ig6,
    caption: 'Evenings in the lounge: study, unwind or catch up with friends, all under one roof. #EPIISODcommunity',
    permalink: PROFILE,
    timestamp: '2026-09-07T09:00:00+0000',
    likes: 141,
    comments: 6,
  },
];

/** The fields api/instagram.ts returns for each post (Instagram API media fields). */
type ApiPost = {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

const fromApi = (p: ApiPost): InstagramPost | null => {
  const image = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
  if (!image) return null;
  return {
    id: p.id,
    image,
    caption: p.caption ?? '',
    permalink: p.permalink,
    timestamp: p.timestamp,
    likes: p.like_count,
    comments: p.comments_count,
  };
};

/**
 * The latest posts from api/instagram.ts. Until that function has an access token (or
 * when running locally, where it doesn't exist) the sample posts stay up.
 */
export function useInstagramFeed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/instagram', { signal: controller.signal })
      .then((res) => (res.ok && res.headers.get('content-type')?.includes('json') ? res.json() : null))
      .then((body: { data?: ApiPost[] } | null) => {
        const live = (body?.data ?? []).map(fromApi).filter((p): p is InstagramPost => !!p);
        if (live.length) setPosts(live);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return posts;
}
