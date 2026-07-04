"use client";

import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedColor, harmonyRuleLabels } from "./colorHarmony.types";

type GeneratedSwatchesProps = {
  colors: GeneratedColor[];
  activeHex: string;
  onSelect: (color: GeneratedColor) => void;
  onAdd: (color: GeneratedColor) => void;
  onAddAll: (colors: GeneratedColor[]) => void;
};

export function GeneratedSwatches({ colors, activeHex, onSelect, onAdd, onAddAll }: GeneratedSwatchesProps) {
  const activeColor = colors.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? colors[0];

  return (
    <div className={styles.swatchBandBlock}>
      <div className={styles.swatchBand} style={{ gridTemplateColumns: `repeat(${Math.max(colors.length, 1)}, minmax(0, 1fr))` }}>
        {colors.map((color) => {
          const active = color.hex.toUpperCase() === activeHex.toUpperCase();
          const title = `${color.hex} - ${harmonyRuleLabels[color.sourceRule]} - ${color.role}`;
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
              onContextMenu={(event) => {
                event.preventDefault();
                onAdd(color);
              }}
            />
          );
        })}
      </div>
      <button
        type="button"
        className={styles.addBandColor}
        disabled={!activeColor}
        aria-label="Add selected color to saved palette"
        title="Add selected color"
        onClick={() => activeColor && onAdd(activeColor)}
      >
        <span className={`${styles.toolIcon} ${styles.plusIcon}`} aria-hidden="true" />
      </button>
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