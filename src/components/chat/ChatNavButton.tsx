import { setChatOpen, useChat } from '../../lib/chat';
import './ChatNavButton.css';

/**
 * The chat icon at the top right of the nav: always there to open (or close) the assistant,
 * including after the floating "Chat with us" pill has been dismissed.
 */
export default function ChatNavButton() {
  const { open } = useChat();
  return (
    <button
      type="button"
      className={`chat-nav${open ? ' is-open' : ''}`}
      aria-label={open ? 'Close chat' : 'Chat with us'}
      aria-haspopup="dialog"
      aria-expanded={open}
      title={open ? 'Close chat' : 'Chat with us'}
      onClick={() => setChatOpen(!open)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 5.5h16v10.5H11l-4.5 3.5V16H4z" />
        <path d="M8.5 10.7h7" />
      </svg>
    </button>
  );
}
