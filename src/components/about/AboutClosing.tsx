import { useRef } from 'react';
import VLine from '../VLine';
import { useExitParallax } from '../../lib/useExitParallax';
import line from '../../assets/cta-line.svg';
import './AboutClosing.css';

/**
 * The fold before the footer (Figma 735:14011): a cream gradient with the gold line,
 * drifting undimmed as the footer slides over it so the two read as one surface.
 */
export default function AboutClosing() {
  const sectionRef = useRef<HTMLElement>(null);
  useExitParallax(sectionRef, { shade: false });
  return (
    <section ref={sectionRef} className="about-closing exit-parallax" aria-hidden>
      <div className="about-closing__content" data-exit-content>
        <VLine src={line} length={100} />
      </div>
    </section>
  );
}
