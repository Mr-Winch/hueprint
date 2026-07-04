import { clamp, hexToOklch, lerp, makeGeneratedColor, normalizeHue } from "./colorHarmony.math";
import { GeneratedColor } from "./colorHarmony.types";

export function generateTints(color: string, count: number): GeneratedColor[] {
  const base = hexToOklch(color);
  return Array.from({ length: clamp(Math.floor(count), 2, 8) }, (_, index) => {
    const t = (index + 1) / count;
    return makeGeneratedColor("tint", index, {
      l: lerp(base.l, 0.96, t),
      c: base.c * (1 - 0.35 * t),
      h: normalizeHue(base.h),
    }, "tint");
  });
}

export function generateShades(color: string, count: number): GeneratedColor[] {
  const base = hexToOklch(color);
  return Array.from({ length: clamp(Math.floor(count), 2, 8) }, (_, index) => {
    const t = (index + 1) / count;
    return makeGeneratedColor("shade", index, {
      l: lerp(base.l, 0.12, t),
      c: base.c * (1 - 0.25 * t),
      h: normalizeHue(base.h),
    }, "shade");
  });
}

export function generateTones(color: string, count: number): GeneratedColor[] {
  const base = hexToOklch(color);
  return Array.from({ length: clamp(Math.floor(count), 2, 8) }, (_, index) => {
    const t = (index + 1) / count;
    return makeGeneratedColor("tone", index, {
      l: base.l,
      c: lerp(base.c, 0.02, t),
      h: normalizeHue(base.h),
    }, "tone");
  });
}
