import './ui.css';

/** Previous / next chevron buttons for any carousel. */
export default function CarouselArrows({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  light,
  label = 'Browse',
  className,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  /** For use on a dark background. */
  light?: boolean;
  label?: string;
  className?: string;
}) {
  const icon = (d: string) => (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  return (
    <div className={`carousel-arrows${light ? ' carousel-arrows--light' : ''}${className ? ` ${className}` : ''}`} role="group" aria-label={label}>
      <button type="button" className="carousel-arrow" aria-label="Previous" disabled={!canPrev} onClick={onPrev}>
        {icon('M10 3L5 8l5 5')}
      </button>
      <button type="button" className="carousel-arrow" aria-label="Next" disabled={!canNext} onClick={onNext}>
        {icon('M6 3l5 5-5 5')}
      </button>
    </div>
  );
}
