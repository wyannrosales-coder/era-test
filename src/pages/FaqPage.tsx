import { useId, useRef, useState } from 'react';
import Nav from '../components/Nav';
import WhyLiving from '../components/why/WhyLiving';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import { scrollToY } from '../lib/smoothScroll';
import { FAQ_TOPICS } from '../components/faq/faqContent';
import caretDown from '../assets/property/caret-down-grey.svg';
import dropdownIcon from '../assets/blog/section-dropdown.svg';
import '../components/property/Faqs.css';
import './FaqPage.css';

/** Height of the nav's compact bar (Nav.tsx), which returns as the page scrolls up. */
const COMPACT_BAR_HEIGHT = 69;

/**
 * FAQs (Figma 1227:11041), reached from Contact in the nav, the menu and the footer: the
 * topics in a card that stays pinned beside their questions, one answer open at a time;
 * then the "Write your story" band, the closing fold and the footer. Phones (Figma
 * 1417:8541) choose the topic from a dropdown that stays pinned under the nav (1417:8978).
 */
export default function FaqPage() {
  const [topicId, setTopicId] = useState(FAQ_TOPICS[0].id);
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const topic = FAQ_TOPICS.find((t) => t.id === topicId)!;

  const choose = (id: string, tab?: HTMLElement) => {
    if (id === topicId) return;
    setTopicId(id);
    setOpen(null);
    // Tablets: the chosen topic glides to the middle of its sideways-scrolling row
    const row = tab?.parentElement;
    if (row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
    // Scrolled down a long list: bring the new topic's first question back into view. Going
    // up brings the nav's bar back, so leave room for it.
    const top = bodyRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < COMPACT_BAR_HEIGHT) scrollToY(top + window.scrollY - COMPACT_BAR_HEIGHT - 40);
  };

  return (
    <>
      <Nav tone="cream" />
      <main>
        <section className="faq-page">
          <h1 className="type-h1 faq-page__title">
            Frequently <em>asked</em> questions
          </h1>

          <div ref={bodyRef} className="faq-page__body">
            <div className="faq-page__topics" role="tablist" aria-label="Topics" data-lenis-prevent>
              {FAQ_TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${t.id}`}
                  aria-selected={t.id === topicId}
                  aria-controls={`${baseId}-panel`}
                  className={`faq-page__topic${t.id === topicId ? ' is-active' : ''}`}
                  onClick={(e) => choose(t.id, e.currentTarget)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="faq-page__picker">
              <label className="faq-page__jump">
                <span className="visually-hidden">Topic</span>
                <select value={topicId} onChange={(e) => choose(e.target.value)}>
                  {FAQ_TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <img src={dropdownIcon} width={24} height={24} alt="" />
              </label>
            </div>

            <div
              key={topic.id}
              id={`${baseId}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${topic.id}`}
              className="faqs__list faq-page__list"
            >
              {topic.questions.map(({ question, answer }, i) => {
                const isOpen = open === i;
                const panelId = `${baseId}-${topic.id}-${i}`;
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
                        {/* Our own copy from the live site (faqContent.ts), not user input */}
                        <div className="faq-page__answer" dangerouslySetInnerHTML={{ __html: answer }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <WhyLiving />
        <AboutClosing />
      </main>
      <Footer />
    </>
  );
}
