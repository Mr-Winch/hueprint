import { recipeMetadata as generatedMetadata } from "./recipeMetadata.generated";
import { PaletteRecipe } from "./colorHarmony.types";

export type RecipeMetadata = {
  id: PaletteRecipe;
  currentName: string;
  displayName: string;
  category: string;
  character: string;
  description: string;
};

export const recipeMetadata = generatedMetadata as readonly RecipeMetadata[];
export const recipeMetadataById = new Map(recipeMetadata.map((item) => [item.id, item]));
