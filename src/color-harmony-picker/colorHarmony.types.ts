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
  none: "None",
  warmArc: "Warm Arc",
  coolArc: "Cool Arc",
  spotAccent: "Spot Accent",
  editorialContrast: "Editorial Contrast",
  brightSwitch: "Bright Switch",
  softNatural: "Soft Natural",
  neutralMatch: "Neutral Match",
  tonalFriends: "Tonal Friends",
  softDotAccent: "Soft Dot Accent",
  threePointAccent: "Three-Point Accent",
  dustAccent: "Dust Accent",
  friendlyContrast: "Friendly Contrast",
  seededShades: "Seeded Shades",
  cleanUi: "Clean UI",
  boldPop: "Bold Pop",
  mutedEditorial: "Muted Editorial",
  luxuryNeutral: "Luxury Neutral",
  techDigital: "Tech Digital",
  warmHospitality: "Warm Hospitality",
  highContrast: "High Contrast",
  gradientFriendly: "Gradient Friendly",
  monochromePlusAccent: "Monochrome Plus Accent",
};

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
