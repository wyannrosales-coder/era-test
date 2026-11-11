import Nav from '../components/Nav';
import ComingSoonHero from '../components/property/ComingSoonHero';
import StayConnected from '../components/StayConnected';
import Footer from '../components/Footer';
import type { Property } from '../components/locationData';

/**
 * Page for a property that hasn't opened yet (Figma 539:23200): hero, sign-up, footer.
 * The nav behaves as on the homepage; each section hands over to the next with parallax.
 */
export default function ComingSoonPage({ property }: { property: Property }) {
  return (
    <>
      <Nav />
      <main>
        <ComingSoonHero property={property} />
        <StayConnected exitParallax />
      </main>
      <Footer />
    </>
  );
}
