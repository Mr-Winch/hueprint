import { clamp, fitOklchToSrgb, hexToOklch, makeGeneratedColor, normalizeHue } from "./colorHarmony.math";
import { GeneratedColor, PaletteRecipe } from "./colorHarmony.types";

type RecipeTransform = {
  dL: number;
  c: number;
  dH: number;
};

type RecipeDefinition = {
  id: Exclude<PaletteRecipe, "none">;
  transforms: RecipeTransform[];
};

const recipeDefinitions: RecipeDefinition[] = [
  { id: "warmArc", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.02, c: 0.95, dH: 45 }, { dL: 0.04, c: 1.05, dH: 75 }, { dL: 0.06, c: 1.1, dH: 105 }, { dL: 0.08, c: 1, dH: 135 }, { dL: 0.1, c: 0.85, dH: 155 }] },
  { id: "coolArc", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0, c: 1, dH: -35 }, { dL: 0.01, c: 1.05, dH: -55 }, { dL: 0.02, c: 1, dH: -70 }, { dL: 0.03, c: 0.95, dH: -85 }, { dL: 0.04, c: 0.9, dH: -100 }] },
  { id: "spotAccent", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.22, c: 0.45, dH: 0 }, { dL: 0.38, c: 0.18, dH: 0 }, { dL: -0.02, c: 1.15, dH: -95 }] },
  { id: "editorialContrast", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.28, c: 0.22, dH: 5 }, { dL: 0.18, c: 0.2, dH: 5 }, { dL: -0.04, c: 0.75, dH: 110 }, { dL: 0.12, c: 1.05, dH: 115 }] },
  { id: "brightSwitch", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.36, c: 0.18, dH: 0 }, { dL: -0.01, c: 1.2, dH: -95 }, { dL: 0.34, c: 0.25, dH: 155 }] },
  { id: "softNatural", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.1, c: 0.35, dH: 5 }, { dL: 0.36, c: 0.16, dH: 0 }, { dL: 0.32, c: 0.22, dH: 145 }] },
  { id: "neutralMatch", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.28, c: 0.22, dH: 5 }, { dL: 0.18, c: 0.2, dH: 5 }, { dL: -0.1, c: 1.05, dH: -95 }, { dL: 0.02, c: 1.15, dH: -95 }] },
  { id: "tonalFriends", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.28, c: 0.22, dH: 5 }, { dL: 0.18, c: 0.2, dH: 5 }] },
  { id: "softDotAccent", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.18, c: 0.2, dH: 5 }, { dL: -0.02, c: 0.75, dH: 110 }, { dL: 0.18, c: 0.28, dH: 115 }] },
  { id: "threePointAccent", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.06, c: 1, dH: 125 }, { dL: -0.08, c: 1.05, dH: -95 }] },
  { id: "dustAccent", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.28, c: 0.22, dH: 5 }, { dL: 0.18, c: 0.2, dH: 5 }, { dL: 0.12, c: 1.05, dH: 115 }] },
  { id: "friendlyContrast", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.24, c: 0.95, dH: 0 }, { dL: -0.01, c: 1.15, dH: -95 }, { dL: -0.24, c: 1.05, dH: -95 }] },
  { id: "seededShades", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.28, c: 0.45, dH: -8 }, { dL: 0.12, c: 0.85, dH: 6 }, { dL: -0.22, c: 0.8, dH: 0 }, { dL: 0.34, c: 0.3, dH: 12 }] },
  { id: "cleanUi", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.46, c: 0.04, dH: 0 }, { dL: 0.36, c: 0.12, dH: 0 }, { dL: -0.38, c: 0.18, dH: 0 }, { dL: 0.04, c: 0.85, dH: -85 }, { dL: 0.3, c: 0.08, dH: 0 }] },
  { id: "boldPop", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.04, c: 1.25, dH: 90 }, { dL: -0.02, c: 1.2, dH: -95 }, { dL: 0.12, c: 1.15, dH: 150 }, { dL: -0.18, c: 0.9, dH: 0 }] },
  { id: "mutedEditorial", transforms: [{ dL: 0, c: 0.7, dH: 0 }, { dL: -0.22, c: 0.22, dH: 4 }, { dL: 0.16, c: 0.18, dH: 6 }, { dL: 0.28, c: 0.1, dH: 0 }, { dL: -0.04, c: 0.45, dH: 105 }] },
  { id: "luxuryNeutral", transforms: [{ dL: 0, c: 0.65, dH: 0 }, { dL: -0.32, c: 0.16, dH: 20 }, { dL: -0.12, c: 0.12, dH: 35 }, { dL: 0.2, c: 0.1, dH: 45 }, { dL: 0.08, c: 0.55, dH: 115 }] },
  { id: "techDigital", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.18, c: 0.9, dH: -45 }, { dL: 0.02, c: 1.15, dH: -90 }, { dL: 0.24, c: 0.35, dH: -70 }, { dL: -0.34, c: 0.2, dH: -20 }] },
  { id: "warmHospitality", transforms: [{ dL: 0, c: 0.85, dH: 0 }, { dL: 0.16, c: 0.45, dH: 55 }, { dL: 0.24, c: 0.28, dH: 85 }, { dL: -0.08, c: 0.7, dH: 120 }, { dL: 0.32, c: 0.16, dH: 100 }] },
  { id: "highContrast", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.42, c: 0.35, dH: 0 }, { dL: 0.42, c: 0.2, dH: 0 }, { dL: -0.05, c: 1.15, dH: 180 }, { dL: 0.3, c: 0.12, dH: 180 }] },
  { id: "gradientFriendly", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: 0.03, c: 0.98, dH: 24 }, { dL: 0.06, c: 0.95, dH: 48 }, { dL: 0.09, c: 0.9, dH: 72 }, { dL: 0.12, c: 0.85, dH: 96 }] },
  { id: "monochromePlusAccent", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.22, c: 0.8, dH: 0 }, { dL: 0.18, c: 0.55, dH: 0 }, { dL: 0.34, c: 0.25, dH: 0 }, { dL: -0.03, c: 1.05, dH: 180 }] },
  { id: "pastelBloom", transforms: [{ dL: 0, c: 0.55, dH: 0 }, { dL: 0.18, c: 0.35, dH: 25 }, { dL: 0.22, c: 0.32, dH: -25 }, { dL: 0.28, c: 0.25, dH: 85 }, { dL: 0.32, c: 0.2, dH: -80 }] },
  { id: "nightMode", transforms: [{ dL: 0, c: 0.95, dH: 0 }, { dL: -0.42, c: 0.22, dH: 0 }, { dL: -0.32, c: 0.16, dH: -20 }, { dL: 0.08, c: 1.1, dH: -90 }, { dL: 0.16, c: 0.7, dH: 120 }] },
  { id: "clayEarth", transforms: [{ dL: 0, c: 0.75, dH: 0 }, { dL: 0.1, c: 0.38, dH: 45 }, { dL: 0.18, c: 0.28, dH: 75 }, { dL: -0.14, c: 0.45, dH: 105 }, { dL: 0.3, c: 0.14, dH: 60 }] },
  { id: "trustSignal", transforms: [{ dL: 0, c: 0.85, dH: 0 }, { dL: -0.18, c: 0.45, dH: -30 }, { dL: 0.18, c: 0.25, dH: 0 }, { dL: 0.04, c: 0.95, dH: -80 }, { dL: 0.34, c: 0.1, dH: 0 }] },
  { id: "quietMono", transforms: [{ dL: 0, c: 0.75, dH: 0 }, { dL: -0.3, c: 0.35, dH: 0 }, { dL: -0.12, c: 0.5, dH: 0 }, { dL: 0.2, c: 0.28, dH: 0 }, { dL: 0.38, c: 0.12, dH: 0 }] },
  { id: "duotonePoster", transforms: [{ dL: 0, c: 1, dH: 0 }, { dL: -0.05, c: 1.05, dH: 180 }, { dL: 0.28, c: 0.3, dH: 0 }, { dL: 0.3, c: 0.28, dH: 180 }, { dL: -0.28, c: 0.4, dH: 0 }] },
  { id: "retroPop", transforms: [{ dL: 0, c: 0.9, dH: 0 }, { dL: 0.08, c: 0.8, dH: 60 }, { dL: 0.12, c: 0.7, dH: 130 }, { dL: -0.1, c: 0.65, dH: -70 }, { dL: 0.26, c: 0.22, dH: 35 }] },
  { id: "botanicalFresh", transforms: [{ dL: 0, c: 0.8, dH: 0 }, { dL: 0.12, c: 0.42, dH: -55 }, { dL: 0.24, c: 0.28, dH: -85 }, { dL: -0.1, c: 0.55, dH: -110 }, { dL: 0.34, c: 0.16, dH: -70 }] },
  { id: "minimalAccent", transforms: [{ dL: 0, c: 0.65, dH: 0 }, { dL: -0.34, c: 0.1, dH: 0 }, { dL: -0.12, c: 0.08, dH: 20 }, { dL: 0.26, c: 0.06, dH: 35 }, { dL: 0.04, c: 1, dH: -95 }] },
  { id: "signalSystem", transforms: [{ dL: 0, c: 0.85, dH: 0 }, { dL: -0.28, c: 0.25, dH: 0 }, { dL: 0.3, c: 0.12, dH: 0 }, { dL: 0.04, c: 1, dH: -90 }, { dL: 0.1, c: 0.95, dH: 120 }] },
];

