"use client";

import { ChangeEvent, FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { ActiveColorPanel } from "./ActiveColorPanel";
import { ColorHarmonyWheel } from "./ColorHarmonyWheel";
import styles from "./ColorHarmonyPicker.module.css";
import { GeneratedSwatches } from "./GeneratedSwatches";
import { HarmonyOverlay } from "./HarmonyOverlay";
import { HarmonyRuleSelector } from "./HarmonyRuleSelector";
import { PaletteMetadataTable } from "./PaletteMetadataTable";
import { PaletteRecipeSelector } from "./PaletteRecipeSelector";
import { SavedPaletteStrip } from "./SavedPaletteStrip";
import { SavedPalettesSelector } from "./SavedPalettesSelector";
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
import { generatePaletteRecipeColors, paletteRecipeSize, randomizePaletteRecipeColors, RecipeCategory, recipeCategories } from "./colorHarmony.recipes";
import { generateShades, generateTints, generateTones } from "./colorHarmony.tonal";
import { ColorHarmonyPickerProps, GeneratedColor, HarmonyRule, PaletteRecipe, paletteRecipeOrder, SavedPaletteCollection, SavedPaletteInput } from "./colorHarmony.types";
import { paletteToGpl, paletteToJson, parsePaletteText } from "./paletteFiles";
import { useColorNames } from "./useColorNames";

function paletteFileName(extension: "gpl" | "json", name = "HuePrint-Saved-Swatches") {
  const safeName = name.trim().replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "HuePrint-Palette";
  return `${safeName}.${extension}`;
}

function downloadText(text: string, filename: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function normalizeSavedPalette(inputs: SavedPaletteInput[] | undefined, fallbackHue = 0, prefix = "saved"): GeneratedColor[] {
  return (inputs ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      const safeHex = sanitizeHex(entry);
      return { ...makeGeneratedColorFromHex("custom", index, safeHex, "custom", fallbackHue), id: `${prefix}-${index}-${safeHex}` };
    }
    const safeHex = sanitizeHex(entry.hex);
    const hue = entry.hue ?? hexToWheelHue(safeHex, fallbackHue);
    return { ...entry, id: entry.id || `${prefix}-${index}-${safeHex}`, hex: safeHex, hue, oklch: entry.oklch ?? hexToOklch(safeHex, hue), role: entry.role ?? "custom", sourceRule: entry.sourceRule ?? "custom" };
  });
}

function normalizeCollections(palettes: SavedPaletteCollection[] | undefined) {
  return (palettes ?? []).filter((palette) => palette.name.trim() && palette.colors.length).map((palette, index) => ({ ...palette, id: palette.id || `palette-${index}-${palette.name}`, name: palette.name.trim() }));
}

