import { MegaMenuPanel } from './MegaMenu';
import './LifeMenu.css';

type ContactMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
};

/** Pages not built yet link to '#'. */
const LINKS = [
  { title: 'Contact Us', description: 'Get in touch with us, we’re here to help', href: '/contact' },
  { title: 'Join the Waitlist', description: 'Sign up to get notified when rooms open', href: '/join-the-waitlist' },
  { title: 'FAQs', description: 'Everything you need to know before moving in', href: '/faqs' },
];

/**
 * Contact mega menu, navigation option B (Figma 1080:9042): three page links with a short
 * description, highlighting on hover (Figma 692:3822).
 */
export default function ContactMenu({ id, open, onNavigate }: ContactMenuProps) {
  return (
    <MegaMenuPanel id={id} open={open} heading="Contact">
      <div className="nav-menu-b__row nav-menu-b__row--contact">
        {LINKS.map(({ title, description, href }) => (
          <a key={title} href={href} className="nav-menu-b__link" onClick={onNavigate}>
            <span className="life-menu__title">{title}</span>
            <span className="life-menu__description">{description}</span>
          </a>
        ))}
      </div>
    </MegaMenuPanel>
  );
}
