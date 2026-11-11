import Nav from '../components/Nav';
import WhyHero from '../../components/why/WhyHero';
import WhyExperience from '../../components/why/WhyExperience';
import WhyReviews from '../../components/why/WhyReviews';
import WhyLiving from '../../components/why/WhyLiving';
import AboutClosing from '../../components/about/AboutClosing';
import Footer from '../components/Footer';

/**
 * v2: v1's page as it is, under v2's navigation and above v2's footer.
 */
/**
 * Why EPIISOD (Figma 889:10276), reached from Life @ EPIISOD in the nav and the footer.
 * The intro with its carousel, the experience cards, residents' reviews, the "Write your
 * story" band, then the closing fold into the footer.
 */
export default function WhyPage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <WhyHero />
        <WhyExperience id="experience" />
        <WhyReviews />
        <WhyLiving bookHref="/v2/locations/macquarie-park#rooms" />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
