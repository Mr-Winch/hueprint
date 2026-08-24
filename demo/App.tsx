import { useEffect, useState } from "react";
import { ColorHarmonyLayout, ColorHarmonyPicker, ColorHarmonyTheme, GeneratedColor, SavedPaletteCollection } from "../src/color-harmony-picker";

const savedPaletteStorageKey = "hueprint-demo-saved-palette";
const savedPalettesStorageKey = "hueprint-demo-saved-palettes";

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

function readSavedPalettes(): SavedPaletteCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(savedPalettesStorageKey) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed as SavedPaletteCollection[] : [];
  } catch { return []; }
}

export function ColorHarmonyDemo() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [theme, setTheme] = useState<ColorHarmonyTheme>("light");
  const [layout, setLayout] = useState<ColorHarmonyLayout>("horizontal");
  const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>(readSavedPalette);
  const [savedPalettes, setSavedPalettes] = useState<SavedPaletteCollection[]>(readSavedPalettes);

  useEffect(() => {
    window.localStorage.setItem(savedPaletteStorageKey, JSON.stringify(savedPalette));
  }, [savedPalette]);
  useEffect(() => { window.localStorage.setItem(savedPalettesStorageKey, JSON.stringify(savedPalettes)); }, [savedPalettes]);

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
        <h1 id="demo-title">HuePrint React 1.6</h1>
        <p>
          A reusable React color harmony tool with radial lightness, geometric harmony rules,
          visual harmony and recipe browsers, reusable palette management, color naming, and GPL/JSON exchange.
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
          savedPalettes={savedPalettes}
          onSavedPalettesChange={setSavedPalettes}
          theme={theme}
          layout={layout}
        />
      </section>
    </main>
  );
}
