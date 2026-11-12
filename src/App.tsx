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
import ComingSoonPage from './pages/ComingSoonPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PromotionsPage from './pages/PromotionsPage';
import PromoDetailPage from './pages/PromoDetailPage';
import { OFFERS } from './components/promotions/promotionsData';
import WhyPage from './pages/WhyPage';
import ExperiencePage from './pages/ExperiencePage';
import WaitlistPage from './pages/WaitlistPage';
import FaqPage from './pages/FaqPage';
import LocationsPage from './pages/LocationsPage';
import RoomPage from './pages/RoomPage';
import FindRoomPage from './pages/FindRoomPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import { AUDIENCES, POSTS } from './components/blog/blogData';
import { PROPERTIES } from './components/locationData';
import { MACQUARIE_PARK, type PropertyContent } from './components/property/propertyContent';

/** Page content for each property that has its own page, keyed by property id. */
const PROPERTY_PAGES: Record<string, PropertyContent> = {
  'macquarie-park': MACQUARIE_PARK,
};

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

/**
 * Pages are picked by URL path: a property's full page when it has content, its
 * coming-soon page when it hasn't opened yet; anything unknown falls back to the homepage.
 */
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/contact') return <ContactPage />;
  if (path === '/about') return <AboutPage />;
  if (path === '/promotions') return <PromotionsPage />;
  // An offer's page: /promotions/<offer>
  const offer = OFFERS.find((o) => path === `/promotions/${o.id}`);
  if (offer) return <PromoDetailPage key={path} offer={offer} />;
  if (path === '/why-epiisod') return <WhyPage />;
  if (path === '/experience') return <ExperiencePage />;
  if (path === '/join-the-waitlist') return <WaitlistPage />;
  if (path === '/locations') return <LocationsPage />;
  if (path === '/faqs') return <FaqPage />;
  if (path === '/find-a-room') return <FindRoomPage />;
  // Blogs: /blog/<audience> lists a blog; /blog/<audience>/<post> is a post
  const blog = path.match(/^\/blog(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (blog) {
    const audience = AUDIENCES.find((a) => a.id === blog[1]) ?? AUDIENCES[0];
    const post = blog[2] && POSTS.find((p) => p.audience === audience.id && p.slug === blog[2]);
    return post ? <BlogPostPage key={path} post={post} audience={audience} /> : <BlogListPage key={path} audience={audience} />;
  }
  // A room's page: /locations/<property>/<room>
  const roomMatch = path.match(/^(\/locations\/[^/]+)\/([^/]+)$/);
  if (roomMatch) {
    const owner = PROPERTIES.find((p) => p.href === roomMatch[1]);
    const ownerContent = owner && PROPERTY_PAGES[owner.id];
    const details = ownerContent?.roomDetails.find((d) => d.slug === roomMatch[2]);
    if (ownerContent && details)
      return <RoomPage key={path} content={ownerContent} details={details} propertyHref={roomMatch[1]} />;
  }
  const property = PROPERTIES.find((p) => p.href === path);
  if (!property) return <HomePage />;
  const content = PROPERTY_PAGES[property.id];
  if (content) return <PropertyPage content={content} />;
  if (property.comingSoon) return <ComingSoonPage property={property} />;
  return <HomePage />;
}
