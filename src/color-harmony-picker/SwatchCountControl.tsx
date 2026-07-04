import styles from "./ColorHarmonyPicker.module.css";

type SwatchCountControlProps = {
  value: number;
  min: number;
  max: number;
  onChange: (count: number) => void;
};

export function SwatchCountControl({ value, min, max, onChange }: SwatchCountControlProps) {
  return (
    <div className={styles.field}>
      <div className={styles.countHeader}>
        <label htmlFor="swatch-count">Swatches</label>
        <output htmlFor="swatch-count">{value}</output>
      </div>
      <input
        id="swatch-count"
        className={styles.range}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
