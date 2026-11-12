import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Select from '../components/ui/Select';
import {
  clearDraft,
  getDraft,
  getProfile,
  openLogin,
  saveProfile,
  submitApplication,
  useSession,
  type Application,
  type BookingDraft,
  type Profile,
} from '../lib/auth';
import './BookingPage.css';

const STEPS = ['Profile Setup', 'Room Reservation & Preferences', 'Contract & Bond Payment'];
const COUNTRIES = ['Australia', 'China', 'India', 'Indonesia', 'Malaysia', 'Nepal', 'Philippines', 'Singapore', 'Sri Lanka', 'Vietnam', 'United Kingdom', 'Other'];
const LEVELS = ['Foundation / English course', 'Diploma', 'Associate Degree', 'Bachelor’s Degree', 'Master’s Degree', 'Doctorate'];
const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4+', 'Postgraduate'];
const HEARD = ['Roadshows / Events', 'Walk-in', 'Social Media', 'International Student Housing Agent', 'Offline Marketing (posters, flyers, etc.)', 'Our Website', 'Google Advertisement', 'Word of Mouth', 'University', 'Others'];
const EMPTY: Profile = { firstName: '', lastName: '', phone: '', dob: '', nationality: '', gender: '', address: '', city: '', postcode: '', country: '', institution: '', yearOfStudy: '', course: '', level: '' };

const money = (currency: string, n: number) => `${currency}${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
const fmt = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
const addWeeks = (iso: string, weeks: number) => {
  const d = new Date(`${iso}T00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
};

function Field({ label, children, error, wide }: { label: string; children: ReactNode; error?: boolean; wide?: boolean }) {
  return (
    <label className={`book-field${wide ? ' book-field--wide' : ''}${error ? ' has-error' : ''}`}>
      <span className="book-field__label">{label}</span>
      {children}
    </label>
  );
}

/** The room, term and what is payable today, beside every step (after the live site's booking). */
function Summary({ d }: { d: BookingDraft }) {
  const total = d.weekly !== undefined ? d.weekly * d.weeks : undefined;
  const start = d.checkIn;
  const end = addWeeks(d.checkIn, d.weeks);
  return (
    <aside className="book-summary" aria-label="Room information">
      <div className="book-summary__head">
        <h2>{d.roomName}</h2>
        <span>{d.propertyName}</span>
      </div>
      <h3 className="book-summary__title">Room Information</h3>
      <dl className="book-summary__dates">
        <div>
          <dt>Preferred Length of Stay</dt>
          <dd>{d.stayLabel}</dd>
        </div>
        <div>
          <dt>Contract Start Date</dt>
          <dd>{fmt(start)}</dd>
        </div>
        <div>
          <dt>Contract End Date</dt>
          <dd>{fmt(end)}</dd>
        </div>
      </dl>
      <img className="book-summary__photo" src={d.roomImage} alt="" />
      <div className="book-summary__line">
        <span>Total contract price</span>
        <strong>{total !== undefined ? money(d.currency, total) : 'To be confirmed'}</strong>
      </div>
      <p className="book-summary__note">Prices shown are before any promotions, discounts, as applied.</p>
      <h3 className="book-summary__title">Payable Today</h3>
      <div className="book-summary__line">
        <span>Holding deposit <small>(1 week holding deposit)</small></span>
        <strong>{d.weekly !== undefined ? money(d.currency, d.weekly) : '—'}</strong>
      </div>
      <div className="book-summary__line">
        <span>RTA Bond <small>(4 weeks)</small></span>
        <strong>{d.weekly !== undefined ? money(d.currency, d.weekly * 4) : '—'}</strong>
      </div>
    </aside>
  );
}

/**
 * Booking Your Room (after the live site's booking, after the sign-in): 1 Profile Setup,
 * 2 Room Reservation & Preferences (read and accept), 3 Contract & Bond Payment, then
 * Application Received. A prototype: nothing is sent and no payment is taken.
 */
