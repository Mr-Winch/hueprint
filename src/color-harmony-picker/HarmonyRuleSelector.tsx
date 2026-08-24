"use client";

import { useRef } from "react";
import styles from "./ColorHarmonyPicker.module.css";
import { generateHarmonyColors } from "./colorHarmony.math";
import { HarmonyRule, harmonyRuleLabels } from "./colorHarmony.types";
import { useCloseChooserOnEscape } from "./useCloseChooserOnEscape";

type HarmonyRuleSelectorProps = {
  value: HarmonyRule;
  activeHex: string;
  chooserName: string;
  onChange: (rule: HarmonyRule) => void;
  dimmed?: boolean;
};

const harmonies: Array<{ id: HarmonyRule; count: number; description: string }> = [
  { id: "monochromatic", count: 5, description: "One hue with a balanced light-to-dark range." },
  { id: "analogous", count: 5, description: "Neighboring hues for a calm, cohesive palette." },
  { id: "complementary", count: 2, description: "Opposing hues paired across the wheel." },
  { id: "splitComplementary", count: 3, description: "An anchor plus the two neighbors of its opposite." },
  { id: "triadic", count: 3, description: "Three hue families separated by 120 degrees." },
  { id: "square", count: 4, description: "Four hue families separated by 90 degrees." },
  { id: "rectangleTetradic", count: 4, description: "Two complementary pairs in a rectangular harmony." },
  { id: "polygon", count: 5, description: "Evenly spaces every swatch around the wheel." },
];

export function HarmonyRuleSelector({ value, activeHex, chooserName, onChange, dimmed = false }: HarmonyRuleSelectorProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useCloseChooserOnEscape(detailsRef);
  const currentLabel = value === "custom" ? "Custom palette" : harmonyRuleLabels[value] ?? "Choose harmony";
  return (
    <div className={`${styles.field} ${styles.chooserField} ${dimmed ? styles.dimmedField : ""}`}>
      <label>Harmony</label>
      <details className={styles.chooser} ref={detailsRef} name={chooserName}>
        <summary>{currentLabel}</summary>
        <div className={`${styles.chooserPanel} ${styles.harmonyChooserPanel}`}>
          <p className={styles.chooserSupport}>Choose a geometric relationship for colors generated from the active color.</p>
          <div className={styles.chooserGrid}>
            {harmonies.map((harmony) => {
              const colors = generateHarmonyColors(activeHex, harmony.id, harmony.count);
              const selected = value === harmony.id;
              return (
                <button key={harmony.id} type="button" className={`${styles.chooserCard} ${selected ? styles.chooserCardSelected : ""}`} onClick={() => { onChange(harmony.id); detailsRef.current?.removeAttribute("open"); }} aria-pressed={selected}>
                  <span className={styles.cardPreview}>{colors.map((color) => <span key={color.id} style={{ background: color.hex }} />)}</span>
                  <strong>{harmonyRuleLabels[harmony.id]}</strong>
                  <small>{harmony.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      </details>
    </div>
  );
}
