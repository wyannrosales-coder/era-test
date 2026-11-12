import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { PROPERTIES } from '../locationData';
import { getSession, knownAccount, saveDraft, saveProfile, signIn, submitApplication, getProfile } from '../../lib/auth';
import {
  isContext,
  pendingTools,
  planBooking,
  resetChat,
  resolveTool,
  retry,
  sendText,
  setChatOpen,
  useChat,
  type Block,
  type BookingInput,
  type Outcome,
  type ToolUse,
} from '../../lib/chat';
import { findRoom } from '../../lib/chatCatalog';
import '../EnquiryPill.css';
import './ChatWidget.css';

const DISMISSED_KEY = 'epiisod-enquiry-dismissed';
const ENQUIRIES_KEY = 'epiisod-enquiries';
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STARTERS = ['Help me find a room', 'I’d like to book a room', 'What’s included in the rent?', 'Tell me about current offers'];

const money = (currency: string, n: number) => `${currency}${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
const fmtDate = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
const addWeeks = (iso: string, weeks: number) => {
  const d = new Date(`${iso}T00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ---- The assistant's text: paragraphs, short lists, **bold** and links
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={m.index}>{m[1]}</strong>);
    else if (/^(\/|https:\/\/|mailto:|tel:)/.test(m[3])) {
      const external = m[3].startsWith('https://');
      out.push(
        <a key={m.index} href={m[3]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {m[2]}
        </a>,
      );
    } else out.push(m[2]);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      blocks.push(
        <p key={blocks.length}>
          {para.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>,
      );
      para = [];
    }
    if (list.length) {
      blocks.push(
        <ul key={blocks.length}>
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (!line) flush();
    else if (bullet) {
      if (para.length) flush();
      list.push(bullet[1]);
    } else {
      if (list.length) flush();
      para.push(line.replace(/^#+\s*/, ''));
    }
  }
  flush();
  return <>{blocks}</>;
}

// ---- Elements the assistant shows (one per tool)
type ElementProps = { tool: ToolUse; disabled: boolean };

function Options({ tool, disabled }: ElementProps) {
  const options = (Array.isArray(tool.input.options) ? tool.input.options : []).map(String).slice(0, 8);
  const multiple = tool.input.allow_multiple === true;
  const [picked, setPicked] = useState<string[]>([]);
  const answer = (chosen: string[]) => resolveTool(tool.id, multiple ? { selected: chosen } : { selected: chosen[0] }, { text: chosen.join(', ') });
  return (
    <div className="chat-options">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`chat-chip${picked.includes(o) ? ' is-on' : ''}`}
          disabled={disabled}
          aria-pressed={multiple ? picked.includes(o) : undefined}
          onClick={() => (multiple ? setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o])) : answer([o]))}
        >
          {o}
        </button>
      ))}
      {multiple && (
        <button type="button" className="chat-button chat-button--small" disabled={disabled || !picked.length} onClick={() => answer(picked)}>
          Done
        </button>
      )}
    </div>
  );
}

