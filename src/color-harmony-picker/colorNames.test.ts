import assert from "node:assert/strict";
import test from "node:test";
import { colornamesProposalUrl, getNtcColorName } from "./colorNames";

test("uses the complete offline NTC library for exact and nearest names", () => {
  assert.equal(getNtcColorName("#FFFFFF"), "White");
  assert.equal(getNtcColorName("#FF0000"), "Red");
  assert.ok(getNtcColorName("#2F80ED").length > 0);
});

test("creates exact Colornames.org proposal links", () => {
  assert.equal(colornamesProposalUrl("#2F80ED"), "https://colornames.org/color/2f80ed");
});
