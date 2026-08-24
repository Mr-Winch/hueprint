import assert from "node:assert/strict";
import test from "node:test";
import { makeGeneratedColorFromHex } from "./colorHarmony.math";
import { paletteToGpl, paletteToJson, parsePaletteText } from "./paletteFiles";

test("imports GIMP Palette files with names and preserves order", () => {
  const parsed = parsePaletteText("GIMP Palette\nName: Brand\nColumns: 8\n#\n 47 128 237\tHero Blue\n255 128   0\tSignal Orange\n47 128 237\tDuplicate\n");
  assert.equal(parsed.format, "gpl");
  assert.equal(parsed.name, "Brand");
  assert.deepEqual(parsed.colors, [
    { hex: "#2F80ED", name: "Hero Blue" },
    { hex: "#FF8000", name: "Signal Orange" },
  ]);
});

test("exports an Inkscape-compatible GPL palette and round-trips its colors", () => {
  const colors = ["#2F80ED", "#FF8000"].map((hex, index) => makeGeneratedColorFromHex("custom", index, hex, "custom"));
  const gpl = paletteToGpl(colors, "HuePrint Test", 8);
  assert.match(gpl, /^GIMP Palette\nName: HuePrint Test\nColumns: 8\n#/);
  assert.deepEqual(parsePaletteText(gpl).colors.map((color) => color.hex), colors.map((color) => color.hex));
});

test("retains compatibility with legacy arrays and HuePrint JSON", () => {
  assert.deepEqual(parsePaletteText('["#abc", "#112233"]').colors.map((color) => color.hex), ["#AABBCC", "#112233"]);
  const colors = [makeGeneratedColorFromHex("custom", 0, "#2F80ED", "custom")];
  assert.deepEqual(parsePaletteText(paletteToJson(colors)).colors.map((color) => color.hex), ["#2F80ED"]);
});

test("ignores invalid GPL channels and malformed rows", () => {
  const parsed = parsePaletteText("GIMP Palette\n300 0 0 Invalid\n12 34 56 Valid\nnot a color\n");
  assert.deepEqual(parsed.colors, [{ hex: "#0C2238", name: "Valid" }]);
});
