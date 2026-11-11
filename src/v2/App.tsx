import Nav from './components/Nav';
import Hero from './components/Hero';
import Locations from './components/Locations';
import BrandVideo from './components/BrandVideo';
import LifeSection from './components/LifeSection';
import Partners from './components/Partners';
import TokenFold from './components/TokenFold';
import StayConnected from './components/StayConnected';
import Footer from './components/Footer';
import PropertyPage from './pages/PropertyPage';
import RoomPage from './pages/RoomPage';
import ContactPage from './pages/ContactPage';
import WaitlistPage from './pages/WaitlistPage';
import FaqPage from './pages/FaqPage';
import ExperiencePage from './pages/ExperiencePage';
import WhyPage from './pages/WhyPage';
import PromotionsPage from './pages/PromotionsPage';
import PromoDetailPage from './pages/PromoDetailPage';
import { OFFERS } from './components/promotions/promotionsData';
import { MACQUARIE_PARK } from './components/property/propertyContent';
import { BEDFORD } from './components/property/bedfordContent';

/** v2's property pages, by their path under /v2/locations/. */
const PROPERTIES = [MACQUARIE_PARK, BEDFORD];

/** Version 2's pages: the home page (/v2), the property pages and their rooms' pages. */
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/v2/contact') return <ContactPage />;
  if (path === '/v2/join-the-waitlist') return <WaitlistPage />;
  if (path === '/v2/faqs') return <FaqPage />;
  if (path === '/v2/experience') return <ExperiencePage />;
  if (path === '/v2/why-epiisod') return <WhyPage />;
  if (path === '/v2/promotions') return <PromotionsPage />;
  // An offer's page: /v2/promotions/<offer>
  const offer = OFFERS.find((o) => path === `/v2/promotions/${o.id}`);
  if (offer) return <PromoDetailPage key={path} offer={offer} />;
  const match = path.match(/^\/v2\/locations\/([^/]+)(?:\/([^/]+))?$/);
  const content = match && PROPERTIES.find((p) => p.slug === match[1]);
  if (content) {
    const propertyHref = `/v2/locations/${content.slug}`;
    if (!match[2]) return <PropertyPage key={content.slug} content={content} />;
    // A room's page: /v2/locations/<property>/<room>
    const details = content.roomDetails.find((d) => d.slug === match[2]);
    if (details) return <RoomPage key={path} content={content} details={details} propertyHref={propertyHref} />;
  }
  return <HomePage />;
}

/** Home page, version 2. Started as a copy of v1's home page (git tag `v1`). */
function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Locations />
        <BrandVideo />
        <LifeSection />
        <Partners />
        <StayConnected exitParallax fromWhite />
        <TokenFold />
      </main>
      <Footer />
    </>
  );
}
