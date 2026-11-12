import type { Language } from '../lib/language';

/** A five-pointed star centred on (cx, cy), drawn as a polygon. */
const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return pts.join(' ');
};

/** The flag shown for each language: Australia (English), China (中文), India (हिन्दी). */
export default function Flag({ code, size = 22 }: { code: Language; size?: number }) {
  return (
    <svg className="flag" viewBox="0 0 30 20" width={size} height={(size * 2) / 3} aria-hidden focusable="false">
      <clipPath id={`flag-${code}`}>
        <rect width="30" height="20" rx="2.5" />
      </clipPath>
      <g clipPath={`url(#flag-${code})`}>
        {code === 'en' && (
          <>
            <rect width="30" height="20" fill="#012169" />
            {/* Union Jack in the canton */}
            <g>
              <path d="M0 0l15 10M15 0L0 10" stroke="#fff" strokeWidth="2" />
              <path d="M0 0l15 10M15 0L0 10" stroke="#c8102e" strokeWidth="0.8" />
              <path d="M7.5 0v10M0 5h15" stroke="#fff" strokeWidth="3.2" />
              <path d="M7.5 0v10M0 5h15" stroke="#c8102e" strokeWidth="1.8" />
            </g>
            <polygon points={star(7.5, 15.2, 2.6)} fill="#fff" />
            <polygon points={star(22.5, 3.4, 1.1)} fill="#fff" />
            <polygon points={star(26, 8, 1.1)} fill="#fff" />
            <polygon points={star(22.5, 15.5, 1.1)} fill="#fff" />
            <polygon points={star(19, 9, 1.1)} fill="#fff" />
            <polygon points={star(24.3, 10.5, 0.7)} fill="#fff" />
          </>
        )}
        {code === 'zh' && (
          <>
            <rect width="30" height="20" fill="#de2910" />
            <polygon points={star(5.5, 5.2, 3.2)} fill="#ffde00" />
            <polygon points={star(11, 2.2, 1)} fill="#ffde00" />
            <polygon points={star(13, 4.6, 1)} fill="#ffde00" />
            <polygon points={star(13, 7.6, 1)} fill="#ffde00" />
            <polygon points={star(11, 10, 1)} fill="#ffde00" />
          </>
        )}
        {code === 'hi' && (
          <>
            <rect width="30" height="6.67" fill="#ff9933" />
            <rect y="6.67" width="30" height="6.66" fill="#fff" />
            <rect y="13.33" width="30" height="6.67" fill="#138808" />
            <circle cx="15" cy="10" r="2.7" fill="none" stroke="#000080" strokeWidth="0.5" />
            <path
              d="M15 7.3v5.4M12.3 10h5.4M13.1 8.1l3.8 3.8M16.9 8.1l-3.8 3.8M12.6 9l4.8 2M17.4 9l-4.8 2M13.9 7.6l2.2 4.8M16.1 7.6l-2.2 4.8"
              stroke="#000080"
              strokeWidth="0.35"
            />
          </>
        )}
      </g>
      <rect width="30" height="20" rx="2.5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
    </svg>
  );
}
