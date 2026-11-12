import Nav from '../components/Nav';
import PageHero from '../components/PageHero';
import { LOGOS, LogoSlot } from '../components/Partners';
import ExperienceMosaic from '../components/experience/ExperienceMosaic';
import ExperienceEnter from '../components/experience/ExperienceEnter';
import ExperienceCafe from '../components/experience/ExperienceCafe';
import InstagramStrip from '../components/contact/InstagramStrip';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import { EXPERIENCE_URL } from '../lib/links';
import heroLeft from '../assets/experience/hero-left.jpg';
import heroRight from '../assets/experience/hero-right.jpg';
import '../components/about/AboutStory.css';
import '../components/experience/ExperienceHero.css';

/**
 * Experience (Figma 1015:5495), reached from Life @ EPIISOD in the nav and the footer.
 * The page hero with the partner logos, a wall of EPIISOD spaces that opens into the
 * Exclusives, the café, the Instagram band, then the closing fold into the footer.
 */
export default function ExperiencePage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <PageHero
          className="experience-hero"
          eyebrow="Experience"
          title={
            <>
              Student experience brought to <em>life</em>
            </>
          }
          photos={{ left: heroLeft, right: heroRight }}
          action={
            <a href={EXPERIENCE_URL} className="about-button">
              Enter the experience
            </a>
          }
          after={
            <div className="experience-hero__logos">
              {LOGOS.map((logo, i) => (
                <LogoSlot key={i} logo={logo} />
              ))}
            </div>
          }
        />
        <ExperienceMosaic id="spaces" />
        <ExperienceEnter id="enter" />
        <ExperienceCafe />
        <InstagramStrip />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