const recipesById = new Map(recipeDefinitions.map((recipe) => [recipe.id, recipe]));

export function paletteRecipeSize(recipe: PaletteRecipe): number | null {
  if (recipe === "none") return null;
  return recipesById.get(recipe)?.transforms.length ?? null;
}

function transformsForCount(transforms: RecipeTransform[], count: number): RecipeTransform[] {
  const safeCount = clamp(Math.floor(count), 2, 8);
  if (safeCount <= transforms.length) return transforms.slice(0, safeCount);
  const next = [...transforms];
  while (next.length < safeCount) next.push(transforms[next.length % transforms.length]);
  return next;
}

export function generatePaletteRecipeColors(color: string, recipe: PaletteRecipe, count: number, fallbackHue = 0): GeneratedColor[] {
  if (recipe === "none") return [];
  const definition = recipesById.get(recipe);
  if (!definition) return [];

  const anchor = hexToOklch(color, fallbackHue);
  return transformsForCount(definition.transforms, count).map((transform, index) => {
    const oklch = fitOklchToSrgb({
      l: clamp(anchor.l + transform.dL, 0.08, 0.96),
      c: clamp(anchor.c * transform.c, 0.02, 0.34),
      h: normalizeHue(anchor.h + transform.dH),
    });
    return makeGeneratedColor(definition.id, index, oklch, index === 0 ? "anchor" : "recipe");
  });
}
