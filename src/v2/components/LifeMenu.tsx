import { MegaMenuPanel } from './MegaMenu';
import image from '../../assets/v2/mega-life.jpg';
import './MenuPanels.css';

type LifeMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
};

type Item = { title: string; text: string; href: string };

/** Figma 1441:14254, two columns. Pages not built yet link to '#'. */
const COLUMNS: Item[][] = [
  [
    { title: 'Why EPIISOD', text: 'Where your story finds its place', href: '/v2/why-epiisod' },
    { title: 'Experience', text: 'The EPIISOD Experience that goes beyond accommodation', href: '/v2/experience' },
    { title: 'Blogs', text: 'Guides and stories for student life', href: '/blog' },
    { title: 'Promotions', text: 'EPIISOD’s exclusive deals', href: '/v2/promotions' },
  ],
  [
    { title: 'Moving In', text: 'Move-in guide: Everything you need to know', href: '#' },
    {
      title: 'Scholarships',
      text: 'EPIISOD is dedicated to making elevated student living more accessible.',
      href: '#',
    },
    {
      title: 'For International Students',
      text: 'Safe, Secure, and Convenient Student Accommodation',
      href: '/blog/for-international-students',
    },
    { title: 'For Parents', text: 'Choosing the right place for your child', href: '/blog/for-parents' },
  ],
];

/** Life @ EPIISOD mega menu (Figma 1441:14223): photo beside two columns of page links. */
export default function LifeMenu({ id, open, onNavigate }: LifeMenuProps) {
  return (
    <MegaMenuPanel id={id} open={open} heading="Life @ EPIISOD">
      <div className="menu2">
        <img className="menu2__image menu2__image--life" src={image} alt="" />
        <div className="menu2__cols">
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
