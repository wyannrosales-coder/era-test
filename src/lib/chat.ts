import { useSyncExternalStore } from 'react';
import { getApplications, getDraft, getProfile, getSession, type BookingDraft, type Profile } from './auth';
import { findRoom, weeksOf, type CatalogRoom } from './chatCatalog';
import type { Stay } from '../components/property/propertyContent';

/**
 * The assistant's conversation (client side). The messages are kept exactly as the API
 * exchanges them (/api/chat, api/chat.ts) and sent back whole on each turn: assistant turns
 * are stored untouched, so their content blocks are treated as opaque here. The conversation
 * and whether the panel is open are kept for the tab (sessionStorage), so they carry across
 * this site's page loads.
 *
 * When the assistant calls a tool the turn ends with a `tool_use` block; the chat panel shows
 * the matching element and `resolveTool` sends back what the customer did.
 */
export type Block = { type: string; [key: string]: unknown };
export type Message = { role: 'user' | 'assistant'; content: Block[] };
export type ToolUse = { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };
/** What the customer did with an element, as the log shows it afterwards. */
export type Outcome = { text?: string; reference?: string };
export type ChatError = { code: string; message: string };

type State = {
  messages: Message[];
  outcomes: Record<string, Outcome>;
  open: boolean;
  /** The reply being written, while it streams. */
  streaming: string | null;
  busy: boolean;
  error: ChatError | null;
};

const KEY = 'epiisod-chat';
const CONTEXT = '[context:';

function load(): State {
  const blank: State = { messages: [], outcomes: {}, open: false, streaming: null, busy: false, error: null };
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(KEY) ?? 'null') as Partial<State> | null;
    return saved ? { ...blank, messages: saved.messages ?? [], outcomes: saved.outcomes ?? {}, open: !!saved.open } : blank;
  } catch {
    return blank;
  }
}

let state = load();
const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  if ('messages' in patch || 'outcomes' in patch || 'open' in patch) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify({ messages: state.messages, outcomes: state.outcomes, open: state.open }));
    } catch {
      // Storage unavailable: the chat just doesn't survive a page load
    }
  }
  listeners.forEach((f) => f());
}
export const useChat = () =>
  useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    () => state,
  );

export const setChatOpen = (open: boolean) => set({ open });
export function resetChat() {
  abort?.abort();
  set({ messages: [], outcomes: {}, streaming: null, busy: false, error: null });
}

// ---- What the page knows, added to each customer turn
function contextBlock(): Block {
  const session = getSession();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const language = document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'en';
  return {
    type: 'text',
    text: `${CONTEXT} page=${window.location.pathname}, signed_in=${session ? session.email : 'no'}, language=${language}, today=${today} (${now.toLocaleDateString('en-AU', { weekday: 'long' })})]`,
  };
}
export const isContext = (b: Block) => b.type === 'text' && typeof b.text === 'string' && b.text.startsWith(CONTEXT);

/** Tool calls in the last assistant turn that haven't been answered yet. */
export function pendingTools(messages: Message[] = state.messages): ToolUse[] {
  const last = messages[messages.length - 1];
  return last?.role === 'assistant' ? (last.content.filter((b) => b.type === 'tool_use') as ToolUse[]) : [];
}

const toolResult = (id: string, result: unknown, isError = false): Block => ({
  type: 'tool_result',
  tool_use_id: id,
  content: typeof result === 'string' ? result : JSON.stringify(result),
  ...(isError ? { is_error: true } : {}),
});

/** The customer typed a message (answering in words any element still waiting). */
export function sendText(text: string) {
  const trimmed = text.trim();
  if (!trimmed || state.busy) return;
  const skipped = pendingTools().map((t) => toolResult(t.id, 'The customer did not use this element; they replied by typing instead (their message follows).'));
  post({ role: 'user', content: [...skipped, { type: 'text', text: trimmed }, contextBlock()] });
}

