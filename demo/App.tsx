import { useEffect, useState } from "react";
import { ColorHarmonyLayout, ColorHarmonyPicker, ColorHarmonyTheme, GeneratedColor } from "../src/color-harmony-picker";

const savedPaletteStorageKey = "hueprint-demo-saved-palette";

function readSavedPalette() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(savedPaletteStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ColorHarmonyDemo() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [theme, setTheme] = useState<ColorHarmonyTheme>("light");
  const [layout, setLayout] = useState<ColorHarmonyLayout>("horizontal");
  const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>(readSavedPalette);

  useEffect(() => {
    window.localStorage.setItem(savedPaletteStorageKey, JSON.stringify(savedPalette));
  }, [savedPalette]);

  return (
    <main className="demoShell" data-theme={theme}>
      <section className="demoIntro" aria-labelledby="demo-title">
        <div className="demoTopline">
          <a className="demoRepoLink" href="https://github.com/Mr-Winch/hueprint">Hueprint on GitHub</a>
          <div className="demoSwitches">
            <div className="themeSwitch layoutSwitch" aria-label="Demo layout">
              <button type="button" aria-pressed={layout === "horizontal"} onClick={() => setLayout("horizontal")}>Horizontal</button>
              <button type="button" aria-pressed={layout === "vertical"} onClick={() => setLayout("vertical")}>Vertical</button>
              <button type="button" aria-pressed={layout === "verticalCompact"} onClick={() => setLayout("verticalCompact")}>V Compact</button>
              <button type="button" aria-pressed={layout === "horizontalCompact"} onClick={() => setLayout("horizontalCompact")}>H Compact</button>
            </div>
            <div className="themeSwitch" aria-label="Demo theme">
              <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
              <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
            </div>
          </div>
        </div>
        <h1 id="demo-title">Color Harmony Picker</h1>
        <p>
          A reusable React color harmony tool with radial lightness, geometric harmony rules,
          tonal palettes, OKLCH palette recipes, custom offset rules, and palette import/export.
        </p>
      </section>

      <section className="demoSurface" data-layout={layout} aria-label="Hueprint interactive demo">
        <ColorHarmonyPicker
          value={activeColor}
          onChange={setActiveColor}
          initialRule="analogous"
          initialSwatchCount={5}
          savedPalette={savedPalette}
          onSavedPaletteChange={setSavedPalette}
          theme={theme}
          layout={layout}
        />
      </section>
    </main>
  );
}
