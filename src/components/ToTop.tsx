import { useEffect, useState } from 'react';
import { scrollToY } from '../lib/smoothScroll';
import arrowUp from '../assets/property/icon-to-top.svg';
import './ToTop.css';

/**
 * Back to the top (Figma 1314:14892): a translucent chocolate square in the screen's
 * lower right that glides the page back to the hero. It fades in once the hero has
 * scrolled away and out again near the top.
 */
export default function ToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      className={`to-top${shown ? ' is-shown' : ''}`}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      onClick={() => scrollToY(0)}
    >
      <img src={arrowUp} width={36} height={36} alt="" />
    </button>
  );
}
