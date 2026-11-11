import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ContactForm from '../../components/contact/ContactForm';
import InstagramStrip from '../../components/contact/InstagramStrip';
import AboutClosing from '../../components/about/AboutClosing';

/**
 * Join the waitlist (v1's Figma 1109:37808), version 2: v1's content as it is — the form, the Instagram band and the closing
 * fold — under v2's navigation (the cream bar, as on the room pages) and above v2's footer.
 */
export default function WaitlistPage() {
  return (
    <>
      <Nav tone="cream" />
      <main>
        <ContactForm variant="waitlist" />
        <InstagramStrip />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
