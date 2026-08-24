import styles from "./ColorHarmonyPicker.module.css";
import { ColorNames } from "./colorNames";

export function ColorNameTooltip({ hex, names, instruction }: { hex: string; names?: ColorNames; instruction?: string }) {
  return (
    <span className={styles.colorTooltip} role="tooltip">
      <strong>{hex}</strong>
      <span><b>NTC Library:</b> <em>{names?.ntc ?? "Loading…"}</em></span>
      <span><b>Colornames.org:</b>{" "}
        <em>{names?.communityStatus === "unnamed" ? "Name this color ↗" : names?.community ?? "Loading…"}</em>
      </span>
      {instruction ? <small>{instruction}</small> : null}
    </span>
  );
}
