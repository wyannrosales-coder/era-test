import Nav from '../components/Nav';
import ContactForm from '../components/contact/ContactForm';
import InstagramStrip from '../components/contact/InstagramStrip';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';

/**
 * Contact us (Figma 1080:10610). The nav starts as the cream bar used on About us, then
 * behaves as on the homepage once scrolled; each section hands over to the next with
 * parallax, and the closing fold flows into the footer.
 */
export default function ContactPage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <ContactForm />
        <InstagramStrip />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
