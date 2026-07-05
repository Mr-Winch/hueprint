"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ActiveColorInfo } from "./ActiveColorInfo";
import { ActiveColorPanel } from "./ActiveColorPanel";
import { ColorHarmonyWheel } from "./ColorHarmonyWheel";
import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedSwatches } from "./GeneratedSwatches";
import { HarmonyOverlay } from "./HarmonyOverlay";
import { HarmonyRuleSelector } from "./HarmonyRuleSelector";
import { PaletteRecipeSelector } from "./PaletteRecipeSelector";
import { SavedPaletteStrip } from "./SavedPaletteStrip";
import { SwatchCountControl } from "./SwatchCountControl";
import {
  clamp,
  CustomHarmonyTransform,
  customHarmonyColors,
  generateHarmonyColors,
  hexToOklch,
  hexToWheelHue,
  isTonalRule,
  makeGeneratedColorFromHex,
  normalizeHue,
  sanitizeHex,
} from "./colorHarmony.math";
import { generatePaletteRecipeColors, paletteRecipeSize } from "./colorHarmony.recipes";
import { generateShades, generateTints, generateTones } from "./colorHarmony.tonal";
import { ColorHarmonyPickerProps, GeneratedColor, HarmonyRule, PaletteRecipe } from "./colorHarmony.types";

function paletteFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `color-harmony-palette-${stamp}.json`;
}

function readPalettePayload(payload: unknown): string[] {
  const rawColors = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { colors?: unknown }).colors)
      ? (payload as { colors: unknown[] }).colors
      : [];

  return rawColors
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && typeof (entry as { hex?: unknown }).hex === "string") return (entry as { hex: string }).hex;
      return "";
    })
    .filter(Boolean);
}


const fixedRuleSwatchCounts: Partial<Record<HarmonyRule, number>> = {
  complementary: 2,
  splitComplementary: 3,
  triadic: 3,
  square: 4,
  rectangleTetradic: 4,
};

