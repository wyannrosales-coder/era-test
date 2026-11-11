import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import arrowRight from '../../assets/arrow-right-white.svg';
import '../contact/ContactForm.css';
import './AboutSignup.css';

/**
 * Your next chapter (Figma 735:15275): a short pitch beside an email sign-up, using the
 * Contact page's field and button styles. After submitting, the button gives way to a
 * thank-you as on the Contact page.
 */
export default function AboutSignup() {
  const [submitted, setSubmitted] = useState(false);
  const thanksRef = useRef<HTMLParagraphElement>(null);

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
    <section className="about-signup">
      <div className="about-signup__content">
        <div className="about-signup__copy">
          <h2 className="display-title">
            Your <em>next chapter</em> starts here
          </h2>
          <p className="type-body-l about-signup__lede">
            Whether you’re just exploring, planning ahead, or ready to find your perfect fit, drop
            your email and we’ll keep you updated when bookings for Semester 2, 2026, showflat
            viewings, and exclusive perks go live.
          </p>
        </div>

        <form
          className={`about-signup__form${submitted ? ' is-submitted' : ''}`}
          onSubmit={onSubmit}
        >
          <fieldset className="about-signup__fields" disabled={submitted}>
            <label className="contact-field">
              <span className="type-body-s contact-field__label">Email address</span>
              <span className="contact-field__box">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </span>
            </label>
            <p className="about-signup__consent">
              By submitting this form, I consent to receive marketing communications from EPIISOD,
              including promotions, updates, event details, newsletters and more. I acknowledge I’ve
              read and agree to the{' '}
              <a href="https://epiisod.com/privacy-policy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </fieldset>

          {submitted ? (
            <p ref={thanksRef} className="contact-form__thanks" role="status" tabIndex={-1}>
              <span>
                Thank <em>you</em>. We’ll be in touch soon.
              </span>
            </p>
          ) : (
            <button type="submit" className="contact-form__submit">
              <span>Submit</span>
              <img src={arrowRight} width={24} height={24} alt="" />
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