function Rooms({ tool, disabled }: ElementProps) {
  const rooms = (Array.isArray(tool.input.rooms) ? tool.input.rooms : []).map((id) => findRoom(String(id))).filter((r) => !!r);
  const stayId = typeof tool.input.stay_id === 'string' ? tool.input.stay_id : '';
  return (
    <div className="chat-rooms" data-lenis-prevent>
      {rooms.map((r) => {
        const stay = r.stays.find((s) => s.id === stayId);
        const weekly = stay?.prices[r.room.id] ?? r.room.price;
        return (
          <article key={r.id} className="chat-room">
            <div className="chat-room__photo">
              <img src={r.image} alt="" loading="lazy" />
              {!r.room.available && <span className="chat-room__flag">Sold out</span>}
            </div>
            <div className="chat-room__body">
              <span className="chat-room__eyebrow">
                {r.room.typeLabel} · {r.content.place}
              </span>
              <h4 className="chat-room__name">{r.room.name}</h4>
              {r.details?.size && <span className="chat-room__meta">{r.details.size.split(' / ')[0]}</span>}
              <p className="chat-room__price">
                {r.content.opening ? (
                  <strong>{r.content.opening}</strong>
                ) : weekly !== undefined ? (
                  <>
                    {!stay && <span>From </span>}
                    <strong>{money(r.content.roomCurrency, weekly)}</strong>
                    <span> / week</span>
                  </>
                ) : (
                  <span>Price on request</span>
                )}
              </p>
              <div className="chat-room__actions">
                <button
                  type="button"
                  className="chat-button chat-button--small"
                  disabled={disabled || !r.room.available}
                  onClick={() => resolveTool(tool.id, { chosen_room: r.id, name: r.room.name, property: r.propertyName }, { text: `${r.room.name}, ${r.content.place}` })}
                >
                  {r.content.opening ? 'I’m interested' : 'Choose'}
                </button>
                <a className="chat-link" href={r.href} target="_blank" rel="noopener">
                  View room
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

type Field = { id: string; label: string; type: string; options?: string[]; required?: boolean; placeholder?: string; value?: string; min?: string; max?: string };

function Form({ tool, disabled }: ElementProps) {
  const fields = useMemo(
    () =>
      (Array.isArray(tool.input.fields) ? (tool.input.fields as Field[]) : [])
        .filter((f) => f && typeof f.id === 'string' && typeof f.label === 'string')
        .slice(0, 10),
    [tool.input.fields],
  );
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.id, f.value ?? ''])));
  const [tried, setTried] = useState(false);
  const bad = (f: Field) => {
    const v = (values[f.id] ?? '').trim();
    if (f.type === 'checkbox') return f.required === true && v !== 'yes';
    if (!v) return f.required !== false;
    if (f.type === 'email') return !EMAIL_OK.test(v);
    if (f.type === 'tel') return v.replace(/\D/g, '').length < 6;
    if (f.type === 'date') return (!!f.min && v < f.min) || (!!f.max && v > f.max);
    return false;
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (fields.some(bad)) return;
    const clean = Object.fromEntries(fields.map((f) => [f.id, (values[f.id] ?? '').trim()]));
    resolveTool(tool.id, { submitted: true, values: clean }, { text: fields.map((f) => clean[f.id]).filter(Boolean).join(' · ') || 'Sent' });
  };
  const set = (id: string, v: string) => setValues((s) => ({ ...s, [id]: v }));
  return (
    <form className="chat-card chat-form" onSubmit={submit} noValidate>
      {typeof tool.input.title === 'string' && <h4 className="chat-card__title">{tool.input.title}</h4>}
      {fields.map((f) => {
        const error = tried && bad(f);
        const common = { id: `${tool.id}-${f.id}`, disabled, 'aria-invalid': error || undefined };
        if (f.type === 'checkbox') {
          return (
            <label key={f.id} className={`chat-check${error ? ' has-error' : ''}`}>
              <input type="checkbox" {...common} checked={values[f.id] === 'yes'} onChange={(e) => set(f.id, e.target.checked ? 'yes' : 'no')} />
              <span>{f.label}</span>
            </label>
          );
        }
        return (
          <label key={f.id} className={`chat-field${error ? ' has-error' : ''}`}>
            <span className="chat-field__label">
              {f.label}
              {f.required === false && <em> (optional)</em>}
            </span>
            {f.type === 'select' ? (
              <select {...common} value={values[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)}>
                <option value="">Select…</option>
                {(f.options ?? []).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea {...common} rows={3} placeholder={f.placeholder} value={values[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)} />
            ) : (
              <input
                {...common}
                type={['email', 'tel', 'date'].includes(f.type) ? f.type : 'text'}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                value={values[f.id] ?? ''}
                onChange={(e) => set(f.id, e.target.value)}
              />
            )}
            {error && f.type === 'date' && values[f.id] && (
              <span className="chat-field__error">
                Choose a date{f.min ? ` from ${fmtDate(f.min)}` : ''}
                {f.max ? ` to ${fmtDate(f.max)}` : ''}
              </span>
            )}
          </label>
        );
      })}
      <button type="submit" className="chat-button" disabled={disabled}>
        {typeof tool.input.submit_label === 'string' ? tool.input.submit_label : 'Continue'}
      </button>
    </form>
  );
}

function SignIn({ tool, disabled }: ElementProps) {
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState(typeof tool.input.email === 'string' ? tool.input.email : '');
  const [agree, setAgree] = useState(false);
  const [pin, setPin] = useState('');
  const [tried, setTried] = useState(false);
  const returning = knownAccount(email);
  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!EMAIL_OK.test(email.trim()) || !agree) return;
    setTried(false);
    setStep('pin');
  };
  const submitPin = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!/^\d{6}$/.test(pin)) return;
    const wasKnown = returning;
    signIn(email, true);
    const address = getSession()?.email ?? email;
    resolveTool(
      tool.id,
      { signed_in: true, email: address, returning_customer: wasKnown, account_created: !wasKnown, saved_profile: getProfile(address) ?? null },
      { text: `Signed in as ${address}` },
    );
  };
  return step === 'email' ? (
    <form className="chat-card chat-form" onSubmit={submitEmail} noValidate>
      <h4 className="chat-card__title">Sign in or create your account</h4>
      <p className="chat-card__text">Enter your email and we’ll send you a one-time PIN. New here? This creates your account.</p>
      <label className={`chat-field${tried && !EMAIL_OK.test(email.trim()) ? ' has-error' : ''}`}>
        <span className="chat-field__label">Email address</span>
        <input type="email" autoComplete="email" value={email} disabled={disabled} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className={`chat-check${tried && !agree ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree} disabled={disabled} onChange={(e) => setAgree(e.target.checked)} />
        <span>I have read and agree to the Privacy Policy.</span>
      </label>
      <button type="submit" className="chat-button" disabled={disabled}>
        Get started
      </button>
    </form>
  ) : (
    <form className="chat-card chat-form" onSubmit={submitPin} noValidate>
      <h4 className="chat-card__title">{returning ? 'Welcome back' : 'Check your email'}</h4>
      <p className="chat-card__text">
        Enter the 6-digit PIN sent to <strong>{email.trim()}</strong>.
      </p>
      <label className={`chat-field${tried && !/^\d{6}$/.test(pin) ? ' has-error' : ''}`}>
        <span className="chat-field__label">One-time PIN</span>
        <input className="chat-pin" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={pin} disabled={disabled} autoFocus onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
      </label>
      <p className="chat-card__note">Prototype: no email is sent. Any 6 digits work, for example 123456.</p>
      <div className="chat-card__actions">
        <button type="submit" className="chat-button" disabled={disabled}>
          Verify
        </button>
        <button type="button" className="chat-link" disabled={disabled} onClick={() => setStep('email')}>
          Use a different email
        </button>
      </div>
    </form>
  );
}

function Booking({ tool, disabled }: ElementProps) {
  const input = tool.input as BookingInput;
  const { plan } = useMemo(() => planBooking(input), [input]);
  const [agree, setAgree] = useState({ terms: false, notices: false });
  const [tried, setTried] = useState(false);
  // A booking that doesn't check out is sent straight back to the assistant (lib/chat.ts)
  if (!plan) return null;
  const { draft, profile, room } = plan;
  const weekly = draft.weekly ?? 0;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const session = getSession();
    if (!agree.terms || !agree.notices || !session) return;
    saveProfile(session.email, profile);
    saveDraft(draft);
    const app = submitApplication(draft, session.email);
    resolveTool(
      tool.id,
      {
        submitted: true,
        reference: app.reference,
        status: 'Pending Review',
        note: 'Prototype: the application is saved on this device and listed under My account (/account). No payment was taken and nothing was emailed.',
      },
      { reference: app.reference, text: `${draft.roomName}, ${draft.propertyName}` },
    );
  };
  return (
    <form className="chat-card chat-booking" onSubmit={submit} noValidate>
      <h4 className="chat-card__title">Review your booking</h4>
      <div className="chat-booking__room">
        <img src={draft.roomImage} alt="" />
        <div>
          <strong>{draft.roomName}</strong>
          <span>{draft.propertyName}</span>
        </div>
      </div>
      <dl className="chat-summary">
        <div>
          <dt>Length of stay</dt>
          <dd>{draft.stayLabel}</dd>
        </div>
        <div>
          <dt>Contract dates</dt>
          <dd>
            {fmtDate(draft.checkIn)} – {fmtDate(addWeeks(draft.checkIn, draft.weeks))}
          </dd>
        </div>
        {draft.view && (
          <div>
            <dt>Preferred view</dt>
            <dd>{draft.view}</dd>
          </div>
        )}
        <div>
          <dt>Weekly rent</dt>
          <dd>{money(draft.currency, weekly)}</dd>
        </div>
        <div>
          <dt>Total contract price</dt>
          <dd>{money(draft.currency, weekly * draft.weeks)}</dd>
        </div>
        <div>
          <dt>Holding deposit (1 week)</dt>
          <dd>{money(draft.currency, weekly)}</dd>
        </div>
        <div>
          <dt>Bond (4 weeks)</dt>
          <dd>{money(draft.currency, weekly * 4)}</dd>
        </div>
        <div>
          <dt>Resident</dt>
          <dd>
            {profile.firstName} {profile.lastName}
            <br />
            {getSession()?.email}
          </dd>
        </div>
        {input.additional_requests && (
          <div>
            <dt>Requests</dt>
            <dd>{input.additional_requests}</dd>
          </div>
        )}
      </dl>
      <p className="chat-card__note">Prices are before any promotions or discounts. Prototype: no payment is taken.</p>
      <label className={`chat-check${tried && !agree.terms ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree.terms} disabled={disabled} onChange={(e) => setAgree((a) => ({ ...a, terms: e.target.checked }))} />
        <span>
          I have read and agree to the Tenancy Agreement, the EPIISOD House Rules and the <a href="/privacy">Privacy Policy</a>.
        </span>
      </label>
      <label className={`chat-check${tried && !agree.notices ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree.notices} disabled={disabled} onChange={(e) => setAgree((a) => ({ ...a, notices: e.target.checked }))} />
        <span>I consent to receive notices, documents and communications electronically.</span>
      </label>
      <div className="chat-card__actions">
        <button type="submit" className="chat-button" disabled={disabled}>
          Submit application
        </button>
        <button
          type="button"
          className="chat-link"
          disabled={disabled}
          onClick={() => resolveTool(tool.id, { submitted: false, reason: 'The customer wants to change something before submitting. Ask what.' }, { text: 'I’d like to change something' })}
        >
          Change something
        </button>
        <a className="chat-link" href={room.href} target="_blank" rel="noopener">
          View room
        </a>
      </div>
    </form>
  );
}

function Enquiry({ tool, disabled }: ElementProps) {
  const get = (k: string) => (typeof tool.input[k] === 'string' ? (tool.input[k] as string) : '');
  const send = () => {
    const reference = `ENQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try {
      const saved = JSON.parse(window.localStorage.getItem(ENQUIRIES_KEY) ?? '[]') as unknown[];
      window.localStorage.setItem(ENQUIRIES_KEY, JSON.stringify([{ ...tool.input, reference, sentAt: new Date().toISOString() }, ...saved]));
    } catch {
      // Storage unavailable: the enquiry still shows as sent for this visit
    }
    resolveTool(
      tool.id,
      { sent: true, reference, note: 'Prototype: the enquiry is saved on this device and was not delivered to the team.' },
      { text: `Enquiry sent · ${reference}` },
    );
  };
  return (
    <div className="chat-card">
      <h4 className="chat-card__title">Send this to our team?</h4>
      <dl className="chat-summary">
        <div>
          <dt>From</dt>
          <dd>
            {get('name')}
            <br />
            {get('email')}
            {get('phone') && (
              <>
                <br />
                {get('phone')}
              </>
            )}
          </dd>
        </div>
        {get('property') && (
          <div>
            <dt>Property</dt>
            <dd>{get('property')}</dd>
          </div>
        )}
        <div>
          <dt>About</dt>
          <dd>{get('topic')}</dd>
        </div>
        <div>
          <dt>Message</dt>
          <dd>{get('message')}</dd>
        </div>
      </dl>
      <div className="chat-card__actions">
        <button type="button" className="chat-button" disabled={disabled} onClick={send}>
          Send enquiry
        </button>
        <button
          type="button"
          className="chat-link"
          disabled={disabled}
          onClick={() => resolveTool(tool.id, { sent: false, reason: 'The customer wants to edit the enquiry first. Ask what to change.' }, { text: 'I’d like to edit it' })}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

const ELEMENTS: Record<string, (p: ElementProps) => ReactNode> = {
  show_options: Options,
  show_rooms: Rooms,
  show_form: Form,
  request_sign_in: SignIn,
  confirm_booking: Booking,
  submit_enquiry: Enquiry,
};

/** What the customer did with an element, once answered. */
function OutcomeLine({ outcome }: { outcome: Outcome }) {
  if (outcome.reference) {
    return (
      <div className="chat-receipt">
        <span className="chat-receipt__eyebrow">Application received</span>
        <strong className="chat-receipt__ref">{outcome.reference}</strong>
        {outcome.text && <span>{outcome.text}</span>}
        <a className="chat-link" href="/account">
          View in My account
        </a>
      </div>
    );
  }
  return outcome.text ? <div className="chat-bubble chat-bubble--user">{outcome.text}</div> : null;
}

/**
 * The EPIISOD assistant: the floating "Chat with us" pill, bottom right on every page, and the
 * chat panel it opens (full screen on phones). The assistant answers from the content of
 * epiisod.com and can show options, room cards, forms, the sign-in and a booking to submit, all
 * in the conversation (lib/chat.ts, api/chat.ts). Mounted once by src/main.tsx and by the
 * experience pages' nav island, in place of the enquiry pill.
 */
export default function ChatWidget() {
  const chat = useChat();
  const path = window.location.pathname.replace(/\/+$/, '');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [shown, setShown] = useState(false);
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The pill fades in a moment after load so it doesn't compete with the hero
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages, chat.streaming, chat.error, chat.open]);

  useEffect(() => {
    if (!chat.open) return;
    if (window.matchMedia('(min-width: 601px)').matches) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setChatOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chat.open]);

  const property = PROPERTIES.find((p) => p.href && (path === p.href || path.startsWith(`${p.href}/`)));
  const tag = property?.name.replace(/^EPIISOD\s+/i, '');
  const waiting = pendingTools(chat.messages);
  const answered = useMemo(() => {
    const ids = new Set<string>();
    for (const m of chat.messages) if (m.role === 'user') for (const b of m.content) if (b.type === 'tool_result') ids.add(String(b.tool_use_id));
    return ids;
  }, [chat.messages]);

  const send = (text: string) => {
    sendText(text);
    setDraft('');
  };

  const renderBlock = (b: Block, role: string, key: string) => {
    if (b.type === 'text' && typeof b.text === 'string' && b.text.trim() && !isContext(b)) {
      return role === 'user' ? (
        <div key={key} className="chat-bubble chat-bubble--user">
          {b.text}
        </div>
      ) : (
        <div key={key} className="chat-bubble">
          <Rich text={b.text} />
        </div>
      );
    }
    if (b.type === 'tool_use') {
      const tool = b as ToolUse;
      if (answered.has(tool.id)) return chat.outcomes[tool.id] ? <OutcomeLine key={key} outcome={chat.outcomes[tool.id]} /> : null;
      const Element = ELEMENTS[tool.name];
      return Element ? (
        <div key={key} className="chat-element">
          <Element tool={tool} disabled={chat.busy} />
        </div>
      ) : null;
    }
    return null;
  };

  const notConnected = chat.error?.code === 'not_configured';

  return (
    <>
      {!dismissed && !chat.open && (
        <div className={`enquiry-pill${shown ? ' is-shown' : ''}`}>
          <button type="button" className="enquiry-pill__link" onClick={() => setChatOpen(true)} aria-haspopup="dialog">
            <svg className="enquiry-pill__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 3.2h12v7.6H8.4L5 13.6v-2.8H2z" strokeLinejoin="round" />
            </svg>
            <span>Chat with us</span>
            {tag && <span className="enquiry-pill__tag">{tag}</span>}
          </button>
          <button
            type="button"
            className="enquiry-pill__close"
            aria-label="Hide chat button"
            onClick={() => {
              setDismissed(true);
              try {
                sessionStorage.setItem(DISMISSED_KEY, '1');
              } catch {
                /* private mode: it just comes back next page */
              }
            }}
          >
            <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true" stroke="currentColor" strokeWidth="1.3">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        </div>
      )}

      {chat.open && (
        <section className="chat" role="dialog" aria-label="EPIISOD Assistant">
          <header className="chat__head">
            <div>
              <h3 className="chat__title">EPIISOD Assistant</h3>
              <p className="chat__sub">Ask a question or book a room</p>
            </div>
            <div className="chat__tools">
              {chat.messages.length > 0 && (
                <button type="button" className="chat__tool" onClick={resetChat} aria-label="Start a new chat" title="Start a new chat">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.5 8a5.5 5.5 0 1 1-1.7-4" />
                    <path d="M13.5 2.5V5H11" />
                  </svg>
                </button>
              )}
              <button type="button" className="chat__tool" onClick={() => setChatOpen(false)} aria-label="Close chat">
                <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" stroke="currentColor" strokeWidth="1.3">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          </header>

          <div className="chat__log" ref={logRef} data-lenis-prevent translate="no" aria-live="polite">
            <div className="chat-bubble">
              <p>Hello, and welcome to EPIISOD. I can answer questions about our residences, rooms, prices and offers, and help you book a room right here.</p>
              <p>How can I help today?</p>
            </div>
            {chat.messages.length === 0 && (
              <div className="chat-options">
                {STARTERS.map((s) => (
                  <button key={s} type="button" className="chat-chip" disabled={chat.busy} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {chat.messages.map((m, i) => m.content.map((b, j) => renderBlock(b, m.role, `${i}-${j}`)))}
            {chat.busy &&
              (chat.streaming ? (
                <div className="chat-bubble">
                  <Rich text={chat.streaming} />
                </div>
              ) : (
                <div className="chat-bubble chat-typing" aria-label="The assistant is writing">
                  <i />
                  <i />
                  <i />
                </div>
              ))}
            {chat.error && (
              <div className="chat-error" role="alert">
                <p>
                  {notConnected
                    ? 'The assistant isn’t connected on this site yet. Our team is happy to help in the meantime.'
                    : chat.error.message}
                </p>
                <div className="chat-card__actions">
                  {!notConnected && chat.error.code !== 'rate_limited' && (
                    <button type="button" className="chat-button chat-button--small" onClick={retry}>
                      Try again
                    </button>
                  )}
                  <a className="chat-link" href="/contact">
                    Contact us
                  </a>
                </div>
              </div>
            )}
          </div>

          <form
            className="chat__composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              placeholder={waiting.length ? 'Or type your answer…' : 'Type your message…'}
              aria-label="Your message"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(draft);
                }
              }}
            />
            <button type="submit" className="chat__send" disabled={chat.busy || !draft.trim()} aria-label="Send">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
              </svg>
            </button>
          </form>
          <p className="chat__foot">
            AI assistant. Answers come from epiisod.com. <a href="/contact">Contact our team</a>
          </p>
        </section>
      )}
    </>
  );
}
