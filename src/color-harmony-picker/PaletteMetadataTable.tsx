import styles from "./ColorHarmonyPicker.module.css";
import { ColorNames, colornamesProposalUrl } from "./colorNames";
import { hexToHsl, hexToOklch, hexToRgb } from "./colorHarmony.math";
import { GeneratedColor } from "./colorHarmony.types";

function percent(value: number) { return `${Math.round(value * 100)}%`; }
function rgb(hex: string) {
  const value = hexToRgb(hex);
  return { r: Math.round(value.r * 255), g: Math.round(value.g * 255), b: Math.round(value.b * 255), raw: value };
}
function cmyk(hex: string) {
  const value = rgb(hex).raw;
  const k = 1 - Math.max(value.r, value.g, value.b);
  if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 1 };
  return { c: (1 - value.r - k) / (1 - k), m: (1 - value.g - k) / (1 - k), y: (1 - value.b - k) / (1 - k), k };
}

export function PaletteMetadataTable({ colors, namesByHex }: { colors: GeneratedColor[]; namesByHex: Record<string, ColorNames> }) {
  return (
    <div className={styles.metadataWrap}>
      <table className={styles.metadataTable} style={{ minWidth: `${Math.max(420, 118 + colors.length * 66)}px` }}>
        <thead><tr><th scope="col">Format</th><th scope="col">Parts</th>{colors.map((color, index) => <th scope="col" key={color.id}>{index === 0 ? "Active" : index + 1}</th>)}</tr></thead>
        <tbody>
          <tr className={styles.metadataSection}><th scope="row">HEX</th><td />{colors.map((color) => {
            const names = namesByHex[color.hex.toUpperCase()];
            return <td key={color.id}><strong className={styles.hexValue}>{color.hex}</strong><em>{names?.ntc ?? "Loading…"}</em>{names?.communityStatus === "unnamed" ? <a href={colornamesProposalUrl(color.hex)} target="_blank" rel="noreferrer"><em>Name this color ↗</em></a> : <em>{names?.community ?? "Loading…"}</em>}</td>;
          })}</tr>
          <tr className={styles.metadataSection}><th scope="row">RGB</th><td>R<br />G<br />B</td>{colors.map((color) => { const value = rgb(color.hex); return <td key={color.id}>{value.r}<br />{value.g}<br />{value.b}</td>; })}</tr>
          <tr className={styles.metadataSection}><th scope="row">CMYK</th><td>C<br />M<br />Y<br />K</td>{colors.map((color) => { const value = cmyk(color.hex); return <td key={color.id}>{percent(value.c)}<br />{percent(value.m)}<br />{percent(value.y)}<br />{percent(value.k)}</td>; })}</tr>
          <tr className={styles.metadataSection}><th scope="row">HSL</th><td>H<br />S<br />L</td>{colors.map((color) => { const value = hexToHsl(color.hex); return <td key={color.id}>{Math.round(value.h)}°<br />{percent(value.s)}<br />{percent(value.l)}</td>; })}</tr>
          <tr className={styles.metadataSection}><th scope="row">OKLCH</th><td>L<br />C<br />H</td>{colors.map((color) => { const value = color.oklch ?? hexToOklch(color.hex); return <td key={color.id}>{value.l.toFixed(3)}<br />{value.c.toFixed(3)}<br />{Math.round(value.h)}°</td>; })}</tr>
        </tbody>
      </table>
    </div>
  );
}
