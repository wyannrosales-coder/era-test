import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useExitParallax } from '../../lib/useExitParallax';
import caretDown from '../../assets/contact/caret-field.svg';
import flagAu from '../../assets/contact/flag-au.png';
import arrowRight from '../../assets/arrow-right-white.svg';
import { PROPERTIES } from '../locationData';
import './ContactForm.css';
import Select from '../ui/Select';
import DateField from '../ui/DateField';

const PROPERTY_OPTIONS = ['General Inquiry', ...PROPERTIES.map((p) => p.name)];
const ROLES = ['Student', 'Parent / Guardian', 'Agent', 'Other'];
const ROOM_TYPES = ['Studio', 'Shared Apartment', 'No preference'];
const ENQUIRY_TYPES = ['Book a tour', 'Room availability', 'General enquiry', 'Other'];
const DIAL_CODES = [
  { country: 'Australia', code: '+61', flag: flagAu },
  { country: 'United Kingdom', code: '+44', flag: null },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="contact-field">
      <span className="type-body-s contact-field__label">
        {label}
        {required && <span className="contact-form__required">*</span>}
      </span>
      {children}
    </label>
  );
}

type Variant = 'contact' | 'waitlist';

/** The copy beside each form. */
const COPY: Record<Variant, { eyebrow: string; title: ReactNode; lede: ReactNode; submit: string }> = {
  contact: {
    eyebrow: 'Get in touch',
    title: (
      <>
        Every chapter begins with a <em>conversation</em>
      </>
    ),
    lede: (
      <p>
        Whether you have a question or simply want to learn more, we’re here — with thoughtful
        support and a team that responds with clarity, care, and intention.
      </p>
    ),
    submit: 'Submit',
  },
  waitlist: {
    eyebrow: 'Join the waitlist',
    title: (
      <>
        Missed out on your <br />
        <em>preferred room</em>?
      </>
    ),
    lede: (
      <>
        <p>Don’t worry! Join our waitlist to be the first to know when a spot opens up.</p>
        <p>Fill out the form, and we’ll notify you when a matching room becomes available</p>
      </>
    ),
    submit: 'Join the waitlist',
  },
};

/**
 * The copy beside a form card: the enquiry form on Contact us (Figma 1080:10641), or the
 * waitlist form (1109:37840), which asks for first and last name, the preferred room
 * and check-in date, and takes consent as a note rather than checkboxes.
 * The section drifts and dims as the next one slides over it — only once the form has
 * moved well up the screen, so the button stays clear as you reach it.
 */
