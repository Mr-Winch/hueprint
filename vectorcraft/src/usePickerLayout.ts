import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import pickerStyles from '../../src/color-harmony-picker/ColorHarmonyPicker.module.css';

const portraitMedia = '(max-width: 719px), (orientation: portrait)';
const reducedMotion = '(prefers-reduced-motion: reduce)';
const movingParts = `.${pickerStyles.wheelWrap}, .${pickerStyles.activePanel}`;

export function usePickerLayout() {
  const [isPortrait, setPortrait] = useState(() => matchMedia(portraitMedia).matches);
  const workspace = useRef<HTMLDivElement>(null);
  const previousPositions = useRef<{ element: HTMLElement; rect: DOMRect }[]>([]);
  const animations = useRef<Animation[]>([]);

  useEffect(() => {
    const breakpoint = matchMedia(portraitMedia);
    const motion = matchMedia(reducedMotion);
    function cancelMotion() {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    }
    function changeLayout(event: MediaQueryListEvent) {
      // Read the current on-screen positions, including any in-flight transition.
      previousPositions.current = motion.matches || !workspace.current ? [] :
        [...workspace.current.querySelectorAll<HTMLElement>(movingParts)]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }));
      setPortrait(event.matches);
    }
    breakpoint.addEventListener('change', changeLayout);
    motion.addEventListener('change', cancelMotion);
    return () => {
      breakpoint.removeEventListener('change', changeLayout);
      motion.removeEventListener('change', cancelMotion);
      cancelMotion();
    };
  }, []);

  useLayoutEffect(() => {
    const before = previousPositions.current;
    previousPositions.current = [];
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    if (matchMedia(reducedMotion).matches) return;

    const offsets = before.map(({ element, rect }) => {
      const next = element.getBoundingClientRect();
      return { element, x: rect.left - next.left, y: rect.top - next.top };
    });
    for (const { element, x, y } of offsets) {
      if (Math.hypot(x, y) < 1 || typeof element.animate !== 'function') continue;
      animations.current.push(element.animate(
        [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }],
        { duration: 200, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' },
      ));
    }
  }, [isPortrait]);

  return { layout: isPortrait ? 'portrait' : 'horizontal', workspace } as const;
}
