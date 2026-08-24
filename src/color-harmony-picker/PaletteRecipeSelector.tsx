"use client";

import { useRef, useState } from "react";
import styles from "./ColorHarmonyPicker.module.css";
import { generatePaletteRecipeColors } from "./colorHarmony.recipes";
import { PaletteRecipe, paletteRecipeLabels } from "./colorHarmony.types";
import { recipeMetadata, recipeMetadataById } from "./recipeMetadata";
import { useCloseChooserOnEscape } from "./useCloseChooserOnEscape";

type PaletteRecipeSelectorProps = {
  value: PaletteRecipe;
  activeHex: string;
  chooserName: string;
  onChange: (recipe: PaletteRecipe) => void;
  onRandomize: (category: string) => void;
  randomized?: boolean;
  dimmed?: boolean;
};

const categoryOrder = ["all", "tonal", "accent", "spectrum", "contrast", "systems", "vibrant", "harmony", "darkLuminous", "temperature", "background", "daring", "semantic"] as const;
const categoryLabels: Record<(typeof categoryOrder)[number], string> = {
  all: "All", tonal: "Tonal", accent: "Accent", spectrum: "Spectrum", contrast: "Contrast", systems: "Systems", vibrant: "Vibrant", harmony: "Harmony", darkLuminous: "Dark & Luminous", temperature: "Temperature", background: "Background & Pop", daring: "Daring", semantic: "Semantic",
};

export function PaletteRecipeSelector({ value, activeHex, chooserName, onChange, onRandomize, randomized = false, dimmed = false }: PaletteRecipeSelectorProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useCloseChooserOnEscape(detailsRef);
  const [category, setCategory] = useState<(typeof categoryOrder)[number]>("all");
  const visible = recipeMetadata.filter((recipe) => recipe.id !== "none" && (category === "all" || recipe.category === category));
  const selectedLabel = value === "none" ? "Choose recipe" : recipeMetadataById.get(value)?.displayName ?? paletteRecipeLabels[value];
  const label = randomized && value !== "none" ? `Randomized · ${selectedLabel}` : selectedLabel;
  return (
    <div className={`${styles.field} ${styles.chooserField} ${dimmed ? styles.dimmedField : ""}`}>
      <label>Palette recipe</label>
      <details className={styles.chooser} ref={detailsRef} name={chooserName}>
        <summary>{label}</summary>
        <div className={styles.chooserPanel}>
          <p className={styles.chooserSupport}>Choose how HuePrint develops colors from your base color.</p>
          <div className={styles.categoryFilters}>
            {categoryOrder.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{categoryLabels[item]}</button>)}
            <button type="button" className={styles.randomizeButton} onClick={() => { onRandomize(category); detailsRef.current?.removeAttribute("open"); }}>Randomize</button>
          </div>
          <div className={styles.recipeChooserGrid}>
            {visible.map((recipe) => {
              const colors = generatePaletteRecipeColors(activeHex, recipe.id, 16);
              const selected = value === recipe.id;
              return (
                <button key={recipe.id} type="button" className={`${styles.chooserCard} ${selected ? styles.chooserCardSelected : ""}`} onClick={() => { onChange(recipe.id); detailsRef.current?.removeAttribute("open"); }} aria-pressed={selected} title={`${recipe.character}\n${recipe.description}`}>
                  <span className={styles.cardPreview}>{colors.map((color) => <span key={color.id} style={{ background: color.hex }} />)}</span>
                  <strong>{recipe.displayName}</strong>
                  <em>{recipe.character}</em>
                  <small>{recipe.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      </details>
    </div>
  );
}
