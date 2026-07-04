"use client";

import styles from "./ColorHarmonyPicker.module.css";
import { PaletteRecipe, paletteRecipeLabels, paletteRecipeOrder } from "./colorHarmony.types";

type PaletteRecipeSelectorProps = {
  value: PaletteRecipe;
  onChange: (recipe: PaletteRecipe) => void;
  dimmed?: boolean;
};

export function PaletteRecipeSelector({ value, onChange, dimmed = false }: PaletteRecipeSelectorProps) {
  return (
    <div className={`${styles.field} ${dimmed ? styles.dimmedField : ""}`}>
      <label htmlFor="palette-recipe">Palette recipe</label>
      <select
        id="palette-recipe"
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as PaletteRecipe)}
      >
        {paletteRecipeOrder.map((recipe) => (
          <option key={recipe} value={recipe}>
            {paletteRecipeLabels[recipe]}
          </option>
        ))}
      </select>
    </div>
  );
}