/** The customer used an element: send what they did back to the assistant. */
export function resolveTool(id: string, result: unknown, outcome: Outcome = {}, isError = false) {
  if (state.busy) return;
  const others = pendingTools()
    .filter((t) => t.id !== id)
    .map((t) => toolResult(t.id, 'Not used.'));
  set({ outcomes: { ...state.outcomes, [id]: outcome } });
  post({ role: 'user', content: [toolResult(id, result, isError), ...others, contextBlock()] });
}

/** Ask again after an error, with the conversation as it stands. */
export function retry() {
  if (!state.busy && state.messages.length) void request();
}

function post(message: Message) {
  set({ messages: [...state.messages, message], error: null });
  void request();
}

let abort: AbortController | null = null;

async function request() {
  abort?.abort();
  const controller = (abort = new AbortController());
  set({ busy: true, streaming: '', error: null });
  let failure: ChatError | null = null;
  let reply: Message | null = null;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: state.messages }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      const body = (await res.json().catch(() => null)) as { error?: ChatError } | null;
      failure = body?.error ?? { code: 'unavailable', message: 'The assistant is unavailable right now.' };
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          const data = JSON.parse(event.slice(6)) as
            | { type: 'text'; delta: string }
            | { type: 'done'; message: Message }
            | { type: 'error'; code: string; message: string };
          if (data.type === 'text') {
            text += data.delta;
            set({ streaming: text });
          } else if (data.type === 'done') {
            reply = data.message;
          } else {
            failure = { code: data.code, message: data.message };
          }
        }
      }
      if (!reply && !failure) failure = { code: 'interrupted', message: 'The reply was interrupted. Please try again.' };
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    failure = { code: 'offline', message: 'We couldn’t reach the assistant. Check your connection and try again.' };
  }
  if (controller !== abort) return;
  if (reply) set({ messages: [...state.messages, reply], streaming: null, busy: false });
  else set({ streaming: null, busy: false, error: failure });
  if (reply) autoResolve();
}

// ---- Tools answered without the customer (lookups, and requests that can't be shown)
export function customerState() {
  const session = getSession();
  return {
    signed_in: !!session,
    email: session?.email ?? null,
    saved_profile: session ? getProfile(session.email) ?? null : null,
    booking_in_progress: getDraft(),
    applications: session
      ? getApplications()
          .filter((a) => a.email === session.email)
          .map((a) => ({ reference: a.reference, room: a.roomName, property: a.propertyName, term: a.stayLabel, check_in: a.checkIn, submitted_at: a.submittedAt, status: 'Pending Review' }))
      : [],
  };
}

export type BookingInput = {
  room: string;
  stay_id: string;
  check_in: string;
  view?: string;
  additional_requests?: string;
  profile: Record<string, string>;
};
export type BookingPlan = { room: CatalogRoom; stay: Stay; draft: BookingDraft; profile: Profile };

const PROFILE_FIELDS: [keyof Profile, string][] = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['phone', 'phone'],
  ['dob', 'date_of_birth'],
  ['nationality', 'nationality'],
  ['gender', 'gender'],
  ['address', 'address'],
  ['city', 'city'],
  ['postcode', 'postcode'],
  ['country', 'country'],
  ['institution', 'institution'],
  ['course', 'course'],
  ['level', 'level_of_study'],
  ['yearOfStudy', 'year_of_study'],
];