export default function BookingPage() {
  const session = useSession();
  const draft = useMemo(getDraft, []);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Application | null>(null);
  const [profile, setProfile] = useState<Profile>(() => (session ? getProfile(session.email) ?? EMPTY : EMPTY));
  const [heard, setHeard] = useState('');
  const [requests, setRequests] = useState('');
  const [agree, setAgree] = useState({ privacy: false, offers: true, allocation: false });
  const [docs, setDocs] = useState({ agreement: false, rules: false, info: false });
  const [debit, setDebit] = useState<'pending' | 'done' | 'skipped'>('pending');
  const [tried, setTried] = useState(false);

  // Asked to sign in if the page is opened without a session
  useEffect(() => {
    if (!session) openLogin({ onSuccess: () => window.location.reload() });
  }, [session]);
  useEffect(() => {
    if (session) setProfile((p) => (p.firstName ? p : getProfile(session.email) ?? p));
  }, [session]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step, done]);

  const set = (k: keyof Profile) => (e: { target: { value: string } }) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  if (!draft && !done) {
    return (
      <>
        <Nav tone="cream" />
        <main className="book book--empty">
          <h1 className="book__title">Booking Your Room</h1>
          <p>You haven’t chosen a room yet. Pick a room, a term and a check-in date, then press Book.</p>
          <a className="book__button" href="/find-a-room">Find a room</a>
        </main>
        <Footer />
      </>
    );
  }

  const profileMissing = (k: keyof Profile) => tried && !profile[k].trim();
  const nextProfile = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const required: (keyof Profile)[] = ['firstName', 'lastName', 'phone', 'dob', 'nationality', 'gender', 'address', 'city', 'postcode', 'country', 'institution', 'yearOfStudy', 'course', 'level'];
    if (required.some((k) => !profile[k].trim()) || !agree.privacy || !agree.allocation) return;
    if (session) saveProfile(session.email, profile);
    setTried(false);
    setStep(1);
  };
  const nextDocs = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!docs.agreement || !docs.rules || !docs.info) return;
    setTried(false);
    setStep(2);
  };
  const confirm = () => {
    if (!draft || !session) return;
    setDone(submitApplication(draft, session.email));
  };

  if (done) {
    return (
      <>
        <Nav tone="cream" />
        <main className="book book--done">
          <p className="book__crumbs"><a href="/">Home</a> / <strong>Book Your Room</strong></p>
          <div className="book__received">
            <h1 className="book__title">Application Received</h1>
            <p><strong>Thank you for your application!</strong></p>
            <p>
              You’ve just taken the first step toward your next chapter with EPIISOD. Our team is reviewing your submission and will
              be in touch soon with your next steps. In the meantime, sit tight — we can’t wait to welcome you to a new level of
              student living.
            </p>
            <p className="book__ref">Reference {done.reference}</p>
            <a className="book__link" href="/account">Go to My Account →</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav tone="cream" />
      <main className="book">
        <p className="book__crumbs"><a href="/">Home</a> / <strong>Book Your Room</strong></p>
        <h1 className="book__title">Booking Your Room</h1>

        <ol className="book-steps" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <li key={label} className={`book-steps__item${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`}>
              <span className="book-steps__no">{i + 1}</span>
              <span className="book-steps__label">{label}</span>
            </li>
          ))}
        </ol>

        <div className="book__layout">
          <div className="book-card">
            {step === 0 && (
              <form onSubmit={nextProfile} noValidate>
                <section className="book-section">
                  <div className="book-section__intro">
                    <h2>Getting To Know You</h2>
                    <p>Just the basics so we can set things up right.</p>
                  </div>
                  <div className="book-grid">
                    <Field label="First name" error={profileMissing('firstName')}><input value={profile.firstName} onChange={set('firstName')} autoComplete="given-name" /></Field>
                    <Field label="Last name" error={profileMissing('lastName')}><input value={profile.lastName} onChange={set('lastName')} autoComplete="family-name" /></Field>
                    <Field label="Email" wide><input value={session?.email ?? ''} readOnly className="is-locked" /></Field>
                    <Field label="Phone number" error={profileMissing('phone')}><input value={profile.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" placeholder="+61 400 000 000" /></Field>
                    <Field label="Date of birth" error={profileMissing('dob')}><input type="date" value={profile.dob} onChange={set('dob')} /></Field>
                    <Field label="Nationality" error={profileMissing('nationality')}>
                      <Select value={profile.nationality} onChange={set('nationality')} className={profile.nationality ? '' : 'is-empty'}>
                        <option value="" disabled>Select nationality</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Field>
                    <fieldset className={`book-gender${profileMissing('gender') ? ' has-error' : ''}`}>
                      <legend className="book-field__label">Gender</legend>
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g}><input type="radio" name="gender" checked={profile.gender === g} onChange={() => setProfile((p) => ({ ...p, gender: g }))} /> {g}</label>
                      ))}
                    </fieldset>
                    <Field label="Current address" error={profileMissing('address')} wide><input value={profile.address} onChange={set('address')} autoComplete="street-address" /></Field>
                    <Field label="City" error={profileMissing('city')}><input value={profile.city} onChange={set('city')} autoComplete="address-level2" /></Field>
                    <Field label="Postcode / ZIP" error={profileMissing('postcode')}><input value={profile.postcode} onChange={set('postcode')} autoComplete="postal-code" /></Field>
                    <Field label="Country" error={profileMissing('country')} wide>
                      <Select value={profile.country} onChange={set('country')} className={profile.country ? '' : 'is-empty'}>
                        <option value="" disabled>Select country</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                </section>

                <section className="book-section">
                  <div className="book-section__intro">
                    <h2>Study Information</h2>
                    <p>Tell us a bit about your study plans.</p>
                  </div>
                  <div className="book-grid">
                    <Field label="Educational institution" error={profileMissing('institution')} wide><input value={profile.institution} onChange={set('institution')} placeholder="e.g. Macquarie University" /></Field>
                    <Field label="Year of study" error={profileMissing('yearOfStudy')}>
                      <Select value={profile.yearOfStudy} onChange={set('yearOfStudy')} className={profile.yearOfStudy ? '' : 'is-empty'}>
                        <option value="" disabled>Year of study at start of tenancy</option>
                        {YEARS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Field>
                    <Field label="Course" error={profileMissing('course')}><input value={profile.course} onChange={set('course')} /></Field>
                    <Field label="Level of study" error={profileMissing('level')} wide>
                      <Select value={profile.level} onChange={set('level')} className={profile.level ? '' : 'is-empty'}>
                        <option value="" disabled>Select level</option>
                        {LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                </section>

                <section className="book-section">
                  <div className="book-section__intro">
                    <h2>Length of Stay</h2>
                    <p>How long will you be staying with us?</p>
                  </div>
                  <div className="book-grid">
                    <Field label="Preferred length of stay" wide><input value={draft?.stayLabel ?? ''} readOnly className="is-locked" /></Field>
                    <Field label="Contract start date"><input value={draft ? fmt(draft.checkIn) : ''} readOnly className="is-locked" /></Field>
                    <Field label="Contract end date"><input value={draft ? fmt(addWeeks(draft.checkIn, draft.weeks)) : ''} readOnly className="is-locked" /></Field>
                  </div>
                </section>

                <section className="book-section">
                  <div className="book-section__intro">
                    <h2>Additional Requests</h2>
                    <p>Tell us about any extra preferences for your application and we’ll try our best to accommodate.</p>
                  </div>
                  <div className="book-grid">
                    <Field label="Special requests or promo / discount code" wide>
                      <textarea rows={3} value={requests} onChange={(e) => setRequests(e.target.value)} />
                    </Field>
                    <fieldset className="book-heard book-field--wide">
                      <legend className="book-field__label">How did you hear about us?</legend>
                      {HEARD.map((h) => (
                        <label key={h}><input type="radio" name="heard" checked={heard === h} onChange={() => setHeard(h)} /> {h}</label>
                      ))}
                    </fieldset>
                  </div>
                  <div className="book-consents">
                    <label className={tried && !agree.privacy ? 'has-error' : ''}><input type="checkbox" checked={agree.privacy} onChange={(e) => setAgree((a) => ({ ...a, privacy: e.target.checked }))} /> I have read, understood and agree to the <a href="/privacy">Privacy Policy</a> of EPIISOD</label>
                    <label><input type="checkbox" checked={agree.offers} onChange={(e) => setAgree((a) => ({ ...a, offers: e.target.checked }))} /> Yes, I’d like to receive the latest offers from EPIISOD</label>
                    <label className={tried && !agree.allocation ? 'has-error' : ''}><input type="checkbox" checked={agree.allocation} onChange={(e) => setAgree((a) => ({ ...a, allocation: e.target.checked }))} /> I acknowledge that final room allocations are subject to EPIISOD’s discretion and may be adjusted if necessary. Any changes will take my preferences into account, and a similar room will be assigned whenever possible.</label>
                  </div>
                </section>

                {tried && <p className="book__error" role="alert">Please complete the highlighted fields to continue.</p>}
                <div className="book-actions">
                  <a className="book__back" href={draft?.roomHref ?? '/find-a-room'}>← Back</a>
                  <button type="submit" className="book__button">Continue →</button>
                </div>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={nextDocs} noValidate>
                <section className="book-section book-section--single">
                  <div className="book-section__intro">
                    <h2>Please read the following and accept</h2>
                    <p>Your agreement and the house information for {draft?.propertyName}.</p>
                  </div>
                  <ul className="book-docs">
                    {([
                      ['agreement', 'Residential Tenancy Agreement', 'The terms of your tenancy: rent, bond, notices, repairs, ending the agreement and your rights under the Residential Tenancies Act.'],
                      ['rules', 'House Rules', 'How we share the building: quiet hours, guests, shared spaces, safety and respect for neighbours.'],
                      ['info', 'Tenant Information Statement', 'The statement published by NSW Fair Trading, available to read on your EPIISOD account.'],
                    ] as const).map(([key, title, text]) => (
                      <li key={key} className={`book-doc${tried && !docs[key] ? ' has-error' : ''}`}>
                        <div>
                          <h3>{title}</h3>
                          <p>{text}</p>
                          <span className="book-doc__view">Document preview in the full version</span>
                        </div>
                        <label>
                          <input type="checkbox" checked={docs[key]} onChange={(e) => setDocs((d) => ({ ...d, [key]: e.target.checked }))} />
                          I have read and accept
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
                {tried && <p className="book__error" role="alert">Please accept each document to continue.</p>}
                <div className="book-actions">
                  <button type="button" className="book__back" onClick={() => setStep(0)}>← Back</button>
                  <button type="submit" className="book__button">Continue →</button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div>
                <section className="book-section book-section--single book-pay">
                  <h2 className="book-pay__title">Setup Direct Debit</h2>
                  <p className="book-pay__text">
                    Set up automatic direct debit to make your ongoing payments simple, secure and stress-free. With direct debit, your
                    rent will always be paid on time, giving you peace of mind throughout your stay.
                  </p>
                  {debit === 'done' && <p className="book-pay__ok">Direct debit set up (prototype: no bank details were taken).</p>}
                  {debit === 'skipped' && <p className="book-pay__ok">You can set up direct debit later from My Account.</p>}
                  {draft?.weekly !== undefined && (
                    <dl className="book-pay__due">
                      <div><dt>Holding deposit (1 week)</dt><dd>{money(draft.currency, draft.weekly)}</dd></div>
                      <div><dt>RTA bond (4 weeks)</dt><dd>{money(draft.currency, draft.weekly * 4)}</dd></div>
                      <div className="is-total"><dt>Payable today</dt><dd>{money(draft.currency, draft.weekly * 5)}</dd></div>
                    </dl>
                  )}
                </section>
                <div className="book-actions">
                  <button type="button" className="book__back" onClick={() => setStep(1)}>← Back</button>
                  <div className="book-actions__right">
                    {debit === 'pending' && <button type="button" className="book__skip" onClick={() => setDebit('skipped')}>Skip Later</button>}
                    {debit === 'pending' ? (
                      <button type="button" className="book__button" onClick={() => setDebit('done')}>Continue →</button>
                    ) : (
                      <button type="button" className="book__button" onClick={confirm}>Confirm &amp; pay</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {draft && <Summary d={draft} />}
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Leaves a half-made booking behind. */
export const abandonBooking = clearDraft;