function fixedSwatchCountForRule(rule: HarmonyRule, min: number, max: number) {
  const fixedCount = fixedRuleSwatchCounts[rule];
  return fixedCount == null ? null : clamp(fixedCount, min, max);
}
function reorderPalette(colors: GeneratedColor[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= colors.length || toIndex >= colors.length) return colors;
  const next = [...colors];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ColorHarmonyPicker({
  value,
  onChange,
  onGeneratedColorsChange,
  onAddToPalette,
  initialRule = "analogous",
  initialSwatchCount = 5,
  minSwatches = 2,
  maxSwatches = 8,
  showGeometryOverlay = true,
  theme = "light",
  className,
}: ColorHarmonyPickerProps) {
  const [activeHex, setActiveHex] = useState(() => sanitizeHex(value));
  const [rule, setRule] = useState<HarmonyRule>(initialRule);
  const [paletteRecipe, setPaletteRecipe] = useState<PaletteRecipe>("none");
  const [lastHarmonyRule, setLastHarmonyRule] = useState<HarmonyRule>(isTonalRule(initialRule) ? "analogous" : initialRule);
  const [swatchCount, setSwatchCount] = useState(() => clamp(initialSwatchCount, minSwatches, maxSwatches));
  const [fallbackHue, setFallbackHue] = useState(() => hexToWheelHue(value));
  const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>([]);
  const [customTransforms, setCustomTransforms] = useState<CustomHarmonyTransform[]>([
    { dL: 0, c: 1, dH: 0 },
    { dL: 0, c: 1, dH: 30 },
    { dL: 0, c: 1, dH: 180 },
  ]);
  const [customExactPalette, setCustomExactPalette] = useState<GeneratedColor[] | null>(null);
  const [customAnchorHex, setCustomAnchorHex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveHex(sanitizeHex(value));
  }, [value]);

  const activeHue = useMemo(() => hexToWheelHue(activeHex, fallbackHue), [activeHex, fallbackHue]);
  const swatchMax = rule === "custom" ? Math.max(maxSwatches, customTransforms.length, savedPalette.length) : maxSwatches;

  useEffect(() => {
    setFallbackHue(activeHue);
  }, [activeHue]);

  const generatedColors = useMemo(() => {
    if (paletteRecipe !== "none") return generatePaletteRecipeColors(activeHex, paletteRecipe, swatchCount, fallbackHue);
    if (rule === "tint") return generateTints(activeHex, swatchCount);
    if (rule === "shade") return generateShades(activeHex, swatchCount);
    if (rule === "tone") return generateTones(activeHex, swatchCount);
    if (rule === "custom") {
      const transformed = customHarmonyColors(activeHex, customTransforms, fallbackHue);
      if (customExactPalette && customAnchorHex === activeHex.toUpperCase()) {
        const exact = customExactPalette.slice(0, customTransforms.length);
        return customTransforms.length > exact.length ? [...exact, ...transformed.slice(exact.length)] : exact;
      }
      return transformed;
    }
    return generateHarmonyColors(activeHex, rule, swatchCount, fallbackHue);
  }, [activeHex, customAnchorHex, customExactPalette, customTransforms, fallbackHue, paletteRecipe, rule, swatchCount]);

  useEffect(() => {
    onGeneratedColorsChange?.(generatedColors);
  }, [generatedColors, onGeneratedColorsChange]);

  function commitColor(hex: string) {
    const safe = sanitizeHex(hex, activeHex);
    setActiveHex(safe);
    onChange?.(safe);
  }

  function selectGeneratedColor(color: GeneratedColor) {
    commitColor(color.hex);
  }

  function selectHarmonyRule(nextRule: HarmonyRule) {
    const fixedCount = fixedSwatchCountForRule(nextRule, minSwatches, maxSwatches);
    setPaletteRecipe("none");
    setCustomExactPalette(null);
    setCustomAnchorHex(null);
    setLastHarmonyRule(nextRule);
    setRule(nextRule);
    if (fixedCount != null) setSwatchCount(fixedCount);
  }

  function selectPaletteRecipe(nextRecipe: PaletteRecipe) {
    setPaletteRecipe(nextRecipe);
    setCustomExactPalette(null);
    setCustomAnchorHex(null);
    const recipeCount = paletteRecipeSize(nextRecipe);
    if (recipeCount != null) setSwatchCount(clamp(recipeCount, minSwatches, maxSwatches));
  }
  function changeSwatchCount(nextCount: number) {
    const safeMax = rule === "custom" ? Math.max(maxSwatches, customTransforms.length, savedPalette.length, nextCount) : maxSwatches;
    const safeCount = clamp(nextCount, minSwatches, safeMax);
    setSwatchCount(safeCount);
    if (rule !== "custom") return;

    setCustomTransforms((current) => {
      if (safeCount <= current.length) return current.slice(0, safeCount);
      const next = [...current];
      const step = 360 / safeCount;
      while (next.length < safeCount) next.push({ dL: 0, c: 1, dH: normalizeHue(step * next.length) });
      return next;
    });
  }

  const activeGeneratedColor = useMemo(() => {
    const activeSource = paletteRecipe === "none" ? rule : paletteRecipe;
    return generatedColors.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? makeGeneratedColorFromHex(activeSource, 0, activeHex, "anchor", fallbackHue);
  }, [activeHex, fallbackHue, generatedColors, paletteRecipe, rule]);

  const activeColorIsSaved = savedPalette.some((color) => color.hex.toUpperCase() === activeHex.toUpperCase());

  function addToPalette(color: GeneratedColor) {
    setSavedPalette((current) => {
      if (current.some((saved) => saved.hex === color.hex)) return current;
      return [...current, { ...color, id: `saved-${Date.now()}-${color.hex}` }];
    });
    onAddToPalette?.(color);
  }

  function addAllToPalette(colors: GeneratedColor[]) {
    const stamp = Date.now();
    setSavedPalette((current) => {
      const next = [...current];
      colors.forEach((color, index) => {
        if (!next.some((saved) => saved.hex === color.hex)) {
          next.push({ ...color, id: `saved-${stamp}-${index}-${color.hex}` });
          onAddToPalette?.(color);
        }
      });
      return next;
    });
  }

  function customAnchorFromPalette(palette: GeneratedColor[]) {
    return palette.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? palette[0];
  }

  function customTransformsFromPalette(palette: GeneratedColor[], anchorColor: GeneratedColor) {
    const anchorOklch = anchorColor.oklch ?? hexToOklch(anchorColor.hex, activeHue);
    const transforms = palette.map((color) => {
      const oklch = hexToOklch(color.hex, anchorOklch.h);
      return {
        dL: oklch.l - anchorOklch.l,
        c: anchorOklch.c < 0.001 ? 1 : oklch.c / anchorOklch.c,
        dH: normalizeHue(oklch.h - anchorOklch.h),
      };
    });
    while (transforms.length < minSwatches) {
      transforms.push({ dL: 0, c: 1, dH: normalizeHue((360 / minSwatches) * transforms.length) });
    }
    return transforms;
  }

  function exactCustomColorsFromPalette(palette: GeneratedColor[], anchorColor: GeneratedColor) {
    return palette.map((color, index) =>
      makeGeneratedColorFromHex("custom", index, color.hex, color.id === anchorColor.id ? "anchor" : "custom", activeHue)
    );
  }

  function syncCustomRuleToPalette(palette: GeneratedColor[]) {
    const anchorColor = customAnchorFromPalette(palette);
    if (!anchorColor) return;
    const transforms = customTransformsFromPalette(palette, anchorColor);
    const exactPalette = exactCustomColorsFromPalette(palette, anchorColor);
    if (anchorColor.hex.toUpperCase() !== activeHex.toUpperCase()) commitColor(anchorColor.hex);
    setCustomTransforms(transforms);
    setCustomExactPalette(exactPalette);
    setCustomAnchorHex(anchorColor.hex.toUpperCase());
    setSwatchCount(Math.max(minSwatches, transforms.length));
  }

  function applySavedPaletteAsCustomRule() {
    if (!savedPalette.length) return;
    const anchorColor = customAnchorFromPalette(savedPalette);
    const transforms = customTransformsFromPalette(savedPalette, anchorColor);
    const exactPalette = exactCustomColorsFromPalette(savedPalette, anchorColor);
    if (anchorColor.hex.toUpperCase() !== activeHex.toUpperCase()) commitColor(anchorColor.hex);
    setCustomTransforms(transforms);
    setCustomExactPalette(exactPalette);
    setCustomAnchorHex(anchorColor.hex.toUpperCase());
    setLastHarmonyRule("custom");
    setRule("custom");
    setSwatchCount(Math.max(minSwatches, transforms.length));
  }

  function reorderSavedPalette(fromIndex: number, toIndex: number) {
    setSavedPalette((current) => {
      const next = reorderPalette(current, fromIndex, toIndex);
      if (next !== current && rule === "custom") syncCustomRuleToPalette(next);
      return next;
    });
  }

  function removeSavedPaletteColor(id: string) {
    setSavedPalette((current) => {
      const next = current.filter((color) => color.id !== id);
      if (rule === "custom" && next.length) syncCustomRuleToPalette(next);
      return next;
    });
  }

  function clearSavedPalette() {
    setSavedPalette([]);
  }

  function exportPalette() {
    if (!savedPalette.length) return;
    const payload = {
      version: 1,
      source: "color-harmony-picker",
      exportedAt: new Date().toISOString(),
      colors: savedPalette.map((color) => ({ hex: color.hex, role: color.role, sourceRule: color.sourceRule })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = paletteFileName();
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importPalette(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    const payload = JSON.parse(text) as unknown;
    const imported = readPalettePayload(payload).map((hex, index) => {
      const safeHex = sanitizeHex(hex);
      return { ...makeGeneratedColorFromHex("custom", index, safeHex, "custom"), id: `imported-${Date.now()}-${index}-${safeHex}` };
    });

    setSavedPalette((current) => {
      const next = [...current];
      imported.forEach((color) => {
        if (!next.some((saved) => saved.hex === color.hex)) next.push(color);
      });
      return next;
    });
  }

  return (
    <section className={`${styles.picker} ${theme === "dark" ? styles.dark : ""} ${className ?? ""}`}>
      <div className={styles.wheelColumn}>
        <div className={styles.wheelWrap}>
          <ColorHarmonyWheel color={activeHex} hue={activeHue} onChange={commitColor} />
          {showGeometryOverlay ? <HarmonyOverlay colors={generatedColors} activeHex={activeHex} rule={paletteRecipe === "none" ? rule : "custom"} recipeMode={paletteRecipe !== "none"} /> : null}
        </div>
        <ActiveColorInfo hex={activeHex} />
      </div>

      <div className={styles.controlColumn}>
        <ActiveColorPanel activeHex={activeHex} canAddActiveColor={!activeColorIsSaved} onAddActiveColor={() => addToPalette(activeGeneratedColor)} onColorChange={commitColor} onRuleChange={(nextRule) => { setPaletteRecipe("none"); setRule(nextRule); }} />

        <div className={styles.controlRow}>
          <HarmonyRuleSelector value={paletteRecipe === "none" && !isTonalRule(rule) ? rule : lastHarmonyRule} onChange={selectHarmonyRule} dimmed={paletteRecipe !== "none"} />
          <PaletteRecipeSelector value={paletteRecipe} onChange={selectPaletteRecipe} dimmed={paletteRecipe === "none"} />
          <SwatchCountControl value={rule === "custom" ? customTransforms.length : swatchCount} min={minSwatches} max={swatchMax} onChange={changeSwatchCount} />
        </div>

        <GeneratedSwatches colors={generatedColors} activeHex={activeHex} onSelect={selectGeneratedColor} onAddAll={addAllToPalette} />

        <div className={styles.paletteBlock}>
          <div className={styles.paletteHeader}>
            <span>Saved palette</span>
            <div className={styles.paletteTools}>
              <button type="button" className={styles.customRuleButton} onClick={applySavedPaletteAsCustomRule} disabled={!savedPalette.length}>Use palette</button>
              <button type="button" className={styles.squareIconButton} aria-label="Clear saved palette" title="Clear palette" onClick={clearSavedPalette} disabled={!savedPalette.length}>
                <svg className={styles.trashSvgIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" />
                </svg>
              </button>
              <button type="button" className={styles.squareIconButton} aria-label="Import palette" title="Import palette" onClick={() => fileInputRef.current?.click()}><span className={`${styles.toolIcon} ${styles.importIcon}`} aria-hidden="true" /></button>
              <button type="button" className={styles.squareIconButton} aria-label="Export palette" title="Export palette" onClick={exportPalette} disabled={!savedPalette.length}><span className={`${styles.toolIcon} ${styles.exportIcon}`} aria-hidden="true" /></button>
            </div>
          </div>
          <input ref={fileInputRef} className={styles.fileInput} type="file" accept="application/json,.json" onChange={importPalette} />
          <SavedPaletteStrip
            colors={savedPalette}
            activeHex={activeHex}
            onSelect={selectGeneratedColor}
            onRemove={removeSavedPaletteColor}
            onReorder={reorderSavedPalette}
          />
        </div>
      </div>
    </section>
  );
}





