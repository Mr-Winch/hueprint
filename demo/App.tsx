import { useState } from "react";
import { ColorHarmonyPicker, GeneratedColor } from "../src/color-harmony-picker";

export function ColorHarmonyDemo() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [generatedColors, setGeneratedColors] = useState<GeneratedColor[]>([]);

  return (
    <main className="demoShell">
      <section className="demoIntro" aria-labelledby="demo-title">
        <p className="demoEyebrow">Hueprint</p>
        <h1 id="demo-title">Color Harmony Picker</h1>
        <p>
          A reusable React color harmony tool with radial lightness, geometric harmony rules,
          tonal palettes, custom offset rules, and palette import/export.
        </p>
        <div className="demoMeta" aria-label="Current color and generated count">
          <span style={{ backgroundColor: activeColor }} />
          <strong>{activeColor}</strong>
          <small>{generatedColors.length} generated colors</small>
        </div>
      </section>

      <section className="demoSurface" aria-label="Hueprint interactive demo">
        <ColorHarmonyPicker
          value={activeColor}
          onChange={setActiveColor}
          onGeneratedColorsChange={setGeneratedColors}
          initialRule="analogous"
          initialSwatchCount={5}
        />
      </section>
    </main>
  );
}