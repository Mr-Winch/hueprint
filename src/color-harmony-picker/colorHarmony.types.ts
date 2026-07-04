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
  | "monochromePlusAccent"
  | "pastelBloom"
  | "nightMode"
  | "clayEarth"
  | "trustSignal"
  | "quietMono"
  | "duotonePoster"
  | "retroPop"
  | "botanicalFresh"
  | "minimalAccent"
  | "signalSystem";

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
  warmArc: "Warm Spectrum",
  coolArc: "Cool Spectrum",
  spotAccent: "Signature Accent",
  editorialContrast: "Magazine Contrast",
  brightSwitch: "Bright Pivot",
  softNatural: "Organic Soft",
  neutralMatch: "Balanced Accent",
  tonalFriends: "Tonal Core",
  softDotAccent: "Soft Accent Pair",
  threePointAccent: "Triad Accent",
  dustAccent: "Dusty Accent",
  friendlyContrast: "Friendly Pop",
  seededShades: "Brand Shades",
  cleanUi: "Interface Kit",
  boldPop: "Pop System",
  mutedEditorial: "Quiet Editorial",
  luxuryNeutral: "Luxe Neutral",
  techDigital: "Digital Pulse",
  warmHospitality: "Welcoming Warmth",
  highContrast: "Sharp Contrast",
  gradientFriendly: "Smooth Ramp",
  monochromePlusAccent: "Mono Accent",
  pastelBloom: "Pastel Bloom",
  nightMode: "Night Mode",
  clayEarth: "Clay Earth",
  trustSignal: "Trust Signal",
  quietMono: "Quiet Mono",
  duotonePoster: "Duotone Poster",
  retroPop: "Retro Pop",
  botanicalFresh: "Botanical Fresh",
  minimalAccent: "Minimal Accent",
  signalSystem: "Signal System",
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
  "pastelBloom",
  "nightMode",
  "clayEarth",
  "trustSignal",
  "quietMono",
  "duotonePoster",
  "retroPop",
  "botanicalFresh",
  "minimalAccent",
  "signalSystem",
];

export function colorSourceLabel(source: GeneratedColorSource): string {
  return harmonyRuleLabels[source as HarmonyRule] ?? paletteRecipeLabels[source as PaletteRecipe] ?? source;
}

