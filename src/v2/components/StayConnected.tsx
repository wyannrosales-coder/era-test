import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import VLine from './VLine';
import { useExitParallax } from '../lib/useExitParallax';
import ctaLine from '../../assets/cta-line.svg';
import arrowRight from '../../assets/arrow-right-submit.svg';
import arrowRightWhite from '../../assets/arrow-right-white-sm.svg';
import './StayConnected.css';

/**
 * Figma 539:11773 / 539:11875. Fields turn white with a bronze border while focused;
 * once both are filled, SUBMIT becomes a solid bronze button with white type.
 * After submitting, the fields lock and the button gives way to "Thank you." (Figma 539:21195).
 * With `exitParallax`, it drifts as the next section (the footer, or the token fold on
 * the homepage) scrolls over it — undimmed, so the two read as one continuous surface. On phones the footer only arrives once the form has
 * moved well up the screen, so filling it in is never interrupted.
 */
export default function StayConnected({
  id,
  exitParallax = false,
  fromWhite = false,
}: {
  id?: string;
  exitParallax?: boolean;
  /** Fade in from white rather than starting on cream, for when a white section precedes it. */
  fromWhite?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const thanksRef = useRef<HTMLParagraphElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  useExitParallax(sectionRef, { enabled: exitParallax, shade: false, lateOnPhones: true });
  const ready = name.trim() !== '' && email.trim() !== '';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to the newsletter provider.
    setSubmitted(true);
  };

  // The focused button is replaced, so hand focus to the message (and announce it)
  useEffect(() => {
    if (submitted) thanksRef.current?.focus();
  }, [submitted]);

  return (
    <section
      ref={sectionRef}
      className={`stay-connected exit-parallax${fromWhite ? ' stay-connected--from-white' : ''}`}
      id={id}
    >
      <div className="stay-connected__content" data-exit-content>
        <VLine src={ctaLine} length={100} />
        <h2 className="display-title stay-connected__title">
          Stay <em className="medium">connected</em> to the story
        </h2>

        <form className={`stay-connected__form${submitted ? ' is-submitted' : ''}`} onSubmit={onSubmit}>
          <label className="stay-connected__field">
            <span className="visually-hidden">Your name</span>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              required
              readOnly={submitted}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="stay-connected__field">
            <span className="visually-hidden">Email address</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              autoComplete="email"
              required
              readOnly={submitted}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {submitted ? (
            <p ref={thanksRef} className="stay-connected__thanks" role="status" tabIndex={-1}>
              <span>
                Thank <em>you</em>.
              </span>
            </p>
          ) : (
            <button type="submit" className={`stay-connected__submit${ready ? ' is-ready' : ''}`}>
              <span>Submit</span>
              <span className="stay-connected__arrow">
                <img className="stay-connected__arrow-default" src={arrowRight} width={24} height={24} alt="" />
                <img className="stay-connected__arrow-ready" src={arrowRightWhite} width={24} height={24} alt="" />
              </span>
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
