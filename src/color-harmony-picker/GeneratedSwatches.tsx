"use client";

import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedColor, colorSourceLabel } from "./colorHarmony.types";

type GeneratedSwatchesProps = {
  colors: GeneratedColor[];
  activeHex: string;
  onSelect: (color: GeneratedColor) => void;
  onAddAll: (colors: GeneratedColor[]) => void;
};

export function GeneratedSwatches({ colors, activeHex, onSelect, onAddAll }: GeneratedSwatchesProps) {
  return (
    <div className={styles.swatchBandBlock}>
      <div className={styles.swatchBand} style={{ gridTemplateColumns: `repeat(${Math.max(colors.length, 1)}, minmax(0, 1fr))` }}>
        {colors.map((color) => {
          const active = color.hex.toUpperCase() === activeHex.toUpperCase();
          const title = `${color.hex} - ${colorSourceLabel(color.sourceRule)} - ${color.role}`;
          return (
            <button
              type="button"
              key={color.id}
              className={`${styles.swatchSegment} ${active ? styles.activeSegment : ""}`}
              style={{ background: color.hex }}
              title={title}
              aria-label={title}
              aria-pressed={active}
              onClick={() => onSelect(color)}
            />
          );
        })}
      </div>
      <button
        type="button"
        className={styles.addBandColor}
        disabled={!colors.length}
        aria-label="Add all generated colors to saved palette"
        title="Add all generated colors"
        onClick={() => onAddAll(colors)}
      >
        <svg className={styles.addAllSvgIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.75 4.5L4.5 3.75H10.5L11.25 4.5V10.5L10.5 11.25H4.5L3.75 10.5V4.5ZM5.25 5.25V9.75H9.75V5.25H5.25ZM13.5 3.75L12.75 4.5V10.5L13.5 11.25H19.5L20.25 10.5V4.5L19.5 3.75H13.5ZM14.25 9.75V5.25H18.75V9.75H14.25ZM17.25 20.25H15.75V17.25H12.75V15.75H15.75V12.75H17.25V15.75H20.25V17.25H17.25V20.25ZM4.5 12.75L3.75 13.5V19.5L4.5 20.25H10.5L11.25 19.5V13.5L10.5 12.75H4.5ZM5.25 18.75V14.25H9.75V18.75H5.25Z" />
        </svg>
      </button>
    </div>
  );
}

