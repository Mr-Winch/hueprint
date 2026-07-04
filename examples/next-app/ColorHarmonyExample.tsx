import { useState } from "react";
import { ColorHarmonyPicker } from "../../src/color-harmony-picker";

export function ColorHarmonyExample() {
  const [color, setColor] = useState("#2F80ED");

  return (
    <ColorHarmonyPicker
      value={color}
      onChange={setColor}
      initialRule="analogous"
      initialSwatchCount={5}
    />
  );
}