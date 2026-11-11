import { useId, useRef, useState } from 'react';
import VLine from '../VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import line from '../../assets/cta-line.svg';
import caretDown from '../../assets/property/caret-down-grey.svg';
import photoLeft from '../../assets/partners-left.jpg';
import photoRight from '../../assets/partners-right.jpg';
import type { PropertyContent } from './propertyContent';
import './Faqs.css';

/**
 * FAQs (Figma 539:13719): an accordion, one answer open at a time.
 * Same parallax as the homepage's partners: each photo drifts at its own --speed,
 * sitting exactly where Figma places it when the section's top meets the screen's.
 */
export default function Faqs({ id, content }: { id: string; content: PropertyContent }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const speed = parseFloat(getComputedStyle(el).getPropertyValue('--speed')) || 0;
          gsap.fromTo(
            el,
            { y: () => speed * window.innerHeight },
            {
              y: () => -speed * section.offsetHeight,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="faqs" id={id}>
      <img className="faqs__photo faqs__photo--left" src={photoLeft} alt="" data-parallax />
      <img className="faqs__photo faqs__photo--right" src={photoRight} alt="" data-parallax />

      <div className="faqs__heading heading-group">
        <p className="eyebrow">Frequently asked questions</p>
        <h2 className="display-title">
          FAQs about {content.brand}
          <br />
          <em>{content.place}</em>
        </h2>
      </div>
      <p className="type-body-l faqs__lede">General things you need to know before you move in.</p>

      <VLine src={line} length={100} />

      <div className="faqs__list">
        {content.faqs.map(({ question, answer }, i) => {
          const isOpen = open === i;
          const panelId = `${baseId}-${i}`;
          return (
            <div key={question} className={`faqs__item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="faqs__question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{question}</span>
                <img src={caretDown} width={24} height={24} alt="" />
              </button>
              <div id={panelId} className="type-body-m faqs__answer" role="region">
                <div className="faqs__answer-clip">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <a href="/faqs" className="faqs__cta">
        Visit FAQ page
      </a>
    </section>
  );
}
