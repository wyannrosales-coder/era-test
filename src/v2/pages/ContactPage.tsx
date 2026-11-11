import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ContactForm from '../../components/contact/ContactForm';
import InstagramStrip from '../../components/contact/InstagramStrip';
import AboutClosing from '../../components/about/AboutClosing';

/**
 * Contact us (v1's Figma 1080:10610), version 2: v1's content as it is — the form, the Instagram band and the closing
 * fold — under v2's navigation (the cream bar, as on the room pages) and above v2's footer.
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
