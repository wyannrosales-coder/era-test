import Nav from '../components/Nav';
import PageHero from '../components/PageHero';
import PromotionsOffers from '../components/promotions/PromotionsOffers';
import PromotionsVip from '../components/promotions/PromotionsVip';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import heroLeft from '../assets/promotions/pay-in-full.jpg';
import heroRight from '../assets/promotions/bedroom.jpg';
import '../components/about/AboutStory.css';

/**
 * Promotions (Figma 786:9864), reached from the property page's "View Promotions".
 * The cream nav, the page hero, every offer, the VIP invitation, then the closing fold
 * into the footer.
 */
export default function PromotionsPage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <PageHero
          eyebrow="Promo"
          title={
            <>
              Book early, stay smart, <em>save more</em>!
            </>
          }
          photos={{ left: heroLeft, right: heroRight }}
          phonePhoto="right"
          action={
            <a href="/locations/macquarie-park#rooms" className="about-button">
              Book a room
            </a>
          }
        >
          <p>
            Make the most of your student life with EPIISOD’s exclusive deals. From early-bird
            savings to seasonal promotions and extended stay bonuses, we’ve curated the best offers
            to help you settle in comfortably—and affordably.
          </p>
          <p>
            Don’t miss out on these limited-time deals designed to give you more value for your
            stay. Your new chapter at EPIISOD starts here—with smart choices and even smarter
            savings.
          </p>
        </PageHero>
        <PromotionsOffers />
        <PromotionsVip />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
