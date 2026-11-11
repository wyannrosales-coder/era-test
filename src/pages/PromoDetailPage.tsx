import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Nav from '../components/Nav';
import PromoCard from '../components/promotions/PromoCard';
import { usePromoCarousel } from '../components/promotions/usePromoCarousel';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import { scrollToY } from '../lib/smoothScroll';
import { OFFERS } from '../components/promotions/promotionsData';
import type { Offer, OfferBlock, OfferPoint, RichText } from '../components/promotions/promotionsData';
import '../components/blog/Blog.css';
import '../components/about/AboutStory.css';
import './PromoDetailPage.css';

const BOOK_HREF = '/locations/macquarie-park#rooms';

/** `**bold**`, `[label](url)` links and email addresses (as mail links) in an offer's text. */
function Rich({ text }: { text: RichText }) {
  const parts = text.split(/(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\)|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        if (part.startsWith('**')) {
          return (
            <strong key={i}>
              <Rich text={part.slice(2, -2)} />
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">
              {link[1]}
            </a>
          );
        }
        return (
          <a key={i} href={`mailto:${part}`}>
            {part}
          </a>
        );
      })}
    </>
  );
}

function Point({ point }: { point: OfferPoint }) {
  if (typeof point === 'string') return <Rich text={point} />;
  return (
    <>
      <Rich text={point.text} />
      {point.body?.map((line) => (
        <p key={line}>
          <Rich text={line} />
        </p>
      ))}
      {point.points && (
        <ul>
          {point.points.map((sub) => (
            <li key={sub}>
              <Rich text={sub} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Paragraphs and lists, 24 apart. */
function Blocks({ blocks }: { blocks: OfferBlock[] }) {
  return (
    <div className="type-body-l promo-detail__blocks">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i}>
              <Rich text={block.text} />
            </p>
          );
        }
        const List = block.type;
        return (
          <List key={i} className="promo-detail__list">
            {block.points.map((point) => (
              <li key={typeof point === 'string' ? point : point.text}>
                <Point point={point} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/**
 * An offer's own page (Figma 1346:17579), from a Learn more on the Promotions page or a
 * promo card: breadcrumbs, the offer — photo, title, any opening paragraphs and its
 * sections — beside a sticky panel listing those sections with Book a room, then the
 * other offers in the same carousel as the property page. Laid out like a blog post,
 * whose styles it shares; on phones the panel gives way to a Book a room button below.
 */
export default function PromoDetailPage({ offer }: { offer: Offer }) {
  const [current, setCurrent] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const othersRef = useRef<HTMLElement>(null);
  const { trackRef, thumbRef, viewportProps, scrubberProps } = usePromoCarousel(othersRef);
  const others = OFFERS.filter((o) => o.id !== offer.id);
  const sections = offer.sections.map((s) => s.title);

  // The section in view: the last whose heading has passed a third of the way down
  useEffect(() => {
    const update = () => {
      const heads = articleRef.current?.querySelectorAll<HTMLElement>('.blog-post__section-title');
      if (!heads) return;
      let i = 0;
      heads.forEach((h, n) => {
        if (h.getBoundingClientRect().top <= window.innerHeight / 3) i = n;
      });
      setCurrent(i);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const goTo = (i: number) => {
    const el = document.getElementById(`section-${i + 1}`);
    if (!el) return;
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 88;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - offset - 32);
  };

  return (
    <>
      <Nav tone="cream" />
      <main>
        <section className="blog-post promo-detail">
          <nav className="blog-post__crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden>/</span>
            <a href="/promotions">Promotions</a>
            <span aria-hidden>/</span>
            <span aria-current="page">Promo details</span>
          </nav>

          <div className="blog-post__main">
            <article ref={articleRef} className="blog-post__article">
              <img className="blog-post__image" src={offer.image} alt="" />
              <h1 className="type-h3 promo-detail__title">{offer.title}</h1>

              {offer.intro && <Blocks blocks={offer.intro} />}

              {offer.sections.map((section, i) => (
                <div key={section.title} className="blog-post__section" id={`section-${i + 1}`}>
                  <h2 className="blog-post__section-title">{section.title}</h2>
                  <Blocks blocks={section.blocks} />
                </div>
              ))}

              <a href={BOOK_HREF} className="about-button promo-detail__book">
                Book a room
              </a>
            </article>

            <aside className="blog-post__aside">
              <div className="blog-post__panel">
                <p className="eyebrow blog-post__label">Promotion</p>
                <div className="blog-post__contents">
                  <span
                    className="blog-post__contents-bar"
                    aria-hidden
                    style={{ '--i': current, '--n': sections.length } as CSSProperties}
                  />
                  <ul>
                    {sections.map((title, i) => (
                      <li key={title}>
                        <button
                          type="button"
                          className={i === current ? 'is-current' : ''}
                          aria-current={i === current ? 'location' : undefined}
                          onClick={() => goTo(i)}
                        >
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <a href={BOOK_HREF} className="about-button promo-detail__aside-book">
                Book a room
              </a>
            </aside>
          </div>
        </section>

        <section ref={othersRef} className="promo-detail__others">
          <h2 className="type-h3">
            Other <em>promotions</em>
          </h2>
          <div className="promo-detail__row">
            <div {...viewportProps} role="region" aria-label="Other promotions">
              <div ref={trackRef} className="promotions__track">
                {others.map((o) => (
                  <PromoCard key={o.id} promo={o} />
                ))}
              </div>
            </div>
          </div>
          <div {...scrubberProps} aria-label="Other promotions position">
            <div className="promotions__progress">
              <div ref={thumbRef} className="promotions__progress-bar" />
            </div>
          </div>
        </section>
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
