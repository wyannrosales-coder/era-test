import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, UIEvent } from 'react';
import Nav, { scrollToSection } from '../components/Nav';
import type { SubLink } from '../components/Nav';
import PropertyLocation from '../components/property/PropertyLocation';
import WhyLiving from '../components/why/WhyLiving';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import { ScrollTrigger, scrollToY, setScrollLocked } from '../lib/smoothScroll';
import { VIEWS } from '../components/property/roomDetails';
import type { RoomDetails } from '../components/property/roomDetails';
import type { PropertyContent, Room, RoomTag, Stay } from '../components/property/propertyContent';
import tagLightning from '../assets/property/rooms/tag-lightning.svg';
import tagStar from '../assets/property/rooms/tag-star.svg';
import tagTag from '../assets/property/rooms/tag-tag.svg';
import tagProhibit from '../assets/property/rooms/tag-prohibit.svg';
import tagGift from '../assets/property/rooms/tag-gift.svg';
import photosIcon from '../assets/property/room-details/icons/photos.svg';
import shareIcon from '../assets/property/room-details/icons/share.svg';
import arrowRight from '../assets/property/room-details/icons/arrow-right.svg';
import arrowLeft16 from '../assets/property/room-details/icons/arrow-left-16.svg';
import arrowRight16 from '../assets/property/room-details/icons/arrow-right-16.svg';
import share16 from '../assets/property/room-details/icons/share-16.svg';
import arrowWhite from '../assets/arrow-right-white.svg';
import sizeIcon from '../assets/property/room-details/icons/size.svg';
import checkIcon from '../assets/property/room-details/icons/check-circle.svg';
import dotIcon from '../assets/property/room-details/icons/dot.svg';
import roomSizeIcon from '../assets/property/room-details/amenities/room-size.svg';
import caretDown from '../assets/property/room-details/icons/caret-down.svg';
import downloadIcon from '../assets/property/room-details/icons/download.svg';
import dropdownIcon from '../assets/property/room-details/icons/dropdown.svg';
import calendarIcon from '../assets/property/room-details/icons/calendar.svg';
import infoIcon from '../assets/property/room-details/icons/info.svg';
import closeIcon from '../assets/menu/close.svg';
import './RoomPage.css';
import Select from '../components/ui/Select';
import DateField from '../components/ui/DateField';
import TourModal from '../components/ui/TourModal';

/** Section ids, shared by the sub-navigation and the sections themselves (Figma 1195:30270). */
const SECTIONS = {
  gallery: 'gallery',
  overview: 'overview',
  specs: 'specs',
  included: 'whats-included',
  floorPlan: 'floor-plan',
  location: 'location',
};
const SUB_LINKS: SubLink[] = [
  { label: 'Gallery', target: SECTIONS.gallery },
  { label: 'Overview', target: SECTIONS.overview },
  { label: 'Specs', target: SECTIONS.specs },
  { label: 'What’s included', target: SECTIONS.included },
  { label: 'Floor plan', target: SECTIONS.floorPlan },
  { label: 'Location', target: SECTIONS.location },
];
/** While the details scroll, the booking card is pinned under the sub-navigation alone. */
const BAR_HIDDEN_IN = [SECTIONS.overview, SECTIONS.specs, SECTIONS.included, SECTIONS.floorPlan];

const TAGS: Record<RoomTag, { label: string; icon: string }> = {
  offer: { label: 'Exclusive Offer', icon: tagLightning },
  popular: { label: 'Popular Choice', icon: tagStar },
  promotion: { label: 'Promotion', icon: tagTag },
  soldOut: { label: 'Sold Out', icon: tagProhibit },
  value: { label: 'Best Value', icon: tagGift },
};

/** The offers on every room (as on the live room pages); Short Stay only on the studios that have it. */
const ROOM_OFFERS = [
  { title: 'Limited Time Free Weeks Offer', text: 'Get up to 2 weeks free for selected room types; up to 6 weeks for Signature Studio (City & Pool)' },
  { title: 'Refer a Friend - Double the Joy, $600 in Rewards!', text: 'Double the Joy, $600 in Rewards!' },
  { title: 'Pay in Full, Save $500', text: 'Pay in Full, Save $500 — Your Best Start to Student Living' },
  { title: 'Save Up to $40/week on Your Commute', text: 'Up to $40/week transportation allowance (T&C apply)' },
];

