import { useSyncExternalStore } from 'react';

/**
 * The site's language. The translating itself is public/i18n/engine.js (shared with the
 * hand-built experience pages); this is the React side: which language is on, and a way to
 * change it. The choice is kept on this device and in the address (?lang=zh).
 */
export type Language = 'en' | 'zh' | 'hi';

export const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中文', name: '中文' },
  { code: 'hi', label: 'हिन्दी', name: 'हिन्दी' },
];

type Engine = { get: () => Language; set: (l: Language) => void; on: (f: (l: Language) => void) => () => void };
const engine = () => (window as unknown as { __epLang?: Engine }).__epLang;

const subscribe = (fn: () => void) => engine()?.on(fn) ?? (() => {});
const snapshot = (): Language => engine()?.get() ?? 'en';

export const setLanguage = (l: Language) => engine()?.set(l);

export function useLanguage(): [Language, (l: Language) => void] {
  return [useSyncExternalStore(subscribe, snapshot, () => 'en'), setLanguage];
}
