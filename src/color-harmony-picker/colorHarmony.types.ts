export type HarmonyRule =
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "splitComplementary"
  | "triadic"
  | "square"
  | "rectangleTetradic"
  | "polygon"
  | "tint"
  | "shade"
  | "tone"
  | "custom";

export type PaletteRecipe =
  | "none"
  | "warmArc"
  | "coolArc"
  | "spotAccent"
  | "editorialContrast"
  | "brightSwitch"
  | "softNatural"
  | "neutralMatch"
  | "tonalFriends"
  | "softDotAccent"
  | "threePointAccent"
  | "dustAccent"
  | "friendlyContrast"
  | "seededShades"
  | "cleanUi"
  | "boldPop"
  | "mutedEditorial"
  | "luxuryNeutral"
  | "techDigital"
  | "warmHospitality"
  | "highContrast"
  | "gradientFriendly"
  | "monochromePlusAccent";

export type GeneratedColorRole = "anchor" | "harmony" | "tint" | "shade" | "tone" | "custom" | "recipe";
export type GeneratedColorSource = HarmonyRule | Exclude<PaletteRecipe, "none">;
export type ColorHarmonyTheme = "light" | "dark";

export interface GeneratedColor {
  id: string;
  hex: string;
  oklch?: {
    l: number;
    c: number;
    h: number;
  };
  hue: number;
  role: GeneratedColorRole;
  sourceRule: GeneratedColorSource;
  locked?: boolean;
}

export interface ColorHarmonyPickerProps {
  value: string;
  onChange?: (color: string) => void;
  onGeneratedColorsChange?: (colors: GeneratedColor[]) => void;
  onAddToPalette?: (color: GeneratedColor) => void;
  initialRule?: HarmonyRule;
  initialSwatchCount?: number;
  minSwatches?: number;
  maxSwatches?: number;
  showGeometryOverlay?: boolean;
  theme?: ColorHarmonyTheme;
  className?: string;
}

export const harmonyRuleLabels: Record<HarmonyRule, string> = {
  monochromatic: "Monochromatic",
  analogous: "Analogous",
  complementary: "Complementary",
  splitComplementary: "Split Complementary",
  triadic: "Triadic",
  square: "Square",
  rectangleTetradic: "Rectangle / Tetradic",
  polygon: "Polygon / Equidistant",
  tint: "Tint",
  shade: "Shade",
  tone: "Tone",
  custom: "Custom",
};

export const harmonyRuleOrder: HarmonyRule[] = [
  "monochromatic",
  "analogous",
  "complementary",
  "splitComplementary",
  "triadic",
  "square",
  "rectangleTetradic",
  "polygon",
  "tint",
  "shade",
  "tone",
  "custom",
];

export const paletteRecipeLabels: Record<PaletteRecipe, string> = {
  none: "No recipe",
  warmArc: "Warm Brand Arc",
  coolArc: "Cool Brand Arc",
  spotAccent: "Anchor + Soft Neutrals + Accent",
  editorialContrast: "Editorial Neutrals + Contrast Accents",
  brightSwitch: "Bright Neutral + Switch Accent",
  softNatural: "Soft Natural Neutrals",
  neutralMatch: "Neutral Match + Cool Accent",
  tonalFriends: "Anchor + Neutral Companions",
  softDotAccent: "Soft Neutrals + Gentle Accent",
  threePointAccent: "Three-Point Accent System",
  dustAccent: "Dusty Editorial Accent",
  friendlyContrast: "Friendly Contrast Pair",
  seededShades: "Seeded Shades + Highlights",
  cleanUi: "Clean UI Role Palette",
  boldPop: "Bold Pop Accent Set",
  mutedEditorial: "Muted Editorial System",
  luxuryNeutral: "Luxury Neutral + Accent",
  techDigital: "Tech Digital Contrast",
  warmHospitality: "Warm Hospitality Palette",
  highContrast: "High Contrast UI Roles",
  gradientFriendly: "Gradient-Friendly Ramp",
  monochromePlusAccent: "Monochrome + Opposite Accent",
};

export function isPaletteRecipeSource(source: GeneratedColorSource): source is Exclude<PaletteRecipe, "none"> {
  return source in paletteRecipeLabels;
}

export const paletteRecipeOrder: PaletteRecipe[] = [
  "none",
  "warmArc",
  "coolArc",
  "spotAccent",
  "editorialContrast",
  "brightSwitch",
  "softNatural",
  "neutralMatch",
  "tonalFriends",
  "softDotAccent",
  "threePointAccent",
  "dustAccent",
  "friendlyContrast",
  "seededShades",
  "cleanUi",
  "boldPop",
  "mutedEditorial",
  "luxuryNeutral",
  "techDigital",
  "warmHospitality",
  "highContrast",
  "gradientFriendly",
  "monochromePlusAccent",
];

export function colorSourceLabel(source: GeneratedColorSource): string {
  return harmonyRuleLabels[source as HarmonyRule] ?? paletteRecipeLabels[source as PaletteRecipe] ?? source;
}

