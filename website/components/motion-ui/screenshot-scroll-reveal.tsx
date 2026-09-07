'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * ScreenshotScrollReveal — pinned scroll take-over stage.
 *
 * On scroll, the headline layer lifts away and fades while the screenshot
 * layer tilts upright (rotateX) and scales from a distant, small frame into
 * the centre of the viewport. Under "prefers-reduced-motion" the stage
 * renders as a static stacked section instead.
 *
 * The animation is driven by a plain requestAnimationFrame loop reading the
 * section's bounding rect — deterministic and immune to smooth-scroll (Lenis)
 * / framework quirks, matching the hand-rolled reveal pattern used across
 * this site.
 *
 * API mirrors Motion UI's `ScreenshotScrollReveal` component:
 *   headline        – block rendered in the headline layer (centred)
 *   screenshot      – block rendered in the screenshot layer (dashboard shot)
 *   ariaLabelledBy  – id of the heading, wired to aria-labelledby
 *   tiltSpeed       – rotateX depth multiplier (1 = default, 0 = starts flat)
 *   scaleSpeed      – scale/rest depth multiplier (1 = default, 0 = full size)
 *   headlineSpeed   – headline lift multiplier (1 = default, 0 = fades in place)
 */
export interface ScreenshotScrollRevealProps {
  headline: ReactNode;
  screenshot: ReactNode;
  ariaLabelledBy?: string;
  className?: string;
  tiltSpeed?: number;
  scaleSpeed?: number;
  headlineSpeed?: number;
}

const BASE_TILT_DEG = 20;
const BASE_SCALE = 0.65;
const BASE_LIFT = 160;
const BASE_TRAVEL = 64;
const BASE_Y_OFFSET = 0.85; // fraction of vh — dashboard starts fully below the fold

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduce;
}

export function ScreenshotScrollReveal({
  headline,
  screenshot,
  ariaLabelledBy,
  className = '',
  tiltSpeed = 1,
  scaleSpeed = 1,
  headlineSpeed = 1,
}: ScreenshotScrollRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const shotRef = useRef<HTMLDivElement | null>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const section = sectionRef.current;
      const headlineEl = headlineRef.current;
      const shotEl = shotRef.current;
      if (!section || !headlineEl || !shotEl) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const range = Math.max(1, rect.height - vh);
      const p = Math.min(1, Math.max(0, -rect.top / range));

      // Screenshot rises from below the viewport, tilts upright and scales
      // into centre — overlapping the headline as it recedes (demo choreography).
      const rot = BASE_TILT_DEG * tiltSpeed * (1 - p);
      const sc = BASE_SCALE * scaleSpeed + (1 - BASE_SCALE * scaleSpeed) * p;
      const sy = BASE_Y_OFFSET * vh * (1 - p);
      shotEl.style.transform = `translate3d(0, ${sy}px, 0) perspective(1400px) rotateX(${rot}deg) scale(${sc})`;

      // Headline recedes in place: slight lift, heavy blur, slow fade behind
      // the rising screenshot.
      const hy = -BASE_LIFT * 0.3 * headlineSpeed * p;
      const hop = Math.max(0, 1 - p * 1.15);
      headlineEl.style.transform = `translate3d(0, ${hy}px, 0)`;
      headlineEl.style.opacity = String(hop);
      headlineEl.style.filter = `blur(${12 * p}px)`;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, tiltSpeed, scaleSpeed, headlineSpeed]);

  if (reduce) {
    return (
      <section
        ref={sectionRef}
        aria-labelledby={ariaLabelledBy}
        className={`relative ${className}`}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-16 px-6 py-24 text-center">
          <div>{headline}</div>
          <div>{screenshot}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby={ariaLabelledBy}
      className={`relative h-[220vh] ${className}`}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center">
        {/* ── Screenshot layer (starts below the fold, rises over the headline) ── */}
        <div
          ref={shotRef}
          className="absolute inset-0 z-30 flex items-center justify-center px-6 py-16 md:px-16"
          style={{
            transform: `translate3d(0, 85vh, 0) perspective(1400px) rotateX(${BASE_TILT_DEG * tiltSpeed}deg) scale(${BASE_SCALE * scaleSpeed})`,
          }}
        >
          <div className="w-full max-w-6xl">{screenshot}</div>
        </div>

        {/* ── Headline layer (recedes behind the rising screenshot) ── */}
        <div
          ref={headlineRef}
          className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto px-6 py-16"
        >
          <div className="w-full">{headline}</div>
        </div>
      </div>
    </section>
  );
}