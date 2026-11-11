import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

export type FloatPos = { left: number; top: number; width: number; flip: boolean };

/**
 * Position a popup under (or, when there's no room, above) an anchor element, in viewport
 * coordinates, for use with a portal. Follows the anchor on resize and scroll.
 */
export function useFloating(open: boolean, anchor: RefObject<HTMLElement | null>, height = 320): FloatPos | null {
  const [pos, setPos] = useState<FloatPos | null>(null);
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const update = () => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const flip = below < Math.min(height, 240) && r.top > below;
      setPos({ left: r.left, top: flip ? r.top : r.bottom, width: r.width, flip });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchor, height]);
  return pos;
}
