"use client";

import styles from "./ColorHarmonyPicker.module.css";
import { RecipeCategory, recipeCategories } from "./colorHarmony.recipes";
import { PaletteRecipe, paletteRecipeLabels, paletteRecipeOrder } from "./colorHarmony.types";

type PaletteRecipeSelectorProps = {
  value: PaletteRecipe;
  onChange: (recipe: PaletteRecipe) => void;
  dimmed?: boolean;
};

const categoryOrder: RecipeCategory[] = ["tonal", "accent", "spectrum", "contrast", "systems", "vibrant", "harmony", "darkLuminous", "temperature"];
const categoryLabels: Record<RecipeCategory, string> = {
  tonal: "Tonal",
  accent: "Accent",
  spectrum: "Spectrum",
  contrast: "Contrast",
  systems: "Systems",
  vibrant: "Vibrant",
  harmony: "Harmony",
  darkLuminous: "Dark & Luminous",
  temperature: "Temperature",
};

const categorizedRecipes = categoryOrder.map((category) => ({
  category,
  recipes: paletteRecipeOrder.filter(
    (recipe): recipe is Exclude<PaletteRecipe, "none"> => recipe !== "none" && recipeCategories[recipe] === category,
  ),
}));

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
        <option value="none">{paletteRecipeLabels.none}</option>
        {categorizedRecipes.map(({ category, recipes }) => (
          <optgroup key={category} label={categoryLabels[category]}>
            {recipes.map((recipe) => (
              <option key={recipe} value={recipe}>
                {paletteRecipeLabels[recipe]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
