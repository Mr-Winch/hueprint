import { ntcNames } from "./ntcNames.generated";

export type ColorNameStatus = "loading" | "resolved" | "unnamed" | "offline" | "unavailable";
export type ColorNames = { ntc: string; community: string; communityStatus: ColorNameStatus };

type PreparedName = {
  hex: string;
  name: string;
  rgb: readonly [number, number, number];
  hsl: readonly [number, number, number];
};

function normalizeHex(value: string) {
  const raw = value.trim().replace(/^#/, "").toUpperCase();
  if (!/^[\dA-F]{6}$/.test(raw)) throw new Error(`Invalid color: ${value}`);
  return `#${raw}`;
}

function rgbHsl(hex: string): { rgb: [number, number, number]; hsl: [number, number, number] } {
  const rgb = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as [number, number, number];
  const [red, green, blue] = rgb.map((channel) => channel / 255);
  const minimum = Math.min(red, green, blue);
  const maximum = Math.max(red, green, blue);
  const delta = maximum - minimum;
  const lightness = (minimum + maximum) / 2;
  let saturation = 0;
  let hue = 0;
  if (lightness > 0 && lightness < 1) saturation = delta / (lightness < 0.5 ? 2 * lightness : 2 - 2 * lightness);
  if (delta > 0) {
    if (maximum === red && maximum !== green) hue += (green - blue) / delta;
    if (maximum === green && maximum !== blue) hue += 2 + (blue - red) / delta;
    if (maximum === blue && maximum !== red) hue += 4 + (red - green) / delta;
    hue /= 6;
  }
  return { rgb, hsl: [Math.trunc(hue * 255), Math.trunc(saturation * 255), Math.trunc(lightness * 255)] };
}

const preparedNames: PreparedName[] = ntcNames.map(([rawHex, name]) => {
  const hex = `#${rawHex}`;
  return { hex, name, ...rgbHsl(hex) };
});
const exactNames = new Map(preparedNames.map((entry) => [entry.hex, entry.name]));
const ntcCache = new Map<string, string>();

export function getNtcColorName(value: string) {
  const hex = normalizeHex(value);
  const exact = exactNames.get(hex);
  if (exact) return exact;
  const cached = ntcCache.get(hex);
  if (cached) return cached;
  const sample = rgbHsl(hex);
  let bestName = preparedNames[0]?.name ?? "Unnamed";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of preparedNames) {
    const rgbDistance = sample.rgb.reduce((sum, channel, index) => sum + (channel - candidate.rgb[index]) ** 2, 0);
    const hslDistance = sample.hsl.reduce((sum, channel, index) => sum + (channel - candidate.hsl[index]) ** 2, 0);
    const distance = rgbDistance + hslDistance * 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestName = candidate.name;
    }
  }
  ntcCache.set(hex, bestName);
  return bestName;
}

export function colornamesProposalUrl(value: string) {
  return `https://colornames.org/color/${normalizeHex(value).slice(1).toLowerCase()}`;
}
