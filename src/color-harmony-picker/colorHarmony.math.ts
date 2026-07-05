import { GeneratedColor, GeneratedColorSource, HarmonyRule } from "./colorHarmony.types";

export type OklchColor = {
  l: number;
  c: number;
  h: number;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Hsl = {
  h: number;
  s: number;
  l: number;
};

export type CustomHarmonyTransform = {
  dL: number;
  c: number;
  dH: number;
};

export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hueDistance(a: number, b: number) {
  const diff = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(diff, 360 - diff);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function polygonHues(anchorHue: number, count: number): number[] {
  const safeCount = Math.max(1, Math.floor(count));
  const step = 360 / safeCount;
  return Array.from({ length: safeCount }, (_, i) => normalizeHue(anchorHue + step * i));
}

export function analogousHues(anchorHue: number, count: number): number[] {
  if (count <= 1) return [normalizeHue(anchorHue)];

  const spread = count <= 3 ? 60 : 80;
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return normalizeHue(anchorHue - spread / 2 + spread * t);
  });
}

export function complementaryHues(anchorHue: number, count: number): number[] {
  const h = normalizeHue(anchorHue);
  const patterns: Record<number, number[]> = {
    2: [h, h + 180],
    3: [h - 15, h, h + 180],
    4: [h - 15, h + 15, h + 165, h + 195],
    5: [h - 15, h, h + 15, h + 180, h],
    6: [h - 20, h, h + 20, h + 160, h + 180, h + 200],
  };
  return (patterns[clamp(Math.floor(count), 2, 6)] ?? patterns[2]).map(normalizeHue);
}

export function splitComplementaryHues(anchorHue: number, count: number): number[] {
  const h = normalizeHue(anchorHue);
  const patterns: Record<number, number[]> = {
    3: [h, h + 150, h + 210],
    4: [h - 20, h, h + 150, h + 210],
    5: [h - 20, h, h + 20, h + 150, h + 210],
    6: [h - 20, h, h + 20, h + 150, h + 180, h + 210],
  };
  const safeCount = clamp(Math.floor(count), 3, 6);
  return (patterns[safeCount] ?? patterns[3]).map(normalizeHue);
}

export function triadicHues(anchorHue: number, count = 3): number[] {
  const h = normalizeHue(anchorHue);
  const families = [h, h + 120, h + 240];
  if (count <= 3) return families.slice(0, Math.max(1, count)).map(normalizeHue);

  const extras: Record<number, number[]> = {
    4: [h],
    5: [h + 120, h + 240],
    6: [h, h + 120, h + 240],
  };
  return [...families, ...(extras[clamp(Math.floor(count), 4, 6)] ?? [])].map(normalizeHue);
}

export function squareHues(anchorHue: number): number[] {
  return [anchorHue, anchorHue + 90, anchorHue + 180, anchorHue + 270].map(normalizeHue);
}

export function rectangleTetradicHues(anchorHue: number, angle = 60): number[] {
  return [anchorHue, anchorHue + angle, anchorHue + 180, anchorHue + 180 + angle].map(normalizeHue);
}

export function isTonalRule(rule: HarmonyRule): boolean {
  return rule === "tint" || rule === "shade" || rule === "tone";
}

export function sanitizeHex(input: string, fallback = "#2f80ed"): string {
  const trimmed = input.trim();
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(trimmed);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase();

  const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(trimmed);
  if (full) return `#${full[1]}${full[2]}${full[3]}`.toUpperCase();

  return fallback.toUpperCase();
}

