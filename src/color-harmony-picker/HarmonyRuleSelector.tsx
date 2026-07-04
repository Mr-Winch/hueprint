import styles from "./ColorHarmonyPicker.module.css";
import { HarmonyRule, harmonyRuleLabels, harmonyRuleOrder } from "./colorHarmony.types";

type HarmonyRuleSelectorProps = {
  value: HarmonyRule;
  onChange: (rule: HarmonyRule) => void;
};

const hiddenRuleNames: HarmonyRule[] = ["tint", "shade", "tone"];
type VisibleHarmonyRule = Exclude<HarmonyRule, "tint" | "shade" | "tone">;
const visibleHarmonyRules = harmonyRuleOrder.filter((rule): rule is VisibleHarmonyRule => !hiddenRuleNames.includes(rule));

export function HarmonyRuleSelector({ value, onChange }: HarmonyRuleSelectorProps) {
  return (
    <div className={styles.field}>
      <label htmlFor="harmony-rule">Harmony rule</label>
      <select
        id="harmony-rule"
        className={styles.select}
        value={visibleHarmonyRules.includes(value as VisibleHarmonyRule) ? value : "analogous"}
        onChange={(event) => onChange(event.target.value as HarmonyRule)}
      >
        {visibleHarmonyRules.map((rule) => (
          <option key={rule} value={rule}>
            {harmonyRuleLabels[rule]}
          </option>
        ))}
      </select>
    </div>
  );
}