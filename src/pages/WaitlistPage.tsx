import Nav from '../components/Nav';
import ContactForm from '../components/contact/ContactForm';
import InstagramStrip from '../components/contact/InstagramStrip';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';

/**
 * Join the waitlist (Figma 1109:37808), reached from Contact in the nav and the menu.
 * The Contact us layout with the waitlist form, then the Instagram band and the closing
 * fold into the footer.
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
