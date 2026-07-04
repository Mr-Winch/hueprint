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
        <span className={styles.addAllIcon} aria-hidden="true">
          <span className={styles.miniPlusIcon} />
          <span className={styles.miniPlusIcon} />
        </span>
      </button>
    </div>
  );
}