/** Each amenity's icon (Figma 1220:8424), by name. */
const AMENITY_ICONS = import.meta.glob<string>('../assets/property/room-details/amenities/*.svg', {
  eager: true,
  import: 'default',
});
const AMENITY_FILE: Record<string, string> = {
  'Double Bed': 'bed',
  'King Single': 'bed',
  Storage: 'storage',
  'Study Desk & Chair': 'desk',
  Microwave: 'microwave',
  Fridge: 'fridge',
  Cooktop: 'cooktop',
  'Range hood': 'rangehood',
  Kettle: 'kettle',
  'Rice Cooker or Toaster': 'ricecooker',
  Dishwasher: 'microwave',
  WiFi: 'wifi',
  Television: 'tv',
  'Air Con': 'aircon',
  'Smart Door Access': 'door',
};
const amenityIcon = (name: string) =>
  AMENITY_ICONS[`../assets/property/room-details/amenities/${AMENITY_FILE[name] ?? 'door'}.svg`];

/** Amenity groups shown before "Show all amenities" (Figma 1220:8424). */
const AMENITY_GROUPS_SHOWN = 2;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const latest = (a: string, b: string) => (a > b ? a : b);
const stayLabel = (s: Stay) => (s.group === 'Short Stay' ? `Short Stay · ${s.label}` : `${s.group.replace('Academic Year', 'AY')} · ${s.label}`);

/** The live site's booking for this room, term and date (until this site has its own). */
const liveBookingHref = (slug: string, stay: Stay, date: string) =>
  `https://epiisod.com/en-au/sydney/epiisod-macquarie-park/${slug}?term_id=${stay.id}&check_in_date=${date.replace(/-/g, '_')}`;

/** Before opening: the live site's enquiry form for the property, term and date. */
const registerHref = (liveUrl: string, property: string, stay: Stay | null, date: string) => {
  const params = new URLSearchParams({ property_inquiring_for: property });
  if (stay) params.set('term_id', stay.id);
  if (date) params.set('check_in_date', date.replace(/-/g, '_'));
  return `${new URL(liveUrl).origin}/en-au/contact?${params}`;
};

