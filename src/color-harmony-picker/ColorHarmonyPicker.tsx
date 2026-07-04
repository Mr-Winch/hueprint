"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ActiveColorInfo } from "./ActiveColorInfo";
import { ActiveColorPanel } from "./ActiveColorPanel";
import { ColorHarmonyWheel } from "./ColorHarmonyWheel";
import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedSwatches } from "./GeneratedSwatches";
import { HarmonyOverlay } from "./HarmonyOverlay";
import { HarmonyRuleSelector } from "./HarmonyRuleSelector";
import { SavedPaletteStrip } from "./SavedPaletteStrip";
import { SwatchCountControl } from "./SwatchCountControl";
import {
  clamp,
  customHarmonyColors,
  generateHarmonyColors,
  hexToWheelHue,
  isTonalRule,
  makeGeneratedColorFromHex,
  normalizeHue,
  sanitizeHex,
} from "./colorHarmony.math";
import { generateShades, generateTints, generateTones } from "./colorHarmony.tonal";
import { ColorHarmonyPickerProps, GeneratedColor, HarmonyRule } from "./colorHarmony.types";

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
  const [lastHarmonyRule, setLastHarmonyRule] = useState<HarmonyRule>(isTonalRule(initialRule) ? "analogous" : initialRule);
  const [swatchCount, setSwatchCount] = useState(() => clamp(initialSwatchCount, minSwatches, maxSwatches));
  const [fallbackHue, setFallbackHue] = useState(() => hexToWheelHue(value));
  const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>([]);
  const [customOffsets, setCustomOffsets] = useState<number[]>([0, 30, 180]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveHex(sanitizeHex(value));
  }, [value]);

  const activeHue = useMemo(() => hexToWheelHue(activeHex, fallbackHue), [activeHex, fallbackHue]);

  useEffect(() => {
    setFallbackHue(activeHue);
  }, [activeHue]);

  const generatedColors = useMemo(() => {
    if (rule === "tint") return generateTints(activeHex, swatchCount);
    if (rule === "shade") return generateShades(activeHex, swatchCount);
    if (rule === "tone") return generateTones(activeHex, swatchCount);
    if (rule === "custom") return customHarmonyColors(activeHex, customOffsets, fallbackHue);
    return generateHarmonyColors(activeHex, rule, swatchCount, fallbackHue);
  }, [activeHex, customOffsets, fallbackHue, rule, swatchCount]);

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
    setLastHarmonyRule(nextRule);
    setRule(nextRule);
    if (fixedCount != null) setSwatchCount(fixedCount);
  }

  function changeSwatchCount(nextCount: number) {
    const safeCount = clamp(nextCount, minSwatches, maxSwatches);
    setSwatchCount(safeCount);
    if (rule !== "custom") return;

    setCustomOffsets((current) => {
      if (safeCount <= current.length) return current.slice(0, safeCount);
      const next = [...current];
      const step = 360 / safeCount;
      while (next.length < safeCount) next.push(normalizeHue(step * next.length));
      return next;
    });
  }

  const activeGeneratedColor = useMemo(() => generatedColors.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? makeGeneratedColorFromHex(rule, 0, activeHex, "anchor", fallbackHue), [activeHex, fallbackHue, generatedColors, rule]);

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

  function customOffsetsFromPalette(palette: GeneratedColor[]) {
    const offsets = palette.map((color) => normalizeHue(hexToWheelHue(color.hex, activeHue) - activeHue));
    if (!offsets.some((offset) => Math.abs(offset) < 1)) offsets.unshift(0);
    while (offsets.length < minSwatches) {
      offsets.push(normalizeHue((360 / minSwatches) * offsets.length));
    }
    return offsets.slice(0, maxSwatches);
  }

  function syncCustomRuleToPalette(palette: GeneratedColor[]) {
    const offsets = customOffsetsFromPalette(palette);
    setCustomOffsets(offsets);
    setSwatchCount(clamp(offsets.length, minSwatches, maxSwatches));
  }

  function applySavedPaletteAsCustomRule() {
    if (!savedPalette.length) return;
    const offsets = customOffsetsFromPalette(savedPalette);
    setCustomOffsets(offsets);
    setLastHarmonyRule("custom");
    setRule("custom");
    setSwatchCount(clamp(offsets.length, minSwatches, maxSwatches));
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
          {showGeometryOverlay ? <HarmonyOverlay colors={generatedColors} activeHex={activeHex} rule={rule} /> : null}
        </div>
        <ActiveColorInfo hex={activeHex} />
      </div>

      <div className={styles.controlColumn}>
        <ActiveColorPanel activeHex={activeHex} canAddActiveColor={!activeColorIsSaved} onAddActiveColor={() => addToPalette(activeGeneratedColor)} onColorChange={commitColor} onRuleChange={setRule} />

        <div className={styles.controlRow}>
          <HarmonyRuleSelector value={isTonalRule(rule) ? lastHarmonyRule : rule} onChange={selectHarmonyRule} />
          <SwatchCountControl value={rule === "custom" ? customOffsets.length : swatchCount} min={minSwatches} max={maxSwatches} onChange={changeSwatchCount} />
        </div>

        <GeneratedSwatches colors={generatedColors} activeHex={activeHex} onSelect={selectGeneratedColor} onAddAll={addAllToPalette} />

        <div className={styles.paletteBlock}>
          <div className={styles.paletteHeader}>
            <span>Saved palette</span>
            <div className={styles.paletteTools}>
              <button type="button" className={styles.customRuleButton} onClick={applySavedPaletteAsCustomRule} disabled={!savedPalette.length}>Use palette</button>
              <button type="button" className={styles.squareIconButton} aria-label="Clear saved palette" title="Clear palette" onClick={clearSavedPalette} disabled={!savedPalette.length}><span className={`${styles.toolIcon} ${styles.trashIcon}`} aria-hidden="true" /></button>
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