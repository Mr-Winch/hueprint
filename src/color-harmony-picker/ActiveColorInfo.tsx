import styles from "./ColorHarmonyPicker.module.css";
import { hexToHsl, hexToRgb, sanitizeHex } from "./colorHarmony.math";

type ActiveColorInfoProps = {
  hex: string;
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function rgbChannels(hex: string) {
  const rgb = hexToRgb(hex);
  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255),
    raw: rgb,
  };
}

function cmyk(hex: string) {
  const { raw } = rgbChannels(hex);
  const k = 1 - Math.max(raw.r, raw.g, raw.b);
  if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 1 };
  return {
    c: (1 - raw.r - k) / (1 - k),
    m: (1 - raw.g - k) / (1 - k),
    y: (1 - raw.b - k) / (1 - k),
    k,
  };
}

export function ActiveColorInfo({ hex }: ActiveColorInfoProps) {
  const safeHex = sanitizeHex(hex);
  const rgb = rgbChannels(safeHex);
  const hsl = hexToHsl(safeHex);
  const printCmyk = cmyk(safeHex);

  return (
    <dl className={styles.colorInfo}>
      <div>
        <dt>HEX</dt>
        <dd>{safeHex}</dd>
      </div>
      <div>
        <dt>RGB</dt>
        <dd>{rgb.r}, {rgb.g}, {rgb.b}</dd>
      </div>
      <div>
        <dt>CMYK</dt>
        <dd>{percent(printCmyk.c)}, {percent(printCmyk.m)}, {percent(printCmyk.y)}, {percent(printCmyk.k)}</dd>
      </div>
      <div>
        <dt>HSL</dt>
        <dd>{Math.round(hsl.h)}, {percent(hsl.s)}, {percent(hsl.l)}</dd>
      </div>
    </dl>
  );
}