/** Checks a booking the assistant put together against this site's rooms and terms. */
export function planBooking(input: BookingInput): { plan?: BookingPlan; problems: string[] } {
  const problems: string[] = [];
  if (!getSession()) problems.push('The customer is not signed in: call request_sign_in first.');
  const room = findRoom(String(input.room ?? ''));
  if (!room) return { problems: [...problems, `Unknown room id "${input.room}". Use an id from the booking catalogue.`] };
  if (room.content.opening) return { problems: [`${room.propertyName} is not open for booking yet (${room.content.opening}). Offer to register interest with submit_enquiry.`] };
  if (!room.room.available) problems.push(`${room.room.name} is sold out and cannot be booked.`);
  const stay = room.stays.find((s) => s.id === String(input.stay_id ?? ''));
  if (!stay) {
    return { problems: [...problems, `stay_id "${input.stay_id}" is not offered for ${room.room.name}. Offered: ${room.stays.map((s) => `${s.id} (${s.group}, ${s.label})`).join('; ')}.`] };
  }
  const date = String(input.check_in ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < stay.checkIn.from || date > stay.checkIn.to) {
    problems.push(`check_in must be a date (YYYY-MM-DD) between ${stay.checkIn.from} and ${stay.checkIn.to} for this term; got "${date}".`);
  }
  const views = room.details?.views ?? [];
  const view = views.find((v) => v.toLowerCase() === String(input.view ?? '').toLowerCase());
  if (input.view && !view) problems.push(`View "${input.view}" is not offered for this room. Offered: ${views.join(', ') || 'none'}.`);
  const profile = Object.fromEntries(PROFILE_FIELDS.map(([key, from]) => [key, String(input.profile?.[from] ?? '').trim()])) as Profile;
  const missing = PROFILE_FIELDS.filter(([key]) => !profile[key]).map(([, from]) => from);
  if (missing.length) problems.push(`Missing profile details: ${missing.join(', ')}.`);
  if (problems.length) return { problems };
  return {
    problems,
    plan: {
      room,
      stay,
      profile,
      draft: {
        propertyHref: room.propertyHref,
        propertyName: room.propertyName,
        roomId: room.room.id,
        roomName: room.room.name,
        roomImage: room.image,
        roomHref: room.href,
        stayId: stay.id,
        stayLabel: `${stay.group} · ${stay.label}`,
        weeks: weeksOf(stay),
        weekly: stay.prices[room.room.id],
        currency: room.content.roomCurrency,
        checkIn: date,
        view,
      },
    },
  };
}

function autoResolve() {
  const [tool] = pendingTools();
  if (!tool) return;
  if (tool.name === 'get_customer_state') {
    resolveTool(tool.id, customerState());
  } else if (tool.name === 'request_sign_in' && getSession()) {
    const { email, saved_profile } = customerState();
    resolveTool(tool.id, { signed_in: true, email, already_signed_in: true, saved_profile });
  } else if (tool.name === 'confirm_booking') {
    const { problems } = planBooking(tool.input as BookingInput);
    if (problems.length) resolveTool(tool.id, { shown: false, problems }, {}, true);
  } else if (tool.name === 'show_rooms') {
    const ids = Array.isArray(tool.input.rooms) ? (tool.input.rooms as unknown[]).map(String) : [];
    const unknown = ids.filter((id) => !findRoom(id));
    if (!ids.length || unknown.length === ids.length) {
      resolveTool(tool.id, { shown: false, problem: `Unknown room ids: ${unknown.join(', ') || '(none given)'}. Use ids from the booking catalogue.` }, {}, true);
    }
  } else if (!['show_options', 'show_form', 'request_sign_in', 'submit_enquiry'].includes(tool.name)) {
    resolveTool(tool.id, `Unknown tool "${tool.name}".`, {}, true);
  }
}

// A page load can land with a lookup still unanswered (it was sent as the page changed)
if (state.messages.length) window.setTimeout(autoResolve, 0);

// ---- Quick replies and room cards: a reply can end with <rooms> and <options> blocks, which the panel shows
export type Reply = { body: string; options: string[]; rooms: string[] };
const BLOCK = /<(options|rooms)>([\s\S]*?)<\/\1>\s*$/i;

export function parseReply(text: string): Reply {
  let body = text;
  let options: string[] = [];
  let rooms: string[] = [];
  for (let m = body.match(BLOCK); m; m = body.match(BLOCK)) {
    const lines = m[2]
      .split(/[\n,]/)
      .map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
      .filter(Boolean);
    if (m[1].toLowerCase() === 'rooms') rooms = lines.slice(0, 4);
    else options = lines.filter((l) => l.length <= 80).slice(0, 6);
    body = body.slice(0, m.index).trimEnd();
  }
  // A block still being written (streaming) is not shown
  return { body: body.replace(/<(?:options|rooms)>[\s\S]*$/i, '').trimEnd(), options, rooms };
}
