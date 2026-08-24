"use client";

import { useRef } from "react";
import styles from "./ColorHarmonyPicker.module.css";
import { sanitizeHex } from "./colorHarmony.math";
import { SavedPaletteCollection } from "./colorHarmony.types";
import { useCloseChooserOnEscape } from "./useCloseChooserOnEscape";

export function SavedPalettesSelector({ palettes, activeId, chooserName, onLoad, onDelete }: { palettes: SavedPaletteCollection[]; activeId?: string; chooserName: string; onLoad: (palette: SavedPaletteCollection) => void; onDelete: (id: string) => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useCloseChooserOnEscape(detailsRef);
  const selected = palettes.find((palette) => palette.id === activeId);
  return (
    <div className={`${styles.field} ${styles.chooserField}`}>
      <label>Saved Palettes</label>
      <details className={styles.chooser} ref={detailsRef} name={chooserName}>
        <summary>{selected?.name ?? "Choose saved palette"}</summary>
        <div className={styles.chooserPanel}>
          <p className={styles.chooserSupport}>Choose a saved palette to load into Current Palette.</p>
          {palettes.length ? <div className={styles.recipeChooserGrid}>{palettes.map((palette) => {
            const colors = palette.colors.map((color) => sanitizeHex(typeof color === "string" ? color : color.hex));
            return <div className={`${styles.chooserCard} ${palette.id === activeId ? styles.chooserCardSelected : ""}`} key={palette.id}>
              <button type="button" className={styles.savedPaletteLoad} onClick={() => { onLoad(palette); detailsRef.current?.removeAttribute("open"); }}>
                <span className={styles.cardPreview}>{colors.map((color, index) => <span key={`${color}-${index}`} style={{ background: color }} />)}</span>
                <strong>{palette.name}</strong><em>{colors.length} saved {colors.length === 1 ? "color" : "colors"}</em><small>Load into Current Palette for editing or application.</small>
              </button>
              <button type="button" className={styles.savedPaletteDelete} aria-label={`Delete saved palette ${palette.name}`} title={`Delete ${palette.name}`} onClick={() => onDelete(palette.id)}>×</button>
            </div>;
          })}</div> : <p className={styles.emptyChooser}>No saved palettes yet. Save the Saved Swatches to create one.</p>}
        </div>
      </details>
    </div>
  );
}
