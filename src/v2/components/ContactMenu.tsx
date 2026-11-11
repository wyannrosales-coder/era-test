import { MegaMenuPanel } from './MegaMenu';
import image from '../../assets/v2/mega-contact.jpg';
import './MenuPanels.css';

type ContactMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
};

const COLUMNS = [
  [
    { title: 'Contact Us', text: 'Reach out to our team — we’re here to help.', href: '/v2/contact' },
    { title: 'FAQs', text: 'Everything you need to know before you move in.', href: '/v2/faqs' },
  ],
  [
    {
      title: 'Join the Waitlist',
      text: 'Don’t miss your next chapter — sign up to get notified when rooms open.',
      href: '/v2/join-the-waitlist',
    },
  ],
];

/** Contact mega menu (Figma 1441:14930): photo beside the contact pages, which highlight
 *  on hover (Figma 1441:14943). */
export default function ContactMenu({ id, open, onNavigate }: ContactMenuProps) {
  return (
    <MegaMenuPanel id={id} open={open} heading="Contact us">
      <div className="menu2">
        <div className="menu2__image menu2__image--contact">
          <img src={image} alt="" />
        </div>
        <div className="menu2__cols menu2__cols--top">
          {COLUMNS.map((col, i) => (
            <div key={i} className="menu2__col">
              {col.map((item) => (
                <a key={item.title} href={item.href} className="menu2__item" onClick={onNavigate}>
                  <span className="menu2__item-title">{item.title}</span>
                  <span className="menu2__item-text">{item.text}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </MegaMenuPanel>
  );
}
