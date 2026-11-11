import PageHero from '../PageHero';
import photoLeft from '../../assets/about/intro-left.jpg';
import photoRight from '../../assets/about/intro-right.jpg';

/** About us intro (Figma 735:13875) on cream. */
export default function AboutIntro() {
  return (
    <PageHero
      eyebrow="About us"
      title="At EPIISOD"
      photos={{ left: photoLeft, right: photoRight }}
      tone="cream"
    >
      <p>
        Every space, every detail is intentionally crafted - for those who dare to live ambitiously,
        beautifully, and unconventionally.
      </p>
    </PageHero>
  );
}
