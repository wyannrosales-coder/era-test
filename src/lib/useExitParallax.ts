import type { RefObject } from 'react';
import { gsap, useGSAP } from './smoothScroll';

/**
 * Exit parallax between sections: as the section's bottom scrolls from the bottom of
 * the screen to the top, its `[data-exit-content]` lags behind (clipped by the
 * section, see `.exit-parallax`) and its `.exit-shade` dims it, so the next section
 * appears to slide over it. Pass `shade: false` to drift without dimming (for sections
 * meant to read as one with the next), or `drift: false` to only dim (for sections with
 * pinned content, which the drift would carry along). `lateOnPhones` holds the hand-over
 * on phones until the section's bottom is a third of the way down the screen, with a
 * lighter drift, so a form at its foot stays usable (`late` does the same on every
 * screen size); `driftOnPhones: false` only dims on
 * phones, for sections whose content runs to their bottom edge; `onPhones: false` skips it
 * on phones altogether. Skipped for reduced motion.
 */
export function useExitParallax(
  sectionRef: RefObject<HTMLElement>,
  {
    enabled = true,
    shade = true,
    drift = true,
    lateOnPhones = false,
    late: lateEverywhere = false,
    driftOnPhones = true,
    onPhones = true,
  }: {
    enabled?: boolean;
    shade?: boolean;
    drift?: boolean;
    lateOnPhones?: boolean;
    late?: boolean;
    driftOnPhones?: boolean;
    onPhones?: boolean;
  } = {},
) {
  useGSAP(
    () => {
      if (!enabled) return;
      gsap
        .matchMedia()
        .add(
          { motion: '(prefers-reduced-motion: no-preference)', phone: '(max-width: 700px)' },
          (ctx) => {
            const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
            if (!motion || (phone && !onPhones)) return;
            const late = lateEverywhere || (lateOnPhones && phone);
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: sectionRef.current,
                // clamp(): a short section at the top of a page starts undisturbed
                start: late ? 'clamp(bottom 33%)' : 'clamp(bottom bottom)',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
            if (drift && (driftOnPhones || !phone))
              tl.to(
                '[data-exit-content]',
                { y: () => window.innerHeight * (late ? 0.2 : 0.45) },
                0,
              );
            if (shade) tl.to('.exit-shade', { opacity: 0.35 }, 0);
          },
        );
    },
    {
      scope: sectionRef,
      dependencies: [enabled, shade, drift, lateOnPhones, lateEverywhere, driftOnPhones, onPhones],
    },
  );
}
