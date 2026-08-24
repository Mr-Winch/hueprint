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
  | "signalSystem"
  | "richTonal"
  | "brightAccentPair"
  | "vividArc"
  | "vividCounterpoint"
  | "lightInterfaceSignals"
  | "categoricalFive"
  | "vividAnalogous"
  | "chromaticBurst"
  | "vividTriad"
  | "directComplement"
  | "splitComplement"
  | "doubleComplement"
  | "complementaryBridge"
  | "midnightComplement"
  | "darkWarmSignals"
  | "darkCoolSignals"
  | "neonTriad"
  | "warmAccents"
  | "coolAccents"
  | "warmCoolSplit"
  | "backgroundPop"
  | "darkBackdropPunch"
  | "lightBackdropPunch"
  | "electricForeground"
  | "posterOnColor"
  | "spotlightContrast"
  | "acidCabaret"
  | "tropicalVoltage"
  | "ultravioletCitrus"
  | "coralCobaltClash"
  | "cyberBazaar"
  | "carnivalClash"
  | "semanticCore"
  | "semanticLight"
  | "semanticDark"
  | "financialSignals"
  | "dataStates"
  | "editorialStates";

export type GeneratedColorRole = "anchor" | "harmony" | "tint" | "shade" | "tone" | "custom" | "recipe";
export type GeneratedColorSource = HarmonyRule | Exclude<PaletteRecipe, "none">;
export type ColorHarmonyTheme = "light" | "dark";
export type ColorHarmonyLayout = "horizontal" | "vertical" | "verticalCompact" | "horizontalCompact";
export type SavedPaletteInput = string | GeneratedColor;

export interface SavedPaletteCollection {
  id: string;
  name: string;
  colors: SavedPaletteInput[];
}

export type CommunityColorNameResolver = (hex: string) => Promise<string | null>;

export interface GeneratedColor {
  id: string;
  hex: string;
  name?: string;
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
  savedPalette?: SavedPaletteInput[];
  initialSavedPalette?: SavedPaletteInput[];
  onSavedPaletteChange?: (colors: GeneratedColor[]) => void;
  savedPalettes?: SavedPaletteCollection[];
  initialSavedPalettes?: SavedPaletteCollection[];
  onSavedPalettesChange?: (palettes: SavedPaletteCollection[]) => void;
  resolveCommunityColorName?: CommunityColorNameResolver;
  onApplyPalette?: (colors: GeneratedColor[]) => void;
  initialRule?: HarmonyRule;
  initialSwatchCount?: number;
  minSwatches?: number;
  maxSwatches?: number;
  showGeometryOverlay?: boolean;
  theme?: ColorHarmonyTheme;
  layout?: ColorHarmonyLayout;
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
  warmArc: "Expansive Spectrum",
  coolArc: "Cohesive Spectrum",
  spotAccent: "Focused Accent",
  editorialContrast: "Editorial Hierarchy",
  brightSwitch: "Vivid Pivot",
  softNatural: "Gentle Harmony",
  neutralMatch: "Structured Accent",
  tonalFriends: "Essential Tonal",
  softDotAccent: "Subtle Accent Pair",
  threePointAccent: "Energetic Triad",
  dustAccent: "Muted Highlight",
  friendlyContrast: "Playful Contrast",
  seededShades: "Extended Brand Scale",
  cleanUi: "Interface Essentials",
  boldPop: "High-Energy Mix",
  mutedEditorial: "Restrained Editorial",
  luxuryNeutral: "Refined Neutral",
  techDigital: "Electric Interface",
  warmHospitality: "Soft Welcome",
  highContrast: "Sharp Contrast",
  gradientFriendly: "Progressive Ramp",
  monochromePlusAccent: "Mono Accent",
  pastelBloom: "Airy Pastels",
  nightMode: "Dark Interface",
  clayEarth: "Grounded Tones",
  trustSignal: "Trust Signal",
  quietMono: "Soft Monochrome",
  duotonePoster: "Opposing Duotone",
  retroPop: "Eclectic Vintage",
  botanicalFresh: "Organic Range",
  minimalAccent: "Minimal Accent",
  signalSystem: "Multi-Signal System",
  richTonal: "Rich Tonal",
  brightAccentPair: "Bright Accent Pair",
  vividArc: "Vivid Arc",
  vividCounterpoint: "Vivid Counterpoint",
  lightInterfaceSignals: "Light Interface Signals",
  categoricalFive: "Categorical Five",
  vividAnalogous: "Vivid Analogous",
  chromaticBurst: "Chromatic Burst",
  vividTriad: "Vivid Triad",
  directComplement: "Direct Complement",
  splitComplement: "Split Complement",
  doubleComplement: "Double Complement",
  complementaryBridge: "Complementary Bridge",
  midnightComplement: "Midnight Complement",
  darkWarmSignals: "Dark Warm Signals",
  darkCoolSignals: "Dark Cool Signals",
  neonTriad: "Neon Triad",
  warmAccents: "Warm Accents",
  coolAccents: "Cool Accents",
  warmCoolSplit: "Warm-Cool Split",
  backgroundPop: "Background Pop",
  darkBackdropPunch: "Dark Backdrop Punch",
  lightBackdropPunch: "Light Backdrop Punch",
  electricForeground: "Electric Foreground",
  posterOnColor: "Poster on Color",
  spotlightContrast: "Chromatic Spotlight",
  acidCabaret: "Acid Cabaret",
  tropicalVoltage: "Tropical Voltage",
  ultravioletCitrus: "Ultraviolet Citrus",
  coralCobaltClash: "Coral–Cobalt Clash",
  cyberBazaar: "Cyber Bazaar",
  carnivalClash: "Carnival Clash",
  semanticCore: "Semantic Core",
  semanticLight: "Semantic on Light",
  semanticDark: "Semantic on Dark",
  financialSignals: "Financial Signals",
  dataStates: "Data States",
  editorialStates: "Editorial States",
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
  "richTonal",
  "brightAccentPair",
  "vividArc",
  "vividCounterpoint",
  "lightInterfaceSignals",
  "categoricalFive",
  "vividAnalogous",
  "chromaticBurst",
  "vividTriad",
  "directComplement",
  "splitComplement",
  "doubleComplement",
  "complementaryBridge",
  "midnightComplement",
  "darkWarmSignals",
  "darkCoolSignals",
  "neonTriad",
  "warmAccents",
  "coolAccents",
  "warmCoolSplit",
  "backgroundPop",
  "darkBackdropPunch",
  "lightBackdropPunch",
  "electricForeground",
  "posterOnColor",
  "spotlightContrast",
  "acidCabaret",
  "tropicalVoltage",
  "ultravioletCitrus",
  "coralCobaltClash",
  "cyberBazaar",
  "carnivalClash",
  "semanticCore",
  "semanticLight",
  "semanticDark",
  "financialSignals",
  "dataStates",
  "editorialStates",
];

export function colorSourceLabel(source: GeneratedColorSource): string {
  return harmonyRuleLabels[source as HarmonyRule] ?? paletteRecipeLabels[source as PaletteRecipe] ?? source;
}

