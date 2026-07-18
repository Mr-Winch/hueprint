import { clamp, fitOklchToSrgb, hexToOklch, makeGeneratedColor, makeGeneratedColorFromHex, normalizeHue, sanitizeHex } from "./colorHarmony.math";
import { GeneratedColor, PaletteRecipe } from "./colorHarmony.types";

type LegacyRecipeTransform = {
  dL: number;
  c: number;
  dH: number;
};

export type AdvancedRecipeTransform = {
  base?: true;
  dL?: number;
  L?: number;
  cScale?: number;
  cMin?: number;
  C?: number;
  dH?: number;
  H?: number;
};

export type RecipeTransform = LegacyRecipeTransform | AdvancedRecipeTransform;

export type RecipeCategory = "tonal" | "accent" | "spectrum" | "contrast" | "systems" | "vibrant" | "harmony" | "darkLuminous" | "temperature";

export interface RandomPaletteState {
  seed: string;
  sourceRecipeId: Exclude<PaletteRecipe, "none">;
  sourceCategory: RecipeCategory;
  randomizedTransforms: readonly RecipeTransform[];
  colors: readonly string[];
}

export const recipeCategories: Record<Exclude<PaletteRecipe, "none">, RecipeCategory> = {
  tonalFriends: "tonal",
  quietMono: "tonal",
  luxuryNeutral: "tonal",
  mutedEditorial: "tonal",
  clayEarth: "tonal",
  seededShades: "tonal",
  richTonal: "tonal",
  dustAccent: "accent",
  softDotAccent: "accent",
  minimalAccent: "accent",
  spotAccent: "accent",
  trustSignal: "accent",
  neutralMatch: "accent",
  monochromePlusAccent: "accent",
  brightSwitch: "accent",
  brightAccentPair: "accent",
  softNatural: "spectrum",
  warmHospitality: "spectrum",
  botanicalFresh: "spectrum",
  pastelBloom: "spectrum",
  coolArc: "spectrum",
  gradientFriendly: "spectrum",
  warmArc: "spectrum",
  vividArc: "spectrum",
  retroPop: "contrast",
  friendlyContrast: "contrast",
  threePointAccent: "harmony",
  duotonePoster: "harmony",
  directComplement: "harmony",
  splitComplement: "harmony",
  doubleComplement: "harmony",
  complementaryBridge: "harmony",
  boldPop: "vibrant",
  vividAnalogous: "vibrant",
  chromaticBurst: "vibrant",
  vividTriad: "vibrant",
  highContrast: "contrast",
  vividCounterpoint: "contrast",
  editorialContrast: "systems",
  cleanUi: "systems",
  signalSystem: "systems",
  lightInterfaceSignals: "systems",
  categoricalFive: "systems",
  techDigital: "darkLuminous",
  nightMode: "darkLuminous",
  midnightComplement: "darkLuminous",
  darkWarmSignals: "darkLuminous",
  darkCoolSignals: "darkLuminous",
  neonTriad: "darkLuminous",
  warmAccents: "temperature",
  coolAccents: "temperature",
  warmCoolSplit: "temperature",
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
  { id: "richTonal", transforms: [{"base":true},{"dL":-0.24,"cScale":0.9,"cMin":0.11,"dH":-4},{"dL":-0.12,"cScale":1.05,"cMin":0.14},{"dL":0.16,"cScale":0.95,"cMin":0.12,"dH":4},{"dL":0.3,"cScale":0.55,"cMin":0.08,"dH":8}] },
  { id: "brightAccentPair", transforms: [{"base":true},{"L":0.18,"C":0.035,"dH":0},{"L":0.94,"C":0.025,"dH":0},{"L":0.72,"C":0.21,"dH":150},{"L":0.78,"C":0.2,"dH":205}] },
  { id: "vividArc", transforms: [{"base":true},{"dL":-0.04,"cScale":1.0,"cMin":0.18,"dH":-60},{"dL":0,"cScale":1.0,"cMin":0.2,"dH":-30},{"dL":0.06,"cScale":1.0,"cMin":0.2,"dH":30},{"dL":0.12,"cScale":0.95,"cMin":0.18,"dH":60}] },
  { id: "vividCounterpoint", transforms: [{"base":true},{"L":0.18,"C":0.035,"dH":0},{"L":0.94,"C":0.025,"dH":0},{"L":0.72,"C":0.22,"dH":180},{"L":0.88,"C":0.08,"dH":180}] },
  { id: "lightInterfaceSignals", transforms: [{"base":true},{"L":0.98,"C":0.02,"dH":0},{"L":0.92,"C":0.025,"dH":0},{"L":0.22,"C":0.035,"dH":0},{"L":0.7,"C":0.2,"dH":150},{"L":0.72,"C":0.19,"dH":210}] },
  { id: "categoricalFive", transforms: [{"base":true},{"L":0.68,"C":0.18,"dH":72},{"L":0.7,"C":0.18,"dH":144},{"L":0.66,"C":0.18,"dH":216},{"L":0.72,"C":0.18,"dH":288}] },
  { id: "vividAnalogous", transforms: [{"base":true},{"dL":-0.04,"cScale":1.0,"cMin":0.19,"dH":-70},{"dL":0,"cScale":1.0,"cMin":0.2,"dH":-35},{"dL":0.05,"cScale":1.0,"cMin":0.2,"dH":35},{"dL":0.1,"cScale":0.95,"cMin":0.19,"dH":70}] },
  { id: "chromaticBurst", transforms: [{"base":true},{"L":0.72,"C":0.2,"dH":90},{"L":0.7,"C":0.2,"dH":180},{"L":0.68,"C":0.2,"dH":270},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "vividTriad", transforms: [{"base":true},{"L":0.72,"C":0.21,"dH":120},{"L":0.7,"C":0.21,"dH":240},{"L":0.18,"C":0.03,"dH":0},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "directComplement", transforms: [{"base":true},{"L":0.72,"C":0.21,"dH":180},{"L":0.24,"C":0.08,"dH":0},{"L":0.88,"C":0.08,"dH":180},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "splitComplement", transforms: [{"base":true},{"L":0.72,"C":0.2,"dH":150},{"L":0.72,"C":0.2,"dH":210},{"L":0.22,"C":0.035,"dH":0},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "doubleComplement", transforms: [{"base":true},{"L":0.7,"C":0.19,"dH":60},{"L":0.7,"C":0.2,"dH":180},{"L":0.7,"C":0.19,"dH":240},{"L":0.2,"C":0.03,"dH":0}] },
  { id: "complementaryBridge", transforms: [{"base":true},{"L":0.7,"C":0.18,"dH":145},{"L":0.74,"C":0.21,"dH":180},{"L":0.7,"C":0.18,"dH":215},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "midnightComplement", transforms: [{"L":0.12,"C":0.025,"dH":0},{"L":0.2,"C":0.04,"dH":0},{"base":true},{"L":0.78,"C":0.22,"dH":180},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "darkWarmSignals", transforms: [{"L":0.12,"C":0.025,"dH":0},{"L":0.2,"C":0.04,"dH":0},{"base":true},{"L":0.82,"C":0.18,"H":85},{"L":0.76,"C":0.21,"H":55},{"L":0.68,"C":0.22,"H":25},{"L":0.94,"C":0.025,"H":75}] },
  { id: "darkCoolSignals", transforms: [{"L":0.12,"C":0.025,"dH":0},{"L":0.2,"C":0.04,"dH":0},{"base":true},{"L":0.76,"C":0.19,"H":195},{"L":0.7,"C":0.21,"H":275},{"L":0.72,"C":0.2,"H":330},{"L":0.94,"C":0.025,"H":240}] },
  { id: "neonTriad", transforms: [{"L":0.12,"C":0.025,"dH":0},{"L":0.2,"C":0.04,"dH":0},{"base":true},{"L":0.72,"C":0.23,"dH":120},{"L":0.7,"C":0.23,"dH":240},{"L":0.94,"C":0.025,"dH":0}] },
  { id: "warmAccents", transforms: [{"base":true},{"L":0.18,"C":0.035,"dH":0},{"L":0.82,"C":0.18,"H":85},{"L":0.76,"C":0.21,"H":55},{"L":0.68,"C":0.22,"H":25},{"L":0.94,"C":0.04,"H":75}] },
  { id: "coolAccents", transforms: [{"base":true},{"L":0.18,"C":0.035,"dH":0},{"L":0.76,"C":0.19,"H":195},{"L":0.7,"C":0.21,"H":275},{"L":0.72,"C":0.2,"H":330},{"L":0.94,"C":0.04,"H":240}] },
  { id: "warmCoolSplit", transforms: [{"base":true},{"L":0.74,"C":0.2,"H":55},{"L":0.82,"C":0.18,"H":85},{"L":0.76,"C":0.19,"H":195},{"L":0.72,"C":0.2,"H":315},{"L":0.18,"C":0.035,"dH":0}] },
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

export function resolveRecipeTransform(anchor: { l: number; c: number; h: number }, transform: RecipeTransform) {
  if ("c" in transform) {
    return { l: anchor.l + transform.dL, c: anchor.c * transform.c, h: anchor.h + transform.dH };
  }
  const l = transform.L ?? anchor.l + (transform.dL ?? 0);
  const scaledChroma = anchor.c * (transform.cScale ?? 1);
  const c = transform.C ?? Math.max(scaledChroma, transform.cMin ?? 0);
  const h = transform.H ?? anchor.h + (transform.dH ?? 0);
  return { l: clamp(l, 0.08, 0.96), c: clamp(c, 0.02, 0.34), h: normalizeHue(h) };
}

export function generatePaletteRecipeColors(color: string, recipe: PaletteRecipe, count: number, fallbackHue = 0): GeneratedColor[] {
  if (recipe === "none") return [];
  const definition = recipesById.get(recipe);
  if (!definition) return [];

  const safeBase = sanitizeHex(color);
  const anchor = hexToOklch(safeBase, fallbackHue);
  return transformsForCount(definition.transforms, count).map((transform, index) => {
    if (!("c" in transform) && transform.base) return makeGeneratedColorFromHex(definition.id, index, safeBase, "anchor", anchor.h);
    const oklch = fitOklchToSrgb(resolveRecipeTransform(anchor, transform));
    const legacyAnchor = "c" in transform && index === 0;
    return makeGeneratedColor(definition.id, index, oklch, legacyAnchor ? "anchor" : "recipe");
  });
}

const RANDOM_JITTER: Record<RecipeCategory, readonly [number, number, number]> = {
  tonal: [0.025, 0.08, 6], accent: [0.030, 0.10, 10], spectrum: [0.035, 0.10, 14],
  contrast: [0.040, 0.12, 14], systems: [0.030, 0.08, 10], vibrant: [0.035, 0.12, 14],
  harmony: [0.035, 0.12, 12], darkLuminous: [0.025, 0.10, 10], temperature: [0.025, 0.10, 5],
};

function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
}

function randomCandidateIsValid(colors: GeneratedColor[], baseHex: string, category: RecipeCategory): boolean {
  const hexes = colors.map((color) => color.hex);
  if (!hexes.includes(baseHex) || new Set(hexes).size !== hexes.length) return false;
  const values = colors.map((color) => color.oklch ?? hexToOklch(color.hex));
  const threshold = category === "tonal" ? 0.030 : 0.045;
  for (let index = 0; index < values.length; index += 1) for (let previous = 0; previous < index; previous += 1) {
    const first = values[index]; const second = values[previous]; const a1 = first.c * Math.cos(first.h * Math.PI / 180); const b1 = first.c * Math.sin(first.h * Math.PI / 180); const a2 = second.c * Math.cos(second.h * Math.PI / 180); const b2 = second.c * Math.sin(second.h * Math.PI / 180);
    if (Math.hypot(first.l - second.l, a1 - a2, b1 - b2) < threshold) return false;
  }
  const lightness = values.map((value) => value.l); const structural = ["tonal","accent","contrast","systems","darkLuminous","temperature"].includes(category);
  if (Math.max(...lightness) - Math.min(...lightness) < (structural ? 0.25 : 0.18)) return false;
  if (["vibrant","harmony","darkLuminous","temperature"].includes(category) && values.filter((value) => value.c >= 0.15).length < 2) return false;
  if (category === "darkLuminous" && !(values.some((value) => value.l <= 0.22) && values.some((value) => value.l >= 0.72) && values.some((value) => value.c >= 0.16))) return false;
  return true;
}

export function randomizePaletteRecipeColors(color: string, recipe: Exclude<PaletteRecipe, "none">, category: RecipeCategory, count: number, seed = `${Date.now()}`): RandomPaletteState {
  const definition = recipesById.get(recipe);
  if (!definition) return { seed, sourceRecipeId: recipe, sourceCategory: category, randomizedTransforms: [], colors: [] };
  const baseHex = sanitizeHex(color); const anchor = hexToOklch(baseHex); const source = transformsForCount(definition.transforms, count); const random = seededRandom(seed); const jitter = RANDOM_JITTER[category]; const hasBase = source.some((step) => !("c" in step) && step.base);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const randomized: RecipeTransform[] = []; const generated: GeneratedColor[] = [];
    source.forEach((step, index) => {
      const preserveBase = (!("c" in step) && step.base) || (!hasBase && index === 0);
      if (preserveBase) { randomized.push({ base: true }); generated.push(makeGeneratedColorFromHex(recipe, index, baseHex, "anchor", anchor.h)); return; }
      const resolved = resolveRecipeTransform(anchor, step); const next = { L: clamp(resolved.l + (random() * 2 - 1) * jitter[0], 0.08, 0.96), C: clamp(resolved.c * (1 + (random() * 2 - 1) * jitter[1]), 0.02, 0.34), H: normalizeHue(resolved.h + (random() * 2 - 1) * jitter[2]) }; randomized.push(next); generated.push(makeGeneratedColor(recipe, index, fitOklchToSrgb({ l: next.L, c: next.C, h: next.H }), "recipe"));
    });
    if (randomCandidateIsValid(generated, baseHex, category)) return { seed, sourceRecipeId: recipe, sourceCategory: category, randomizedTransforms: randomized, colors: generated.map((item) => item.hex) };
  }
  const fallback = generatePaletteRecipeColors(baseHex, recipe, count); if (!fallback.some((item) => item.hex === baseHex) && fallback.length) fallback[0] = makeGeneratedColorFromHex(recipe, 0, baseHex, "anchor", anchor.h);
  return { seed, sourceRecipeId: recipe, sourceCategory: category, randomizedTransforms: source, colors: fallback.map((item) => item.hex) };
}
