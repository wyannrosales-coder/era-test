import { useSyncExternalStore } from 'react';

/**
 * Sign-in and the booking in progress (a prototype, kept on this device). The flow follows the
 * live site's: pressing Book on a room asks for an email and a one-time PIN ("Let's Get Started");
 * once signed in the booking carries on at /booking (profile, agreement, payment).
 * Nothing is sent anywhere: any 6-digit PIN is accepted.
 */
export type Session = { email: string };

export type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  nationality: string;
  gender: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  institution: string;
  yearOfStudy: string;
  course: string;
  level: string;
};

/** The room, term and date chosen on a room page, carried to the booking. */
export type BookingDraft = {
  propertyHref: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  roomHref: string;
  stayId: string;
  stayLabel: string;
  weeks: number;
  weekly?: number;
  currency: string;
  checkIn: string;
  view?: string;
};

export type Application = BookingDraft & { email: string; submittedAt: string; reference: string };

const SESSION_KEY = 'epiisod-session';
const ACCOUNTS_KEY = 'epiisod-accounts';
const DRAFT_KEY = 'epiisod-booking-draft';
const APPS_KEY = 'epiisod-applications';

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const subscribe = (f: () => void) => {
  listeners.add(f);
  return () => listeners.delete(f);
};

function read<T>(key: string, fallback: T, store: Storage = window.localStorage): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown, store: Storage = window.localStorage) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the choice just isn't kept
  }
}

// ---- Session (remember my login → this device; otherwise this tab only)
let session: Session | null = read<Session | null>(SESSION_KEY, null) ?? read<Session | null>(SESSION_KEY, null, window.sessionStorage);
export const getSession = () => session;
export function signIn(email: string, remember: boolean) {
  session = { email: email.trim().toLowerCase() };
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  write(SESSION_KEY, session, remember ? window.localStorage : window.sessionStorage);
  const accounts = read<Record<string, { profile?: Profile }>>(ACCOUNTS_KEY, {});
  if (!accounts[session.email]) write(ACCOUNTS_KEY, { ...accounts, [session.email]: {} });
  emit();
}
export function signOut() {
  session = null;
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  emit();
}
export const useSession = () => useSyncExternalStore(subscribe, getSession, () => null);

/** An account that has signed in before (its PIN step says "welcome back"). */
export const knownAccount = (email: string) => email.trim().toLowerCase() in read<Record<string, unknown>>(ACCOUNTS_KEY, {});
export const getProfile = (email: string): Profile | undefined =>
  read<Record<string, { profile?: Profile }>>(ACCOUNTS_KEY, {})[email.trim().toLowerCase()]?.profile;
export function saveProfile(email: string, profile: Profile) {
  const key = email.trim().toLowerCase();
  const accounts = read<Record<string, { profile?: Profile }>>(ACCOUNTS_KEY, {});
  write(ACCOUNTS_KEY, { ...accounts, [key]: { ...accounts[key], profile } });
}

// ---- The booking in progress
export const getDraft = () => read<BookingDraft | null>(DRAFT_KEY, null);
export const saveDraft = (d: BookingDraft) => write(DRAFT_KEY, d);
export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
export const getApplications = () => read<Application[]>(APPS_KEY, []);
export function submitApplication(d: BookingDraft, email: string): Application {
  const app: Application = {
    ...d,
    email,
    submittedAt: new Date().toISOString(),
    reference: `EPI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };
  write(APPS_KEY, [app, ...getApplications()]);
  clearDraft();
  emit();
  return app;
}

// ---- Asking for a sign-in
export type LoginRequest = { onSuccess?: () => void };
const EVENT = 'epiisod:login';
export const openLogin = (req: LoginRequest = {}) => window.dispatchEvent(new CustomEvent<LoginRequest>(EVENT, { detail: req }));
export const onLoginRequest = (f: (req: LoginRequest) => void) => {
  const h = (e: Event) => f((e as CustomEvent<LoginRequest>).detail ?? {});
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};
/** Runs `then` now when signed in, otherwise after the sign-in. */
export const requireLogin = (then: () => void) => (session ? then() : openLogin({ onSuccess: then }));
