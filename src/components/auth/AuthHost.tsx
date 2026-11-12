import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { knownAccount, onLoginRequest, signIn, type LoginRequest } from '../../lib/auth';
import { setScrollLocked } from '../../lib/smoothScroll';
import './AuthModal.css';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Let's Get Started" (after the live site's booking sign-in): an email, whether to remember the
 * login and agreeing to the Privacy Policy, then the one-time PIN sent to that email. Mounted once
 * per page; opened by `openLogin()` (lib/auth.ts), which can carry on with what the user was doing.
 */
export default function AuthHost() {
  const [req, setReq] = useState<LoginRequest | null>(null);
  useEffect(() => onLoginRequest(setReq), []);
  return req ? <AuthModal req={req} onClose={() => setReq(null)} /> : null;
}

function AuthModal({ req, onClose }: { req: LoginRequest; onClose: () => void }) {
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [pin, setPin] = useState('');
  const [tried, setTried] = useState(false);
  const [help, setHelp] = useState(false);
  const [returning, setReturning] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    setScrollLocked(true);
    document.documentElement.classList.add('auth-open');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('auth-open');
      setScrollLocked(false);
    };
  }, [onClose]);

  const emailBad = !EMAIL_OK.test(email.trim());
  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (emailBad || !agree) return;
    setReturning(knownAccount(email));
    setStep('pin');
    setTried(false);
    setPin('');
  };
  const submitPin = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!/^\d{6}$/.test(pin)) return;
    signIn(email, remember);
    onClose();
    req.onSuccess?.();
  };

  return createPortal(
    <div className="auth" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="auth__dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth__close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        {step === 'email' ? (
          <form onSubmit={submitEmail} noValidate>
            <h2 id="auth-title" className="auth__title">Let’s Get Started</h2>
            <p className="auth__text">
              Enter your email address to proceed. We’ll send you a one-time PIN to verify your identity. If you already have an
              account, we’ll pick up right where you left off.
            </p>

            <label className={`auth__field${tried && emailBad ? ' has-error' : ''}`}>
              <span className="auth__label">Email address</span>
              <input
                ref={firstRef}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {tried && emailBad && <span className="auth__error">Please enter a valid email address</span>}
            </label>

            <div className="auth__row">
              <label className="auth__check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember my login</span>
              </label>
              <button type="button" className="auth__link" aria-expanded={help} onClick={() => setHelp((h) => !h)}>
                Can’t recall which email you used?
              </button>
            </div>
            {help && (
              <p className="auth__help">
                Try the address you gave when you enquired or applied. If you’re not sure, contact the EPIISOD team and we’ll
                find your account.
              </p>
            )}

            <label className={`auth__check auth__check--agree${tried && !agree ? ' has-error' : ''}`}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I have read, understood and agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> of EPIISOD
              </span>
            </label>
            {tried && !agree && <span className="auth__error">Please agree to continue</span>}

            <button type="submit" className="auth__submit">
              Get Started
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        ) : (
          <form onSubmit={submitPin} noValidate>
            <h2 id="auth-title" className="auth__title">{returning ? 'Welcome back' : 'Check your email'}</h2>
            <p className="auth__text">
              We’ve sent a 6-digit PIN to <strong>{email.trim()}</strong>. Enter it below to verify it’s you
              {returning ? ' and carry on where you left off.' : ' and set up your booking.'}
            </p>
            <label className={`auth__field${tried && !/^\d{6}$/.test(pin) ? ' has-error' : ''}`}>
              <span className="auth__label">One-time PIN</span>
              <input
                ref={firstRef}
                className="auth__pin"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                autoFocus
              />
              {tried && !/^\d{6}$/.test(pin) && <span className="auth__error">Enter the 6-digit PIN</span>}
            </label>
            <p className="auth__help auth__help--demo">Prototype: no email is sent. Any 6-digit PIN works (try 123456).</p>
            <button type="submit" className="auth__submit">
              Verify and continue
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
            <div className="auth__row auth__row--center">
              <button type="button" className="auth__link" onClick={() => setStep('email')}>
                Use a different email
              </button>
              <button type="button" className="auth__link" onClick={() => setPin('')}>
                Resend PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
