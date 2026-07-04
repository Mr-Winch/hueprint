import assert from "node:assert/strict";
import test from "node:test";
import {
  analogousHues,
  complementaryHues,
  generateHarmonyColors,
  normalizeHue,
  polygonHues,
  rectangleTetradicHues,
  splitComplementaryHues,
  squareHues,
} from "./colorHarmony.math";
import { generateTints } from "./colorHarmony.tonal";

test("normalizes hue angles into [0, 360)", () => {
  assert.equal(normalizeHue(-30), 330);
  assert.equal(normalizeHue(390), 30);
});

test("generates polygon hues from direct 360 / N spacing", () => {
  assert.deepEqual(polygonHues(210, 3), [210, 330, 90]);
  assert.deepEqual(polygonHues(210, 4), [210, 300, 30, 120]);
  assert.deepEqual(polygonHues(210, 5), [210, 282, 354, 66, 138]);
});

test("keeps fixed harmony rules distinct from polygon spacing", () => {
  assert.deepEqual(complementaryHues(45, 2), [45, 225]);
  assert.deepEqual(splitComplementaryHues(45, 3), [45, 195, 255]);
  assert.deepEqual(squareHues(10), [10, 100, 190, 280]);
  assert.deepEqual(rectangleTetradicHues(10, 60), [10, 70, 190, 250]);
});

test("generates analogous hues around the anchor", () => {
  assert.deepEqual(analogousHues(100, 3), [70, 100, 130]);
  assert.deepEqual(analogousHues(350, 5), [310, 330, 350, 10, 30]);
});

test("triadic expansion adds tonal variants instead of polygon points", () => {
  const colors = generateHarmonyColors("#3366FF", "triadic", 5);
  const hues = colors.map((color) => Math.round(color.hue));
  assert.deepEqual(hues, [225, 345, 105, 345, 105]);
});

test("tint generation uses the active input color", () => {
  const blueTint = generateTints("#3366FF", 3)[0];
  const redTint = generateTints("#FF3333", 3)[0];
  assert.notEqual(blueTint.hex, redTint.hex);
  assert.equal(blueTint.sourceRule, "tint");
  assert.equal(redTint.role, "tint");
});