/** Every photo, full screen: arrows, keyboard or thumbnails to move; Escape to close. */
function Lightbox({ photos, start, name, onClose }: { photos: string[]; start: number; name: string; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const step = useCallback((dir: number) => setIndex((i) => (i + dir + photos.length) % photos.length), [photos.length]);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setScrollLocked(true);
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, step]);
  return (
    <div className="room-lightbox" role="dialog" aria-modal="true" aria-label={`${name} photos`} data-lenis-prevent>
      <div className="room-lightbox__top">
        <p className="room-lightbox__count">
          {index + 1} / {photos.length}
        </p>
        <button ref={closeRef} type="button" className="room-lightbox__close" aria-label="Close photos" onClick={onClose}>
          <img src={closeIcon} width={24} height={24} alt="" />
        </button>
      </div>
      <div className="room-lightbox__stage">
        <button type="button" className="room-lightbox__arrow" aria-label="Previous photo" onClick={() => step(-1)}>
          <img src={arrowWhite} width={24} height={24} alt="" style={{ transform: 'scaleX(-1)' }} />
        </button>
        <img key={index} className="room-lightbox__image" src={photos[index]} alt={`${name}, photo ${index + 1}`} />
        <button type="button" className="room-lightbox__arrow" aria-label="Next photo" onClick={() => step(1)}>
          <img src={arrowWhite} width={24} height={24} alt="" />
        </button>
      </div>
      <div className="room-lightbox__thumbs">
        {photos.map((p, i) => (
          <button
            key={p}
            type="button"
            className={`room-lightbox__thumb${i === index ? ' is-current' : ''}`}
            aria-label={`Photo ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          >
            <img src={p} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** How far the plan zooms in when it's clicked in the viewer. */
const PLAN_ZOOM = 2.4;

/**
 * The floor plan, full screen: click (or tap) to zoom in where you point, then move the
 * pointer to look around; click again to zoom out. Escape or the cross closes it.
 */
function PlanViewer({ src, name, download, onClose }: { src: string; name: string; download: string; onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setScrollLocked(true);
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  const aim = (e: { currentTarget: HTMLElement; clientX: number; clientY: number }) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setOrigin(`${x}% ${y}%`);
  };
  return (
    <div className="room-plan-viewer" role="dialog" aria-modal="true" aria-label={`Floor plan of the ${name}`} data-lenis-prevent>
      <div className="room-lightbox__top">
        <p className="room-plan-viewer__hint">{zoomed ? 'Move to look around · click to zoom out' : 'Click the plan to zoom in'}</p>
        <div className="room-plan-viewer__actions">
          <a href={download} download className="room-plan-viewer__download">
            Download PDF
          </a>
          <button ref={closeRef} type="button" className="room-lightbox__close" aria-label="Close floor plan" onClick={onClose}>
            <img src={closeIcon} width={24} height={24} alt="" />
          </button>
        </div>
      </div>
      <button
        type="button"
        className={`room-plan-viewer__stage${zoomed ? ' is-zoomed' : ''}`}
        aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        onClick={(e) => {
          aim(e);
          setZoomed((z) => !z);
        }}
        onPointerMove={(e) => zoomed && aim(e)}
      >
        <img
          src={src}
          alt={`Floor plan of the ${name}`}
          style={{ transformOrigin: origin, transform: zoomed ? `scale(${PLAN_ZOOM})` : undefined }}
        />
      </button>
    </div>
  );
}

/** "Book this room" (Figma 1195:27652): term, check-in date and room view, the price, and Book. */
function BookingCard({
  room,
  details,
  stays,
  currency,
  stayId,
  setStayId,
  date,
  setDate,
  opening,
  registerLink,
}: {
  room: Room;
  details: RoomDetails;
  stays: Stay[];
  currency: string;
  stayId: string;
  setStayId: (id: string) => void;
  date: string;
  setDate: (date: string) => void;
  /** Before bookings open: shown in place of the price, with Register interest instead of Book. */
  opening?: string;
  registerLink?: (stay: Stay | null, date: string) => string;
}) {
  const [view, setView] = useState('');
  const [tried, setTried] = useState(false);
  const stay = stays.find((s) => s.id === stayId) ?? null;
  const price = stay ? stay.prices[room.id] : room.price;
  const min = stay ? latest(today(), stay.checkIn.from) : today();
  const max = stay?.checkIn.to;
  const groups = [...new Set(stays.map((s) => s.group))];
  const hasViews = details.views.length > 0;
  const missing = { term: !stay, date: !date, view: hasViews && !view };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!stay || !date || missing.view || !room.available) return;
    // TODO: this site's own booking flow; until then, the live booking (or, before opening,
    // its enquiry form) for these choices
    const href = opening && registerLink ? registerLink(stay, date) : liveBookingHref(details.slug, stay, date);
    window.open(href, '_blank', 'noopener');
  };

  return (
    <form className="room-book" onSubmit={onSubmit} noValidate>
      <h2 className="room-book__title">
        <em>Book</em> this room
      </h2>
      <p className="room-book__required">
        <span>*</span> <em>Required field</em>
      </p>

      <label className={`room-book__field${tried && missing.term ? ' has-error' : ''}`}>
        <span className="room-book__label">
          Term <span>*</span>
        </span>
        <span className="room-book__control">
          <Select
            value={stayId}
            onChange={(e) => {
              const next = stays.find((s) => s.id === e.target.value);
              setStayId(e.target.value);
              if (next && date && (date < next.checkIn.from || date > next.checkIn.to)) setDate('');
            }}
            className={stayId ? '' : 'is-empty'}
          >
            <option value="" disabled>
              Choose term
            </option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {stays
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {stayLabel(s)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
          <img src={dropdownIcon} width={24} height={24} alt="" />
        </span>
        {tried && missing.term && <span className="room-book__error">Please choose a term</span>}
      </label>

      <label className={`room-book__field${tried && missing.date ? ' has-error' : ''}`}>
        <span className="room-book__label">
          Check in date <span>*</span>
        </span>
        <span className="room-book__control">
          <DateField
            value={date}
            min={min}
            max={max}
            placeholder="Choose your check in date"
            className={date ? '' : 'is-empty'}
            onChange={setDate}
          />
          <img src={calendarIcon} width={24} height={24} alt="" />
        </span>
        {stay && (
          <span className="room-book__hint">
            Check-in from {new Date(`${min}T00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} to{' '}
            {new Date(`${stay.checkIn.to}T00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {tried && missing.date && <span className="room-book__error">Please choose your check in date</span>}
      </label>

      {hasViews && (
      <label className={`room-book__field${tried && missing.view ? ' has-error' : ''}`}>
        <span className="room-book__label">
          Preferred room view <span>*</span>
        </span>
        <span className="room-book__control">
          <Select value={view} onChange={(e) => setView(e.target.value)} className={view ? '' : 'is-empty'}>
            <option value="" disabled>
              Select room view
            </option>
            {details.views.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
          <img src={dropdownIcon} width={24} height={24} alt="" />
        </span>
        {view && <span className="room-book__hint">{VIEWS[view as keyof typeof VIEWS].hint}</span>}
        {tried && missing.view && <span className="room-book__error">Please select a room view</span>}
      </label>
      )}

      {details.dualOccupancy && (
        <div className="room-book__note">
          <p className="room-book__note-title">
            <img src={infoIcon} width={24} height={24} alt="" />
            Dual occupancy is available on this room type
          </p>
          <p className="room-book__note-text">
            An additional charge of {currency}
            {details.dualOccupancy} per week applies. The second occupant must also be a student and provide a valid
            student ID. You can add an occupant on the application form.
          </p>
        </div>
      )}

      <div className="room-book__summary">
        {opening ? (
          <p className="room-book__price room-book__price--opening">{opening}</p>
        ) : (
          <p className="room-book__price">
            <span className="room-book__from">From</span>
            <span className="room-book__amount">
              <strong>
                {currency} {price}
              </strong>
              <span>wk / person</span>
            </span>
          </p>
        )}
        <button type="submit" className="room-book__submit" disabled={!room.available}>
          {!room.available ? 'Sold out' : opening ? 'Register interest' : 'Book'}
          {room.available && <img src={arrowWhite} width={24} height={24} alt="" />}
        </button>
      </div>
    </form>
  );
}

/**
 * A room's page (Figma 1195:26614), reached from its card in Rooms: breadcrumbs, the photo
 * gallery (all photos open full screen), then the room's overview, specs, what's included and
 * floor plan beside the "Book this room" card, which stays pinned while they scroll; then the
 * neighbourhood map, the "Write your story" band and the footer. The sub-navigation follows
 * the sections (Figma 1195:30058). A term and date chosen in Rooms carry over to the card.
 */
export default function RoomPage({
  content,
  details,
  propertyHref,
}: {
  content: PropertyContent;
  details: RoomDetails;
  propertyHref: string;
}) {
  const room = content.rooms.find((r) => r.id === details.roomId)!;
  // The virtual tour opens over the page, full screen
  const [tourOpen, setTourOpen] = useState(false);
  const openTour = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setTourOpen(true);
  };
  const closeTour = useCallback(() => setTourOpen(false), []);
  // The terms this room can be booked for
  const stays = useMemo(() => content.stays.filter((s) => s.prices[room.id] !== undefined), [content.stays, room.id]);
  const params = new URLSearchParams(window.location.search);
  const [stayId, setStayId] = useState(() => (stays.some((s) => s.id === params.get('term')) ? params.get('term')! : ''));
  const [date, setDate] = useState(() => params.get('date') ?? '');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const [amenitiesHeights, setAmenitiesHeights] = useState({ shown: 0, all: 0 });
  // Specs are key features, views and the virtual tour; a room with none skips the heading
  const hasSpecs = details.keyFeatures.length > 0 || details.views.length > 0 || !!details.virtualTour;
  const tagId = room.available ? room.tag : 'soldOut';
  const tag = tagId ? TAGS[tagId] : undefined;
  // Before opening there are no offers to show
  const offers = content.opening ? [] : ROOM_OFFERS;

  // The amenity list's height with the first groups, and with all of them, for the fold
  useLayoutEffect(() => {
    const list = amenitiesRef.current;
    if (!list) return;
    const measure = () => {
      const groups = list.querySelectorAll<HTMLElement>('.room-amenities__group');
      const last = groups[Math.min(AMENITY_GROUPS_SHOWN, groups.length) - 1];
      setAmenitiesHeights({
        // The first groups in full, with room for the fade below them
        shown: last ? last.offsetTop + last.offsetHeight + 48 : list.scrollHeight,
        all: list.scrollHeight,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);
  const foldable = amenitiesHeights.all > amenitiesHeights.shown + 1;

  // Folding the list changes the page's height: re-measure the scroll animations once it settles
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => window.clearTimeout(t);
  }, [amenitiesOpen]);

  const toggleAmenities = () => {
    if (amenitiesOpen) {
      // Folding: keep the list's heading in view rather than leaving the page far below it
      const section = document.getElementById(SECTIONS.included);
      if (section && section.getBoundingClientRect().top < 0) scrollToSection(SECTIONS.included);
    }
    setAmenitiesOpen((o) => !o);
  };

  const share = async () => {
    const url = window.location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: `${room.name} · ${content.brand} ${content.place}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Sharing cancelled or unavailable: nothing to do
    }
  };

  const gallery = details.photos.slice(0, 5);
  // Phones: the photo the carousel has settled on, for its counter
  const [slide, setSlide] = useState(0);
  const onCarouselScroll = (e: UIEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    setSlide(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
  };
  const bookRef = useRef<HTMLDivElement>(null);
  // The bar below steps aside while the card it leads to is on screen
  const [bookInView, setBookInView] = useState(false);
  useEffect(() => {
    const card = bookRef.current;
    if (!card) return;
    const io = new IntersectionObserver(([entry]) => setBookInView(entry.isIntersecting));
    io.observe(card);
    return () => io.disconnect();
  }, []);
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: content.city, href: `/find-a-room?city=${content.city.toLowerCase()}` },
    { label: content.place, href: propertyHref },
  ];

  return (
    <>
      <Nav tone="cream" subLinks={hasSpecs ? SUB_LINKS : SUB_LINKS.filter((l) => l.target !== SECTIONS.specs)} hideBarAfter={SECTIONS.overview} barHiddenIn={BAR_HIDDEN_IN} />
      <main className="room-page">
        <section className="room-top" id={SECTIONS.gallery}>
          <nav className="room-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c) => (
              <span key={c.label}>
                <a href={c.href}>{c.label}</a>
                <span className="room-crumbs__slash" aria-hidden>
                  /
                </span>
              </span>
            ))}
            <span aria-current="page">{room.name}</span>
          </nav>

          {/* Figma 1195:28348: the lead photo beside four more; any of them opens the rest */}
          <div className="room-gallery">
            {gallery.map((photo, i) => (
              <button
                key={photo}
                type="button"
                className={`room-gallery__photo room-gallery__photo--${i + 1}`}
                aria-label={`Open photo ${i + 1} of ${details.photos.length}`}
                onClick={() => setLightbox(i)}
              >
                <img src={photo} alt="" />
              </button>
            ))}
            {tag && (
              <span className={`room-tag room-tag--${tagId} room-gallery__tag`}>
                <img src={tag.icon} width={16} height={16} alt="" />
                {tag.label}
              </span>
            )}
            <button type="button" className="room-gallery__all" onClick={() => setLightbox(0)}>
              <img src={photosIcon} width={24} height={24} alt="" />
              See all photos
            </button>
          </div>

          {/* Phones (Figma 1328:15867): every photo full width, swiped through, with the way
              back, the virtual tour and sharing over the top and the count below */}
          <div className="room-carousel">
            <div className="room-carousel__track" onScroll={onCarouselScroll}>
              {details.photos.map((photo, i) => (
                <button
                  key={photo}
                  type="button"
                  className="room-carousel__photo"
                  aria-label={`Open photo ${i + 1} of ${details.photos.length}`}
                  onClick={() => setLightbox(i)}
                >
                  <img src={photo} alt="" loading={i > 1 ? 'lazy' : undefined} />
                </button>
              ))}
            </div>
            <div className="room-carousel__top">
              <a href={`${propertyHref}#rooms`} className="room-chip room-chip--icon" aria-label={`Back to ${content.brand} ${content.place} rooms`}>
                <img src={arrowLeft16} width={16} height={16} alt="" />
              </a>
              <div className="room-carousel__actions">
                {details.virtualTour && (
                <a href={details.virtualTour} className="room-chip" onClick={openTour}>
                  Virtual tour
                  <img src={arrowRight16} width={16} height={16} alt="" />
                </a>
                )}
                <button
                  type="button"
                  className={`room-chip${copied ? '' : ' room-chip--icon'}`}
                  aria-label={copied ? undefined : 'Share'}
                  onClick={share}
                >
                  {copied && 'Link copied'}
                  <img src={share16} width={16} height={16} alt="" />
                </button>
              </div>
            </div>
            <div className="room-carousel__bottom">
              {tag && (
                <span className={`room-tag room-tag--${tagId}`}>
                  <img src={tag.icon} width={16} height={16} alt="" />
                  {tag.label}
                </span>
              )}
              <span className="room-carousel__count" aria-live="polite">
                {Math.min(slide, details.photos.length - 1) + 1}/{details.photos.length}
              </span>
            </div>
          </div>
        </section>

        <div className="room-body">
          <div className="room-main">
            <section className="room-section" id={SECTIONS.overview}>
              <div className="room-section__head">
                <p className="room-section__eyebrow">Overview</p>
                <div className="room-actions">
                  <button type="button" className="room-link" onClick={share}>
                    {copied ? 'Link copied' : 'Share'}
                    <img src={shareIcon} width={24} height={24} alt="" />
                  </button>
                  {details.virtualTour && (
                  <a href={details.virtualTour} className="room-link" onClick={openTour}>
                    Virtual tour
                    <img src={arrowRight} width={24} height={24} alt="" />
                  </a>
                  )}
                </div>
              </div>
              <div className="room-overview">
                <div className="room-overview__heading">
                  <h1 className="room-overview__name">{room.name}</h1>
                  <p className="room-overview__subtitle">{details.subtitle}</p>
                  <p className="room-overview__size">
                    <img src={sizeIcon} width={24} height={24} alt="" />
                    {details.size}
                  </p>
                </div>
                <p className="room-overview__text">{details.description}</p>
                {offers.length > 0 && (
                <div className="room-offers">
                  <span className="room-tag room-tag--offer">
                    <img src={tagLightning} width={16} height={16} alt="" />
                    Exclusive Offer
                  </span>
                  <ul className="room-offers__list">
                    {offers.map((o) => (
                      <li key={o.title} className="room-check">
                        <img src={checkIcon} width={24} height={24} alt="" />
                        <span>
                          <strong>{o.title}</strong>
                          <span>{o.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                )}
              </div>
            </section>

            <section className="room-section" id={SECTIONS.specs}>
              {hasSpecs && <p className="room-section__eyebrow">Specs</p>}
              {details.keyFeatures.length > 0 && (
              <div className="room-block">
                <h2 className="room-block__title">Key features</h2>
                <ul className="room-features">
                  {details.keyFeatures.map((f) => (
                    <li key={f}>
                      <img src={dotIcon} width={6} height={6} alt="" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              )}
              {details.views.length > 0 && (
              <div className="room-block">
                <h2 className="room-block__title">Unit orientation &amp; views</h2>
                <ul className="room-views">
                  {details.views.map((v) => (
                    <li key={v} className="room-view">
                      <img src={VIEWS[v].image} alt="" />
                      <span className="room-view__shade" aria-hidden />
                      <span className="room-view__title">{VIEWS[v].title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              )}
              {details.virtualTour && (
              <a href={details.virtualTour} className="room-button" onClick={openTour}>
                Virtual tour
                <img src={arrowRight} width={24} height={24} alt="" />
              </a>
              )}
              <p className="room-disclaimer">
                <img src={infoIcon} width={24} height={24} alt="" />
                Disclaimer: Images, videos, and virtual tours are for reference only. Actual room sizes, layouts, and
                furnishings may vary.
              </p>
            </section>

            <section className="room-section" id={SECTIONS.included}>
              <p className="room-section__eyebrow">What’s included</p>
              <h2 className="room-block__title">Room amenities included</h2>
              {/* Folded to its first groups, fading out; it opens to all (Figma 1195:30456) */}
              <div
                ref={amenitiesRef}
                className={`room-amenities${foldable && !amenitiesOpen ? ' is-folded' : ''}`}
                style={foldable ? { maxHeight: amenitiesOpen ? amenitiesHeights.all : amenitiesHeights.shown } : undefined}
              >
                {details.amenities.map((g, gi) => (
                  <div
                    key={g.name}
                    className="room-amenities__group"
                    aria-hidden={foldable && !amenitiesOpen && gi >= AMENITY_GROUPS_SHOWN ? true : undefined}
                  >
                    <h3 className="room-amenities__name">{g.name}</h3>
                    <ul className="room-amenities__list">
                      {g.items.map((item) => (
                        <li key={item} className="room-amenity">
                          <img src={amenityIcon(item)} width={18} height={18} alt="" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {foldable && (
                <button type="button" className="room-button" aria-expanded={amenitiesOpen} onClick={toggleAmenities}>
                  {amenitiesOpen ? 'Show less amenities' : 'Show all amenities'}
                  <img className={`room-button__caret${amenitiesOpen ? ' is-up' : ''}`} src={caretDown} width={24} height={24} alt="" />
                </button>
              )}
            </section>

            <section className="room-section room-section--last" id={SECTIONS.floorPlan}>
              <p className="room-section__eyebrow">Floor plan</p>
              <div className="room-plan">
                {/* Opens the plan full screen, to zoom into */}
                <button
                  type="button"
                  className="room-plan__image"
                  aria-label={`Magnify the floor plan of the ${room.name}`}
                  onClick={() => setPlanOpen(true)}
                >
                  <img src={details.floorPlan} alt="" />
                  {/* Figma 1221:8677: the expand icon on a cream square, top right */}
                  <span className="room-plan__magnify" aria-hidden>
                    <img src={sizeIcon} width={24} height={24} alt="" />
                  </span>
                </button>
                <div className="room-plan__details">
                <div className="room-plan__text">
                  {/* The room, then the whole apartment where it's shared (Figma 1195:29106) */}
                  {details.size.split(' / ').map((size, i) => (
                    <p key={size} className="room-plan__size">
                      <img src={i === 0 ? roomSizeIcon : sizeIcon} width={24} height={24} alt="" />
                      {size}
                    </p>
                  ))}
                  <p className="room-plan__note">{details.floorPlanNote}</p>
                  <p className="room-plan__caption">
                    Plan available for {room.name} at {content.brand} {content.place}.
                  </p>
                </div>
                <a href={details.floorPlanPdf} download={`${details.slug}-floor-plan.pdf`} className="room-button">
                  Download floor plan
                  <img src={downloadIcon} width={24} height={24} alt="" />
                </a>
                </div>
              </div>
            </section>
          </div>

          <aside ref={bookRef} className="room-aside" id="book">
            <BookingCard
              room={room}
              details={details}
              stays={stays}
              currency={content.roomCurrency}
              stayId={stayId}
              setStayId={setStayId}
              date={date}
              setDate={setDate}
              opening={content.opening}
              registerLink={
                content.opening && content.liveUrl && content.slug
                  ? (s, d) => registerHref(content.liveUrl!, content.slug!, s, d)
                  : undefined
              }
            />
          </aside>
        </div>

        {/* Tablets and phones: the price and Book stay in reach, leading to the card */}
        <div className={`room-bookbar${bookInView ? ' room-bookbar--hidden' : ''}`}>
          {content.opening ? (
            <p className="room-bookbar__price">
              <strong>{content.opening}</strong>
            </p>
          ) : (
            <p className="room-bookbar__price">
              <span>From</span>
              <strong>
                {content.roomCurrency} {stays.find((s) => s.id === stayId)?.prices[room.id] ?? room.price}
              </strong>
              <span>wk / person</span>
            </p>
          )}
          <button
            type="button"
            className="room-book__submit"
            onClick={() => {
              const card = bookRef.current;
              if (card) scrollToY(card.getBoundingClientRect().top + window.scrollY - 80);
            }}
          >
            {content.opening ? 'Register interest' : 'Book'}
            <img src={arrowWhite} width={24} height={24} alt="" />
          </button>
        </div>

        <PropertyLocation id={SECTIONS.location} content={content} />
        <WhyLiving />
        <AboutClosing />
      </main>
      {tourOpen && details.virtualTour && <TourModal url={details.virtualTour} title={room.name} onClose={closeTour} />}
      <Footer />
      {planOpen && (
        <PlanViewer
          src={details.floorPlan}
          name={room.name}
          download={details.floorPlanPdf}
          onClose={() => setPlanOpen(false)}
        />
      )}
      {lightbox !== null && (
        <Lightbox photos={details.photos} start={lightbox} name={room.name} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
