import { sanitizeHex } from "./colorHarmony.math";
import { GeneratedColor } from "./colorHarmony.types";

export type ParsedPaletteColor = { hex: string; name?: string };
export type ParsedPalette = { name?: string; colors: ParsedPaletteColor[]; format: "gpl" | "json" };

function uniqueColors(colors: ParsedPaletteColor[]) {
  const seen = new Set<string>();
  return colors.filter((color) => {
    if (seen.has(color.hex)) return false;
    seen.add(color.hex);
    return true;
  });
}

function parseGpl(text: string): ParsedPalette {
  const colors: ParsedPaletteColor[] = [];
  let name: string | undefined;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line === "GIMP Palette" || line.startsWith("Columns:")) continue;
    if (line.startsWith("Name:")) {
      name = line.slice(5).trim() || undefined;
      continue;
    }
    const match = line.match(/^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})(?:\s+(.+))?$/);
    if (!match) continue;
    const channels = match.slice(1, 4).map(Number);
    if (!channels.every((channel) => channel >= 0 && channel <= 255)) continue;
    const hex = `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    colors.push({ hex, name: match[4]?.trim() || undefined });
  }
  return { name, colors: uniqueColors(colors), format: "gpl" };
}

function jsonColors(payload: unknown): ParsedPaletteColor[] {
  const values = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { colors?: unknown }).colors)
      ? (payload as { colors: unknown[] }).colors
      : [];
  return values.flatMap((entry) => {
    const rawHex = typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as { hex?: unknown }).hex : undefined;
    if (typeof rawHex !== "string" || !/^#?(?:[\da-f]{3}|[\da-f]{6})$/i.test(rawHex.trim())) return [];
    const rawName = entry && typeof entry === "object" ? (entry as { name?: unknown }).name : undefined;
    return [{ hex: sanitizeHex(rawHex), name: typeof rawName === "string" && rawName.trim() ? rawName.trim() : undefined }];
  });
}

export function parsePaletteText(text: string): ParsedPalette {
  if (text.trimStart().startsWith("GIMP Palette")) return parseGpl(text);
  const payload = JSON.parse(text) as unknown;
  const name = payload && typeof payload === "object" && typeof (payload as { name?: unknown }).name === "string"
    ? (payload as { name: string }).name.trim() || undefined
    : undefined;
  return { name, colors: uniqueColors(jsonColors(payload)), format: "json" };
}

function safeGplName(name: string) {
  return name.replace(/[\r\n\t]+/g, " ").trim() || "HuePrint Palette";
}

export function paletteToGpl(colors: Array<Pick<GeneratedColor, "hex"> & { name?: string }>, name = "HuePrint Saved Swatches", columns = 8) {
  const lines = ["GIMP Palette", `Name: ${safeGplName(name)}`, `Columns: ${Math.max(1, Math.min(64, Math.floor(columns)))}`, "#"];
  colors.forEach((color, index) => {
    const hex = sanitizeHex(color.hex);
    const [red, green, blue] = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
    const label = safeGplName(color.name ?? `HuePrint ${String(index + 1).padStart(2, "0")} ${hex}`);
    lines.push(`${String(red).padStart(3)} ${String(green).padStart(3)} ${String(blue).padStart(3)}\t${label}`);
  });
  return `${lines.join("\n")}\n`;
}

export function paletteToJson(colors: GeneratedColor[], name = "HuePrint Saved Swatches") {
  return JSON.stringify({
    version: 2,
    source: "hueprint-react",
    name,
    exportedAt: new Date().toISOString(),
    colors: colors.map((color) => ({ hex: color.hex, name: color.name, role: color.role, sourceRule: color.sourceRule })),
  }, null, 2);
}
