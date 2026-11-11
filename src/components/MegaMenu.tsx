import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './MegaMenu.css';

type MegaMenuProps = {
  /** id of the open panel, or null when closed. */
  activeId: string | null;
  children: ReactNode;
};

/**
 * Shared shell for the nav's mega menus (Figma 539:18628, 539:20915). Every panel is
 * stacked in one container whose height eases to fit the open panel, so switching
 * menus morphs from one to the other while the contents crossfade — it never
 * closes in between.
 */
export default function MegaMenu({ activeId, children }: MegaMenuProps) {
  const panelsRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const panels = panelsRef.current;
    const panel = activeId ? document.getElementById(activeId) : null;
    if (!panels || !panel) {
      setHeight(0);
      return;
    }
    // Panel plus the divider above it; re-measured if the layout reflows.
    const measure = () => setHeight(panel.offsetHeight + panels.clientTop);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => ro.disconnect();
  }, [activeId]);

  return (
    <div className={`mega-menu${activeId ? ' is-open' : ''}`} style={{ height }}>
      <div ref={panelsRef} className="mega-menu__panels">
        {children}
      </div>
    </div>
  );
}

type MegaMenuPanelProps = {
  id: string;
  open: boolean;
  heading: string;
  children: ReactNode;
};

/** One menu's content: an eyebrow heading followed by its links. */
export function MegaMenuPanel({ id, open, heading, children }: MegaMenuPanelProps) {
  return (
    <div id={id} className={`mega-menu__panel${open ? ' is-open' : ''}`}>
      <p className="type-h6 mega-menu__heading">{heading}</p>
      {children}
    </div>
  );
}