export default function ContactForm({ variant = 'contact' }: { variant?: Variant }) {
  const copy = COPY[variant];
  const waitlist = variant === 'waitlist';
  const sectionRef = useRef<HTMLElement>(null);
  const thanksRef = useRef<HTMLParagraphElement>(null);
  const [dial, setDial] = useState(DIAL_CODES[0]);
  const [submitted, setSubmitted] = useState(false);
  // Held until the form has moved well up the screen, so Submit isn't dimmed as you reach it
  useExitParallax(sectionRef, { late: true });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: send the enquiry to the CRM.
    setSubmitted(true);
  };

  // The focused button is replaced, so hand focus to the message (and announce it)
  useEffect(() => {
    if (submitted) thanksRef.current?.focus();
  }, [submitted]);

  return (
    <section ref={sectionRef} className="contact exit-parallax">
      <div className="contact__content" data-exit-content>
        <div className="contact__intro">
          <div className="contact__heading">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="type-h1">{copy.title}</h1>
            <div className="type-body-l contact__lede">{copy.lede}</div>
          </div>
        </div>

        <form className={`contact-form${submitted ? ' is-submitted' : ''}`} onSubmit={onSubmit}>
          <fieldset className="contact-form__fields" disabled={submitted}>
            {/* Which property, set apart by a rule (Figma 1109:37624) */}
            <div className="contact-form__property">
              <Field label="Property inquiring for">
                <span className="contact-field__box contact-field__box--strong">
                  <Select name="property" defaultValue={PROPERTY_OPTIONS[0]}>
                    {PROPERTY_OPTIONS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Select>
                  <img src={caretDown} width={24} height={24} alt="" />
                </span>
              </Field>
            </div>

            <p className="type-body-s contact-form__legend">
              <span className="contact-form__required">* </span>
              <em>Required field</em>
            </p>

            {waitlist ? (
              <div className="contact-form__row">
                <Field label="First name" required>
                  <span className="contact-field__box">
                    <input type="text" name="firstName" placeholder="Your first name" autoComplete="given-name" required />
                  </span>
                </Field>
                <Field label="Last name" required>
                  <span className="contact-field__box">
                    <input type="text" name="lastName" placeholder="Your last name" autoComplete="family-name" required />
                  </span>
                </Field>
              </div>
            ) : (
              <Field label="Name" required>
                <span className="contact-field__box">
                  <input type="text" name="name" placeholder="Your name" autoComplete="name" required />
                </span>
              </Field>
            )}

            <div className="contact-form__row">
              <Field label="Contact number" required>
                <span className="contact-field__box contact-field__box--phone">
                  <span className="contact-field__dial">
                    {dial.flag && <img src={dial.flag} width={33} height={22} alt="" />}
                    <img src={caretDown} width={24} height={24} alt="" />
                    <Select
                      bare
                      aria-label="Country calling code"
                      value={dial.code}
                      onChange={(e) => setDial(DIAL_CODES.find((d) => d.code === e.target.value) ?? DIAL_CODES[0])}
                    >
                      {DIAL_CODES.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.country} ({d.code})
                        </option>
                      ))}
                    </Select>
                  </span>
                  <span className="contact-field__code">{dial.code}</span>
                  <input type="tel" name="phone" autoComplete="tel-national" required />
                </span>
              </Field>
              <Field label="Email address" required>
                <span className="contact-field__box">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </span>
              </Field>
            </div>

            {waitlist ? (
              <div className="contact-form__row">
                <Field label="Preferred Room Type" required>
                  <span className="contact-field__box">
                    <Select name="roomType" defaultValue="" required>
                      <option value="" disabled>
                        Select
                      </option>
                      {ROOM_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <img src={caretDown} width={24} height={24} alt="" />
                  </span>
                </Field>
                <Field label="Preferred check in date" required>
                  <span className="contact-field__box">
                    <DateField name="checkIn" placeholder="Check in date" required min={new Date().toISOString().slice(0, 10)} />
                    <img src={caretDown} width={24} height={24} alt="" />
                  </span>
                </Field>
              </div>
            ) : (
              <div className="contact-form__row">
                <Field label="I am a" required>
                  <span className="contact-field__box">
                    <Select name="role" defaultValue={ROLES[0]} required>
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                    <img src={caretDown} width={24} height={24} alt="" />
                  </span>
                </Field>
                <Field label="Enquiry Type" required>
                  <span className="contact-field__box">
                    <Select name="enquiry" defaultValue={ENQUIRY_TYPES[0]} required>
                      {ENQUIRY_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <img src={caretDown} width={24} height={24} alt="" />
                  </span>
                </Field>
              </div>
            )}

            <Field label="Message">
              <span className="contact-field__box contact-field__box--message">
                <textarea
                  name="message"
                  placeholder={waitlist ? 'What’s on your mind?' : 'Anything you want to share...'}
                />
              </span>
            </Field>

            {waitlist ? (
              <p className="type-body-s contact-form__note">
                By submitting the form, I consent to the collection, use and/or disclosure by
                Epiisod Student Living of my personal details above to contact and assist me with
                my queries and/or feedback.
              </p>
            ) : (
              <div className="contact-form__consents">
                <label className="type-body-s contact-check">
                  <input type="checkbox" name="marketing" />
                  <span>
                    Sign me up to receive marketing communications from EPIISOD, including updates,
                    offers, event details, newsletters and more!
                  </span>
                </label>
                <label className="type-body-s contact-check">
                  <input type="checkbox" name="privacy" required />
                  <span>
                    I have read, understood, and agree to the EPIISOD <a href="#">Privacy Policy</a>,
                    and consent to the collection and use of my personal information in accordance
                    with it.<span className="contact-form__required">*</span>
                  </span>
                </label>
              </div>
            )}
          </fieldset>

          {submitted ? (
            <p ref={thanksRef} className="contact-form__thanks" role="status" tabIndex={-1}>
              <span>
                {waitlist ? (
                  <>
                    You’re on the <em>list</em>. We’ll let you know when a room opens up.
                  </>
                ) : (
                  <>
                    Thank <em>you</em>. We’ll be in touch soon.
                  </>
                )}
              </span>
            </p>
          ) : (
            <button type="submit" className="contact-form__submit">
              <span>{copy.submit}</span>
              <img src={arrowRight} width={24} height={24} alt="" />
            </button>
          )}
        </form>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
