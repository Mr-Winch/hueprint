"use client";

import { PointerEvent, useState } from "react";
import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedColor } from "./colorHarmony.types";

type SavedPaletteStripProps = {
  colors: GeneratedColor[];
  activeHex: string;
  onSelect: (color: GeneratedColor) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

type DragState = {
  id: string;
  hasMoved: boolean;
};

export function SavedPaletteStrip({ colors, activeHex, onSelect, onRemove, onReorder }: SavedPaletteStripProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const draggingId = dragState?.id ?? null;

  function moveDraggingColor(toIndex: number) {
    if (!draggingId) return;
    const fromIndex = colors.findIndex((color) => color.id === draggingId);
    if (fromIndex >= 0 && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
      setDragState({ id: draggingId, hasMoved: true });
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-palette-index]");
    const toIndex = Number(target?.dataset.paletteIndex);
    if (Number.isFinite(toIndex)) moveDraggingColor(toIndex);
  }

  function stopDragging() {
    setDragState(null);
  }

  return (
    <div className={styles.paletteStrip} onPointerMove={handlePointerMove} onPointerUp={stopDragging} onPointerLeave={stopDragging}>
      {colors.length === 0 ? <div className={styles.paletteEmpty}>No saved colors</div> : null}
      {colors.map((color, index) => {
        const active = color.hex.toUpperCase() === activeHex.toUpperCase();
        return (
          <div
            className={`${styles.paletteItem} ${draggingId === color.id ? styles.paletteItemDragging : ""}`}
            key={color.id}
            data-palette-index={index}
            onPointerDown={() => setDragState({ id: color.id, hasMoved: false })}
            onPointerEnter={() => moveDraggingColor(index)}
          >
            <button
              type="button"
              className={`${styles.paletteColor} ${active ? styles.activePaletteColor : ""}`}
              style={{ background: color.hex }}
              aria-label={`Make ${color.hex} active`}
              onClick={() => {
                if (!dragState?.hasMoved) onSelect(color);
              }}
              title={`${color.hex} - make active`}
            />
            <button
              type="button"
              className={styles.removePaletteColor}
              aria-label={`Remove ${color.hex}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(color.id);
              }}
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}