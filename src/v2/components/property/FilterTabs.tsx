import activeDot from '../../../assets/loc-active-dot.svg';
import './FilterTabs.css';

type FilterTabsProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Uppercase filter row with a bronze dot under the active option (as in Figma 539:13475). */
export default function FilterTabs({ label, options, value, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={`filter-tabs ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`filter-tabs__option${option === value ? ' is-active' : ''}`}
          aria-pressed={option === value}
          onClick={(e) => {
            // On phones the row scrolls sideways: bring a half-hidden tab fully into view
            const row = e.currentTarget.parentElement!;
            const tab = e.currentTarget.getBoundingClientRect();
            const box = row.getBoundingClientRect();
            const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
            const by = Math.min(0, tab.left - box.left - pad) || Math.max(0, tab.right - box.right + pad);
            if (by) row.scrollBy({ left: by, behavior: 'smooth' });
            onChange(option);
          }}
        >
          <span>{option}</span>
          <img src={activeDot} width={8} height={8} alt="" />
        </button>
      ))}
    </div>
  );
}
