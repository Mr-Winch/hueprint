import { useState } from "react";
import { ColorHarmonyPicker, ColorHarmonyTheme } from "../src/color-harmony-picker";

export function ColorHarmonyDemo() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [theme, setTheme] = useState<ColorHarmonyTheme>("light");

  return (
    <main className="demoShell" data-theme={theme}>
      <section className="demoIntro" aria-labelledby="demo-title">
        <div className="demoTopline">
          <p className="demoEyebrow">Hueprint</p>
          <div className="themeSwitch" aria-label="Demo theme">
            <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
            <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
          </div>
        </div>
        <h1 id="demo-title">Color Harmony Picker</h1>
        <p>
          A reusable React color harmony tool with radial lightness, geometric harmony rules,
          tonal palettes, custom offset rules, and palette import/export.
        </p>
      </section>

      <section className="demoSurface" aria-label="Hueprint interactive demo">
        <ColorHarmonyPicker
          value={activeColor}
          onChange={setActiveColor}
          initialRule="analogous"
          initialSwatchCount={5}
          theme={theme}
        />
      </section>
    </main>
  );
}