export function hexToRgb(hex: string): Rgb {
  const safe = sanitizeHex(hex);
  return {
    r: Number.parseInt(safe.slice(1, 3), 16) / 255,
    g: Number.parseInt(safe.slice(3, 5), 16) / 255,
    b: Number.parseInt(safe.slice(5, 7), 16) / 255,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toChannel = (value: number) => Math.round(clamp(value, 0, 1) * 255).toString(16).padStart(2, "0");
  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`.toUpperCase();
}

export function hexToHsl(hex: string, fallbackHue = 0): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta < 0.0001) return { h: normalizeHue(fallbackHue), s: 0, l };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = 60 * (((g - b) / delta) % 6);
  if (max === g) h = 60 * ((b - r) / delta + 2);
  if (max === b) h = 60 * ((r - g) / delta + 4);

  return { h: normalizeHue(h), s: clamp(s, 0, 1), l: clamp(l, 0, 1) };
}

export function hexToWheelHue(hex: string, fallbackHue = 0): number {
  return hexToHsl(hex, fallbackHue).h;
}

function hueToRgb(p: number, q: number, t: number): number {
  let next = t;
  if (next < 0) next += 1;
  if (next > 1) next -= 1;
  if (next < 1 / 6) return p + (q - p) * 6 * next;
  if (next < 1 / 2) return q;
  if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
  return p;
}

export function hslToHex({ h, s, l }: Hsl): string {
  const safeH = normalizeHue(h) / 360;
  const safeS = clamp(s, 0, 1);
  const safeL = clamp(l, 0, 1);

  if (safeS < 0.0001) return rgbToHex({ r: safeL, g: safeL, b: safeL });

  const q = safeL < 0.5 ? safeL * (1 + safeS) : safeL + safeS - safeL * safeS;
  const p = 2 * safeL - q;
  return rgbToHex({
    r: hueToRgb(p, q, safeH + 1 / 3),
    g: hueToRgb(p, q, safeH),
    b: hueToRgb(p, q, safeH - 1 / 3),
  });
}

export function setHslLightness(hex: string, lightness: number, fallbackHue = 0): string {
  const hsl = hexToHsl(hex, fallbackHue);
  return hslToHex({ ...hsl, l: clamp(lightness, 0, 1) });
}
function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

export function hexToOklch(hex: string, fallbackHue = 0): OklchColor {
  const rgb = hexToRgb(hex);
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(okA * okA + okB * okB);
  const hue = c < 0.0005 ? fallbackHue : normalizeHue((Math.atan2(okB, okA) * 180) / Math.PI);

  return { l: clamp(okL, 0, 1), c, h: hue };
}

function oklchToRgbRaw(color: OklchColor): Rgb {
  const hRad = (normalizeHue(color.h) * Math.PI) / 180;
  const a = color.c * Math.cos(hRad);
  const b = color.c * Math.sin(hRad);
  const l = clamp(color.l, 0, 1);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = lPrime ** 3;
  const mCubed = mPrime ** 3;
  const sCubed = sPrime ** 3;

  return {
    r: linearToSrgb(4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed),
    g: linearToSrgb(-1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed),
    b: linearToSrgb(-0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed),
  };
}

function rgbIsInGamut(rgb: Rgb): boolean {
  return rgb.r >= 0 && rgb.r <= 1 && rgb.g >= 0 && rgb.g <= 1 && rgb.b >= 0 && rgb.b <= 1;
}

export function fitOklchToSrgb(color: OklchColor): OklchColor {
  const fitted = { l: clamp(color.l, 0.08, 0.96), c: clamp(color.c, 0.02, 0.34), h: normalizeHue(color.h) };
  if (rgbIsInGamut(oklchToRgbRaw(fitted))) return fitted;

  let low = 0;
  let high = fitted.c;
  for (let i = 0; i < 18; i += 1) {
    const c = (low + high) / 2;
    if (rgbIsInGamut(oklchToRgbRaw({ ...fitted, c }))) low = c;
    else high = c;
  }
  return { ...fitted, c: Math.max(0.02, low) };
}

export function oklchToHex(color: OklchColor): string {
  return rgbToHex(oklchToRgbRaw(fitOklchToSrgb(color)));
}

export function makeGeneratedColor(
  rule: GeneratedColorSource,
  index: number,
  oklch: OklchColor,
  role: GeneratedColor["role"] = "harmony"
): GeneratedColor {
  const safeOklch = {
    l: clamp(oklch.l, 0.02, 0.98),
    c: clamp(oklch.c, 0, 0.34),
    h: normalizeHue(oklch.h),
  };
  const hex = oklchToHex(safeOklch);
  return makeGeneratedColorFromHex(rule, index, hex, role, safeOklch.h);
}

export function makeGeneratedColorFromHex(
  rule: GeneratedColorSource,
  index: number,
  hex: string,
  role: GeneratedColor["role"] = "harmony",
  fallbackHue = 0
): GeneratedColor {
  const safeHex = sanitizeHex(hex);
  const wheelHue = hexToWheelHue(safeHex, fallbackHue);
  return {
    id: `${rule}-${index}-${safeHex}`,
    hex: safeHex,
    oklch: hexToOklch(safeHex, wheelHue),
    hue: wheelHue,
    role,
    sourceRule: rule,
  };
}

function colorFromHue(rule: HarmonyRule, index: number, base: Hsl, hue: number, role: GeneratedColor["role"] = "harmony"): GeneratedColor {
  return makeGeneratedColorFromHex(rule, index, hslToHex({ ...base, h: hue }), role, hue);
}

function colorsFromHues(rule: HarmonyRule, base: Hsl, hues: number[]): GeneratedColor[] {
  return hues.map((hue, index) => {
    const isAnchor = Math.abs(normalizeHue(hue - base.h)) < 0.001 && index === 0;
    return colorFromHue(rule, index, base, hue, isAnchor ? "anchor" : "harmony");
  });
}

export function customHarmonyColors(color: string, transforms: CustomHarmonyTransform[], fallbackHue = 0): GeneratedColor[] {
  const anchor = hexToOklch(color, fallbackHue);
  return transforms.map((transform, index) => {
    const oklch = fitOklchToSrgb({
      l: clamp(anchor.l + transform.dL, 0.08, 0.96),
      c: clamp(anchor.c * transform.c, 0.02, 0.34),
      h: normalizeHue(anchor.h + transform.dH),
    });
    const isAnchor = Math.abs(transform.dL) < 0.001 && Math.abs(transform.c - 1) < 0.001 && hueDistance(transform.dH, 0) < 0.001;
    return makeGeneratedColor("custom", index, oklch, isAnchor ? "anchor" : "custom");
  });
}
export function generateHarmonyColors(color: string, rule: HarmonyRule, count: number, fallbackHue = 0): GeneratedColor[] {
  const safeCount = clamp(Math.floor(count), 2, 8);
  const baseOklch = hexToOklch(color, fallbackHue);
  const baseHsl = hexToHsl(color, fallbackHue);

  if (rule === "custom") return [makeGeneratedColorFromHex(rule, 0, color, "custom", baseHsl.h)];

  if (rule === "monochromatic") {
    return Array.from({ length: safeCount }, (_, index) => {
      const t = safeCount === 1 ? 0.5 : index / (safeCount - 1);
      const distanceFromCenter = Math.abs(t - 0.5) * 2;
      const l = baseOklch.l + lerp(-0.24, 0.24, t);
      const c = baseOklch.c * (1 - 0.32 * distanceFromCenter);
      return makeGeneratedColor(rule, index, { l, c, h: baseOklch.h }, index === Math.floor(safeCount / 2) ? "anchor" : "harmony");
    });
  }

  if (rule === "analogous") return colorsFromHues(rule, baseHsl, analogousHues(baseHsl.h, safeCount));
  if (rule === "polygon") return colorsFromHues(rule, baseHsl, polygonHues(baseHsl.h, safeCount));
  if (rule === "complementary") {
    return complementaryHues(baseHsl.h, clamp(safeCount, 2, 6)).map((hue, index) => {
      const isTone = safeCount === 5 && index === 4;
      return colorFromHue(rule, index, { ...baseHsl, s: isTone ? baseHsl.s * 0.18 : baseHsl.s }, hue, index === 1 ? "anchor" : "harmony");
    });
  }
  if (rule === "splitComplementary") return colorsFromHues(rule, baseHsl, splitComplementaryHues(baseHsl.h, clamp(safeCount, 3, 6)));
  if (rule === "triadic") {
    return triadicHues(baseHsl.h, clamp(safeCount, 3, 6)).map((hue, index) => {
      const tonalIndex = index - 3;
      const tonal = index >= 3;
      const lShift = tonalIndex === 0 ? -0.08 : tonalIndex === 1 ? 0.1 : 0;
      const sScale = tonalIndex === 0 ? 0.85 : tonalIndex === 1 ? 0.72 : 0.38;
      return colorFromHue(rule, index, { ...baseHsl, l: clamp(baseHsl.l + lShift, 0.08, 0.92), s: tonal ? baseHsl.s * sScale : baseHsl.s }, hue, index === 0 ? "anchor" : "harmony");
    });
  }
  if (rule === "square") {
    const hues = squareHues(baseHsl.h);
    const baseColors = colorsFromHues(rule, baseHsl, safeCount < 4 ? hues.slice(0, safeCount) : hues);
    if (safeCount <= 4) return baseColors;
    const extras = Array.from({ length: safeCount - 4 }, (_, index) =>
      colorFromHue(rule, index + 4, { ...baseHsl, l: clamp(baseHsl.l + (index % 2 ? 0.1 : -0.1), 0.08, 0.92), s: baseHsl.s * 0.55 }, hues[index % hues.length])
    );
    return [...baseColors, ...extras];
  }
  if (rule === "rectangleTetradic") {
    const hues = rectangleTetradicHues(baseHsl.h);
    const baseColors = colorsFromHues(rule, baseHsl, safeCount < 4 ? hues.slice(0, safeCount) : hues);
    if (safeCount <= 4) return baseColors;
    const extras = Array.from({ length: safeCount - 4 }, (_, index) =>
      colorFromHue(rule, index + 4, { ...baseHsl, s: baseHsl.s * (0.4 + index * 0.08) }, hues[index % hues.length])
    );
    return [...baseColors, ...extras];
  }

  return [makeGeneratedColorFromHex(rule, 0, color, "custom", baseHsl.h)];
}