const fixedRuleSwatchCounts: Partial<Record<HarmonyRule, number>> = { complementary: 2, splitComplementary: 3, triadic: 3, square: 4, rectangleTetradic: 4 };

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
  savedPalette: savedPaletteInput,
  initialSavedPalette,
  onSavedPaletteChange,
  savedPalettes: savedPalettesInput,
  initialSavedPalettes,
  onSavedPalettesChange,
  resolveCommunityColorName,
  onApplyPalette,
  initialRule = "analogous",
  initialSwatchCount = 5,
  minSwatches = 2,
  maxSwatches = 16,
  showGeometryOverlay = true,
  theme = "light",
  layout = "horizontal",
  className,
}: ColorHarmonyPickerProps) {
  const [activeHex, setActiveHex] = useState(() => sanitizeHex(value));
  const [rule, setRule] = useState<HarmonyRule>(initialRule);
  const [paletteRecipe, setPaletteRecipe] = useState<PaletteRecipe>("none");
  const [lastHarmonyRule, setLastHarmonyRule] = useState<HarmonyRule>(isTonalRule(initialRule) ? "analogous" : initialRule);
  const [swatchCount, setSwatchCount] = useState(() => clamp(initialSwatchCount, minSwatches, maxSwatches));
  const [fallbackHue, setFallbackHue] = useState(() => hexToWheelHue(value));
  const [internalSavedPalette, setInternalSavedPalette] = useState<GeneratedColor[]>(() => normalizeSavedPalette(initialSavedPalette, hexToWheelHue(value), "initial-saved"));
  const [internalSavedPalettes, setInternalSavedPalettes] = useState<SavedPaletteCollection[]>(() => normalizeCollections(initialSavedPalettes));
  const [selectedSavedPaletteId, setSelectedSavedPaletteId] = useState<string>();
  const [customTransforms, setCustomTransforms] = useState<CustomHarmonyTransform[]>([{ dL: 0, c: 1, dH: 0 }, { dL: 0, c: 1, dH: 30 }, { dL: 0, c: 1, dH: 180 }]);
  const [customExactPalette, setCustomExactPalette] = useState<GeneratedColor[] | null>(null);
  const [customAnchorHex, setCustomAnchorHex] = useState<string | null>(null);
  const [randomColors, setRandomColors] = useState<GeneratedColor[] | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooserName = `hueprint-chooser-${useId().replace(/:/g, "")}`;

  useEffect(() => { setActiveHex(sanitizeHex(value)); }, [value]);

  const savedPaletteIsControlled = savedPaletteInput !== undefined;
  const controlledSavedPalette = useMemo(() => savedPaletteIsControlled ? normalizeSavedPalette(savedPaletteInput, fallbackHue, "controlled-saved") : null, [fallbackHue, savedPaletteInput, savedPaletteIsControlled]);
  const savedPalette = controlledSavedPalette ?? internalSavedPalette;
  const savedPalettesAreControlled = savedPalettesInput !== undefined;
  const savedPalettes = useMemo(() => savedPalettesAreControlled ? normalizeCollections(savedPalettesInput) : internalSavedPalettes, [internalSavedPalettes, savedPalettesAreControlled, savedPalettesInput]);
  const activeHue = useMemo(() => hexToWheelHue(activeHex, fallbackHue), [activeHex, fallbackHue]);
  const cappedRuleMax = rule === "complementary" || rule === "splitComplementary" || rule === "triadic" ? 6 : maxSwatches;
  const swatchMin = rule === "splitComplementary" || rule === "triadic" ? Math.max(3, minSwatches) : minSwatches;
  const swatchMax = paletteRecipe !== "none" ? Math.min(maxSwatches, 8) : rule === "custom" ? Math.max(maxSwatches, customTransforms.length, savedPalette.length) : Math.min(maxSwatches, cappedRuleMax);

  useEffect(() => { setFallbackHue(activeHue); }, [activeHue]);

  const generatedColors = useMemo(() => {
    if (randomColors) return randomColors;
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
  }, [activeHex, customAnchorHex, customExactPalette, customTransforms, fallbackHue, paletteRecipe, randomColors, rule, swatchCount]);

  useEffect(() => { onGeneratedColorsChange?.(generatedColors); }, [generatedColors, onGeneratedColorsChange]);
  const namesByHex = useColorNames([...generatedColors, ...savedPalette].map((color) => color.hex), resolveCommunityColorName);

  function commitColor(hex: string) {
    const safe = sanitizeHex(hex, activeHex);
    setRandomColors(null);
    setActiveHex(safe);
    onChange?.(safe);
  }

  function selectHarmonyRule(nextRule: HarmonyRule) {
    const fixedCount = fixedSwatchCountForRule(nextRule, minSwatches, maxSwatches);
    setRandomColors(null); setPaletteRecipe("none"); setCustomExactPalette(null); setCustomAnchorHex(null); setSelectedSavedPaletteId(undefined); setLastHarmonyRule(nextRule); setRule(nextRule);
    if (fixedCount != null) setSwatchCount(fixedCount);
  }

  function selectPaletteRecipe(nextRecipe: PaletteRecipe) {
    setRandomColors(null); setPaletteRecipe(nextRecipe); setCustomExactPalette(null); setCustomAnchorHex(null); setSelectedSavedPaletteId(undefined);
    const recipeCount = paletteRecipeSize(nextRecipe);
    if (recipeCount != null) setSwatchCount(clamp(recipeCount, minSwatches, maxSwatches));
  }

  function randomizePalette(category: string) {
    const candidates = paletteRecipeOrder.filter((recipe): recipe is Exclude<PaletteRecipe, "none"> => recipe !== "none" && (category === "all" || recipeCategories[recipe] === category));
    if (!candidates.length) return;
    const recipe = paletteRecipe !== "none" && candidates.includes(paletteRecipe) ? paletteRecipe : candidates[Math.floor(Math.random() * candidates.length)];
    const count = clamp(paletteRecipeSize(recipe) ?? swatchCount, minSwatches, maxSwatches);
    const randomized = randomizePaletteRecipeColors(activeHex, recipe, recipeCategories[recipe] as RecipeCategory, count);
    const colors = randomized.colors.map((hex, index) => makeGeneratedColorFromHex(recipe, index, hex, index === 0 ? "anchor" : "recipe", fallbackHue));
    setPaletteRecipe(recipe); setSwatchCount(colors.length); setRandomColors(colors); setCustomExactPalette(null); setCustomAnchorHex(null); setSelectedSavedPaletteId(undefined);
  }

  function changeSwatchCount(nextCount: number) {
    setRandomColors(null);
    const safeMax = rule === "custom" ? Math.max(maxSwatches, customTransforms.length, savedPalette.length, nextCount) : maxSwatches;
    const safeCount = clamp(nextCount, minSwatches, safeMax);
    setSwatchCount(safeCount);
    if (rule !== "custom") return;
    setCustomTransforms((current) => {
      if (safeCount <= current.length) return current.slice(0, safeCount);
      const next = [...current]; const step = 360 / safeCount;
      while (next.length < safeCount) next.push({ dL: 0, c: 1, dH: normalizeHue(step * next.length) });
      return next;
    });
  }

  const activeGeneratedColor = useMemo(() => {
    const activeSource = paletteRecipe === "none" ? rule : paletteRecipe;
    return generatedColors.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? makeGeneratedColorFromHex(activeSource, 0, activeHex, "anchor", fallbackHue);
  }, [activeHex, fallbackHue, generatedColors, paletteRecipe, rule]);
  const activeColorIsSaved = savedPalette.some((color) => color.hex.toUpperCase() === activeHex.toUpperCase());

  function commitSavedPalette(nextPalette: GeneratedColor[]) {
    if (!savedPaletteIsControlled) setInternalSavedPalette(nextPalette);
    onSavedPaletteChange?.(nextPalette);
  }
  function updateSavedPalette(updater: (current: GeneratedColor[]) => GeneratedColor[]) {
    const nextPalette = updater(savedPalette);
    if (nextPalette !== savedPalette) commitSavedPalette(nextPalette);
    return nextPalette;
  }
  function commitSavedPalettes(next: SavedPaletteCollection[]) {
    if (!savedPalettesAreControlled) setInternalSavedPalettes(next);
    onSavedPalettesChange?.(next);
  }
  function addToPalette(color: GeneratedColor) {
    const nextColor = { ...color, id: `saved-${Date.now()}-${color.hex}` };
    const next = updateSavedPalette((current) => current.some((saved) => saved.hex === color.hex) ? current : [...current, nextColor]);
    if (next.includes(nextColor)) onAddToPalette?.(color);
  }
  function addAllToPalette(colors: GeneratedColor[]) {
    const stamp = Date.now(); const added: GeneratedColor[] = [];
    updateSavedPalette((current) => {
      const next = [...current];
      colors.forEach((color, index) => { if (!next.some((saved) => saved.hex === color.hex)) { next.push({ ...color, id: `saved-${stamp}-${index}-${color.hex}` }); added.push(color); } });
      return added.length ? next : current;
    });
    added.forEach((color) => onAddToPalette?.(color));
  }

  function customAnchorFromPalette(palette: GeneratedColor[]) { return palette.find((color) => color.hex.toUpperCase() === activeHex.toUpperCase()) ?? palette[0]; }
  function customTransformsFromPalette(palette: GeneratedColor[], anchorColor: GeneratedColor) {
    const anchorOklch = anchorColor.oklch ?? hexToOklch(anchorColor.hex, activeHue);
    const transforms = palette.map((color) => { const oklch = hexToOklch(color.hex, anchorOklch.h); return { dL: oklch.l - anchorOklch.l, c: anchorOklch.c < 0.001 ? 1 : oklch.c / anchorOklch.c, dH: normalizeHue(oklch.h - anchorOklch.h) }; });
    while (transforms.length < minSwatches) transforms.push({ dL: 0, c: 1, dH: normalizeHue((360 / minSwatches) * transforms.length) });
    return transforms;
  }
  function exactCustomColorsFromPalette(palette: GeneratedColor[], anchorColor: GeneratedColor) { return palette.map((color, index) => makeGeneratedColorFromHex("custom", index, color.hex, color.id === anchorColor.id ? "anchor" : "custom", activeHue)); }
  function loadCustomPalette(palette: GeneratedColor[], savedPaletteId?: string) {
    const anchorColor = customAnchorFromPalette(palette);
    if (!anchorColor) return;
    const transforms = customTransformsFromPalette(palette, anchorColor);
    setRandomColors(null); setPaletteRecipe("none"); setCustomTransforms(transforms); setCustomExactPalette(exactCustomColorsFromPalette(palette, anchorColor)); setCustomAnchorHex(anchorColor.hex.toUpperCase()); setLastHarmonyRule("custom"); setRule("custom"); setSwatchCount(Math.max(minSwatches, transforms.length)); setSelectedSavedPaletteId(savedPaletteId);
    if (anchorColor.hex.toUpperCase() !== activeHex.toUpperCase()) { setActiveHex(anchorColor.hex); onChange?.(anchorColor.hex); }
  }
  function syncCustomRuleToPalette(palette: GeneratedColor[]) { if (palette.length) loadCustomPalette(palette, selectedSavedPaletteId); }
  function reorderSavedPalette(fromIndex: number, toIndex: number) { const next = updateSavedPalette((current) => reorderPalette(current, fromIndex, toIndex)); if (next !== savedPalette && rule === "custom" && !selectedSavedPaletteId) syncCustomRuleToPalette(next); }
  function removeSavedPaletteColor(id: string) { const next = updateSavedPalette((current) => { const updated = current.filter((color) => color.id !== id); return updated.length === current.length ? current : updated; }); if (next !== savedPalette && rule === "custom" && next.length && !selectedSavedPaletteId) syncCustomRuleToPalette(next); }

  function loadSavedPaletteCollection(palette: SavedPaletteCollection) { loadCustomPalette(normalizeSavedPalette(palette.colors, activeHue, palette.id), palette.id); }
  function savePaletteCollection(event: FormEvent) {
    event.preventDefault();
    const name = paletteName.trim();
    if (!name || !savedPalette.length) return;
    const existing = savedPalettes.find((palette) => palette.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    const entry: SavedPaletteCollection = { id: existing?.id ?? `palette-${Date.now()}`, name, colors: savedPalette };
    commitSavedPalettes(existing ? savedPalettes.map((palette) => palette.id === existing.id ? entry : palette) : [...savedPalettes, entry]);
    setSelectedSavedPaletteId(entry.id); setPaletteName(""); setSaveDialogOpen(false);
  }
  function deleteSavedPaletteCollection(id: string) {
    const palette = savedPalettes.find((item) => item.id === id);
    if (!palette || !window.confirm(`Delete saved palette “${palette.name}”?`)) return;
    commitSavedPalettes(savedPalettes.filter((item) => item.id !== id));
    if (selectedSavedPaletteId === id) setSelectedSavedPaletteId(undefined);
  }

  function exportPalette(format: "gpl" | "json") {
    if (!savedPalette.length) return;
    const name = savedPalettes.find((palette) => palette.id === selectedSavedPaletteId)?.name ?? "HuePrint Saved Swatches";
    if (format === "gpl") {
      const colors = savedPalette.map((color) => ({ ...color, name: color.name ?? namesByHex[color.hex.toUpperCase()]?.ntc }));
      downloadText(paletteToGpl(colors, name), paletteFileName("gpl", name), "text/plain;charset=utf-8");
    } else downloadText(paletteToJson(savedPalette, name), paletteFileName("json", name), "application/json;charset=utf-8");
  }

  async function importPalette(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    try {
      const parsed = parsePaletteText(await file.text());
      if (!parsed.colors.length) throw new Error("No valid colors were found in this palette.");
      const stamp = Date.now();
      const imported = parsed.colors.map((entry, index) => ({ ...makeGeneratedColorFromHex("custom", index, entry.hex, "custom", fallbackHue), id: `imported-${stamp}-${index}-${entry.hex}`, name: entry.name }));
      updateSavedPalette((current) => { const next = [...current]; imported.forEach((color) => { if (!next.some((saved) => saved.hex === color.hex)) next.push(color); }); return next.length === current.length ? current : next; });
      setImportError("");
    } catch (error) { setImportError(error instanceof Error ? error.message : "The palette could not be imported."); }
  }

  const dark = theme === "dark";
  const compact = layout === "verticalCompact" || layout === "horizontalCompact";
  const layoutClass = styles[layout] ?? styles.horizontal;
  return (
    <section className={`${styles.picker} ${layoutClass} ${dark ? styles.dark : ""} ${className ?? ""}`}>
      <div className={styles.wheelColumn}>
        <div className={styles.wheelWrap}>
          <ColorHarmonyWheel color={activeHex} hue={activeHue} onChange={commitColor} />
          {showGeometryOverlay ? <HarmonyOverlay colors={generatedColors} activeHex={activeHex} rule={paletteRecipe === "none" ? rule : "custom"} recipeMode={paletteRecipe !== "none"} /> : null}
        </div>
      </div>

      <div className={styles.controlColumn}>
        <ActiveColorPanel activeHex={activeHex} canAddActiveColor={!activeColorIsSaved} onAddActiveColor={() => addToPalette(activeGeneratedColor)} onColorChange={commitColor} onRuleChange={(nextRule) => { setRandomColors(null); setPaletteRecipe("none"); setRule(nextRule); }} />
        <div className={styles.controlRow}>
          <HarmonyRuleSelector activeHex={activeHex} chooserName={chooserName} value={paletteRecipe === "none" && !isTonalRule(rule) ? rule : lastHarmonyRule} onChange={selectHarmonyRule} dimmed={paletteRecipe !== "none"} />
          <PaletteRecipeSelector activeHex={activeHex} chooserName={chooserName} value={paletteRecipe} onChange={selectPaletteRecipe} onRandomize={randomizePalette} randomized={Boolean(randomColors)} dimmed={paletteRecipe === "none"} />
          <SavedPalettesSelector palettes={savedPalettes} activeId={selectedSavedPaletteId} chooserName={chooserName} onLoad={loadSavedPaletteCollection} onDelete={deleteSavedPaletteCollection} />
        </div>
        {onApplyPalette ? <button type="button" className={styles.applyButton} onClick={() => onApplyPalette(generatedColors)}>Apply Current Palette</button> : null}
      </div>

      <section className={styles.currentPaletteBlock} aria-labelledby="current-palette-title">
        <div className={styles.sectionHeader}><h2 id="current-palette-title">Current Palette</h2><SwatchCountControl value={rule === "custom" ? customTransforms.length : swatchCount} min={swatchMin} max={swatchMax} onChange={changeSwatchCount} /></div>
        <GeneratedSwatches colors={generatedColors} activeHex={activeHex} onSelect={(color) => commitColor(color.hex)} onAddAll={addAllToPalette} namesByHex={namesByHex} />
        {!compact ? <PaletteMetadataTable colors={generatedColors} namesByHex={namesByHex} /> : null}
      </section>

      <section className={`${styles.paletteBlock} ${styles.savedSwatchesBlock}`} aria-labelledby="saved-swatches-title">
        <div className={styles.paletteHeader}>
          <div><h2 id="saved-swatches-title">Saved Swatches</h2><p>Load these colors as Current Palette before applying them in the host application.</p></div>
          <div className={styles.paletteTools}>
            <button type="button" className={styles.customRuleButton} onClick={() => loadCustomPalette(savedPalette)} disabled={!savedPalette.length}>Use as Current Palette</button>
            <button type="button" className={styles.squareIconButton} aria-label="Save Saved Swatches as a reusable palette" title="Save as reusable palette" onClick={() => setSaveDialogOpen(true)} disabled={!savedPalette.length}><span className={`${styles.toolIcon} ${styles.saveIcon}`} aria-hidden="true" /></button>
            <button type="button" className={styles.squareIconButton} aria-label="Import GPL or JSON palette" title="Import GPL or JSON" onClick={() => fileInputRef.current?.click()}><span className={`${styles.toolIcon} ${styles.importIcon}`} aria-hidden="true" /></button>
            <button type="button" className={styles.squareIconButton} aria-label="Export GPL palette" title="Export GPL for Inkscape" onClick={() => exportPalette("gpl")} disabled={!savedPalette.length}><span className={`${styles.toolIcon} ${styles.exportIcon}`} aria-hidden="true" /></button>
            <button type="button" className={styles.squareIconButton} aria-label="Export HuePrint JSON" title="Export HuePrint JSON" onClick={() => exportPalette("json")} disabled={!savedPalette.length}>JSON</button>
            <button type="button" className={styles.squareIconButton} aria-label="Clear Saved Swatches" title="Clear Saved Swatches" onClick={() => updateSavedPalette((current) => current.length ? [] : current)} disabled={!savedPalette.length}><svg className={styles.trashSvgIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L17.2 18C17.1 20 16.6 21 14 21H10C7.4 21 6.9 20 6.8 18L6 6M4 6H20M8 6L9 3H15L16 6M14 10V17M10 10V17" /></svg></button>
          </div>
        </div>
        <input ref={fileInputRef} className={styles.fileInput} type="file" accept=".gpl,.json,text/plain,application/json" onChange={importPalette} />
        {importError ? <p className={styles.errorMessage} role="alert">{importError}</p> : null}
        <SavedPaletteStrip colors={savedPalette} activeHex={activeHex} onSelect={(color) => commitColor(color.hex)} onRemove={removeSavedPaletteColor} onReorder={reorderSavedPalette} namesByHex={namesByHex} />
      </section>

      {saveDialogOpen ? <div className={styles.dialogBackdrop} role="presentation" onMouseDown={() => setSaveDialogOpen(false)}><form className={styles.saveDialog} role="dialog" aria-modal="true" aria-labelledby="save-palette-title" onSubmit={savePaletteCollection} onMouseDown={(event) => event.stopPropagation()}><h2 id="save-palette-title">Save Palette</h2><p>Save the current Saved Swatches as a reusable palette.</p><label htmlFor="saved-palette-name">Palette name</label><input id="saved-palette-name" autoFocus value={paletteName} onChange={(event) => setPaletteName(event.target.value)} maxLength={64} /><div><button type="button" onClick={() => setSaveDialogOpen(false)}>Cancel</button><button type="submit" disabled={!paletteName.trim()}>Save</button></div></form></div> : null}
      <p className={styles.attribution}>Color naming: NTC by Chirag Mehta · optional community names by Colornames.org</p>
    </section>
  );
}
