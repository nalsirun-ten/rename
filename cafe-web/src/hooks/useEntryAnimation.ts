import { useEffect, useState } from 'react';

/**
 * Defers a sheet's CSS entry animation until the freshly mounted content
 * has been styled, laid out and committed once (two animation frames).
 *
 * Heavy sheets (Roulette wheel SVG, image-rich modals) otherwise pay their
 * first-mount cost in the very frames the slide-up animation is playing,
 * which makes the FIRST open visibly stutter while subsequent opens are
 * smooth (glyph/raster/image caches are warm by then).
 *
 * Usage: render the sheet with its base classes only (overlay-base /
 * sheet-base keep it invisible and off-screen), then add the animation
 * class once this returns true.
 */
export function useEntryAnimation(active: boolean = true): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    // Safety net: rAF doesn't fire in hidden/throttled tabs — never leave
    // the sheet stuck off-screen.
    const fallback = setTimeout(() => setReady(true), 150);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(fallback);
    };
  }, [active]);

  return ready;
}
