import assert from "node:assert/strict";
import test from "node:test";
import {
  analogousHues,
  complementaryHues,
  customHarmonyColors,
  generateHarmonyColors,
  normalizeHue,
  polygonHues,
  rectangleTetradicHues,
  splitComplementaryHues,
  squareHues,
} from "./colorHarmony.math";
import { generatePaletteRecipeColors, paletteRecipeSize, randomizePaletteRecipeColors, resolveRecipeTransform } from "./colorHarmony.recipes";
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

test("custom harmony preserves palette lightness and chroma transforms", () => {
  const colors = customHarmonyColors("#3366FF", [
    { dL: 0, c: 1, dH: 0 },
    { dL: 0.22, c: 0.35, dH: 0 },
    { dL: -0.2, c: 0.65, dH: 0 },
  ]);
  assert.equal(colors.length, 3);
  assert.equal(new Set(colors.map((color) => color.hex)).size, 3);
  assert.deepEqual(colors.map((color) => color.sourceRule), ["custom", "custom", "custom"]);
});

test("tint generation uses the active input color", () => {
  const blueTint = generateTints("#3366FF", 3)[0];
  const redTint = generateTints("#FF3333", 3)[0];
  assert.notEqual(blueTint.hex, redTint.hex);
  assert.equal(blueTint.sourceRule, "tint");
  assert.equal(redTint.role, "tint");
});


test("palette recipes derive OKLCH transforms from the active anchor", () => {
  assert.equal(paletteRecipeSize("spotAccent"), 4);
  assert.equal(paletteRecipeSize("cleanUi"), 6);
  assert.equal(paletteRecipeSize("pastelBloom"), 5);
  assert.equal(paletteRecipeSize("signalSystem"), 5);
  const blue = generatePaletteRecipeColors("#3366FF", "spotAccent", 4);
  const red = generatePaletteRecipeColors("#FF3333", "spotAccent", 4);
  assert.equal(blue.length, 4);
  assert.equal(blue[0].role, "anchor");
  assert.equal(blue[1].sourceRule, "spotAccent");
  assert.notEqual(blue[3].hex, red[3].hex);
});


test("advanced recipe transforms honor precedence and exact base preservation", () => {
  const anchor = { l: 0.5, c: 0.1, h: 350 };
  assert.deepEqual(resolveRecipeTransform(anchor, { L: 0.7, dL: -0.2, C: 0.2, cScale: 0.1, cMin: 0.3, H: 20, dH: 40 }), { l: 0.7, c: 0.2, h: 20 });
  assert.equal(resolveRecipeTransform(anchor, { cScale: 0.5, cMin: 0.12 }).c, 0.12);
  const colors = generatePaletteRecipeColors("#3C75A7", "warmAccents", 6);
  assert.equal(colors[0].hex, "#3C75A7");
  assert.equal(colors.length, 6);
});

test("randomized recipes are seeded, preserve the base, and identify their source", () => {
  const first = randomizePaletteRecipeColors("#7F7F7F", "vividAnalogous", "vibrant", 5, "fixed-seed");
  const second = randomizePaletteRecipeColors("#7F7F7F", "vividAnalogous", "vibrant", 5, "fixed-seed");
  assert.deepEqual(first, second);
  assert.ok(first.colors.includes("#7F7F7F"));
  assert.equal(first.sourceRecipeId, "vividAnalogous");
  assert.equal(first.sourceCategory, "vibrant");
});