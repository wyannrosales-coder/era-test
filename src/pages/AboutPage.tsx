import Nav from '../components/Nav';
import AboutIntro from '../components/about/AboutIntro';
import AboutStory from '../components/about/AboutStory';
import AboutLocation from '../components/about/AboutLocation';
import AboutSignup from '../components/about/AboutSignup';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';

/**
 * About us (Figma 735:13844). The nav starts as a cream bar; each section hands over to
 * the next with parallax, and the closing fold flows into the footer undimmed.
 */
export default function AboutPage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <AboutIntro />
        <AboutStory />
        <AboutLocation />
        <AboutSignup />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
